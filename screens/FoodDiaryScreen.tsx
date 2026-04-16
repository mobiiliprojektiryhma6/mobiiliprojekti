import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { getAuth } from "firebase/auth";
import DiaryMealCard from "../components/DiaryMealCard";
import { FoodItem } from "../types/FoodItem";
import CarbsPerMealChart from "../components/CarbsPerMealChart";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useTheme } from "../src/theme/ThemeContext";

import { resolveDailyCarbTarget } from "../src/utils/carbTarget";
import GramsPopup from "../components/GramsPopup";
import WeeklyCarbSummary from "../components/WeeklyCarbSummary";

type Meal = {
  id: string;
  mealType: string;
  dateString: string;
  foods: FoodItem[];
  totalEnergy?: number;
  totalCarbohydrates?: number;
  totalProtein?: number;
  totalFat?: number;
  timestamp?: any;
};

const getDayKey = (date = new Date()) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function FoodDiaryScreen() {
  const user = getAuth().currentUser;
  const { theme, styles } = useTheme();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetCarbs, setTargetCarbs] = useState<number | null>(null);
  const [targetReason, setTargetReason] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState(getDayKey());

  const [showGramsPopup, setShowGramsPopup] = useState(false);
  const [foodToAdjust, setFoodToAdjust] = useState<FoodItem | null>(null);

  const [weeklyCarbEntries, setWeeklyCarbEntries] = useState<
    { date: string; carbs: number }[]
  >([]);

  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (route.name !== "FoodDiary") return;

    const selected = route.params?.selectedFavoriteFood;
    const editingFoodId = route.params?.editingFoodId;
    const mealId = route.params?.mealId;

    if (!selected || !editingFoodId || !mealId) return;

    if (meals.length === 0) return;

    if (!user) return;

    // Find the meal
    const mealIndex = meals.findIndex(m => m.id === mealId);
    if (mealIndex === -1) return;

    const meal = meals[mealIndex];

    // Replace the food
    const updatedFoods = meal.foods.map(f =>
      f.id === editingFoodId ? selected : f
    );

    // Recalculate totals
    const totalCarbs = updatedFoods.reduce((sum, f) => sum + (f.carbohydrates ?? 0), 0);
    const totalEnergy = updatedFoods.reduce((sum, f) => sum + (f.energy ?? 0), 0);
    const totalProtein = updatedFoods.reduce((sum, f) => sum + (f.protein ?? 0), 0);
    const totalFat = updatedFoods.reduce((sum, f) => sum + (f.fat ?? 0), 0);

    // Save to Firestore
    const mealRef = doc(db, "meals", user.uid, "entries", mealId);
    updateDoc(mealRef, {
      foods: updatedFoods,
      totalCarbohydrates: totalCarbs,
      totalEnergy,
      totalProtein,
      totalFat
    });

    if (route.name === "FoodDiary") {
      setFoodToAdjust(selected);
      setShowGramsPopup(true);
    }

  }, [route.params, meals, user]);

  useEffect(() => {
    if (!user) return;

    const base = new Date(selectedDate);

    // getDay(): 0 = Sun, 1 = Mon, ..., 6 = Sat
    const day = base.getDay();

    // Convert Sunday (0) to 6, Monday (1) to 0, etc.
    const offsetToMonday = (day + 6) % 7;

    // Find Monday of the selected week
    const monday = new Date(base);
    monday.setDate(base.getDate() - offsetToMonday);

    // Build Mon → Sun
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(getDayKey(d));
    }


    const q = query(
      collection(db, "meals", user.uid, "entries"),
      where("dateString", "in", dates)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data() as Meal);

      const groupedByDay: Record<string, number> = {};
      dates.forEach((d) => (groupedByDay[d] = 0));

      data.forEach((meal) => {
        groupedByDay[meal.dateString] += meal.totalCarbohydrates ?? 0;
      });

      const result = dates
        .slice()       // copy
        .reverse()     // oldest → newest
        .map((d) => ({ date: d, carbs: groupedByDay[d] }));

      setWeeklyCarbEntries(result);
    });

    return unsubscribe;
  }, [user, selectedDate]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "meals", user.uid, "entries"),
      where("dateString", "==", selectedDate)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Meal[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as Meal),
        id: doc.id,
      }));

      setMeals([...data]);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, selectedDate]);

  useEffect(() => {
    const loadTarget = async () => {
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      const resolvedTarget = resolveDailyCarbTarget({
        useManualCarbTarget: userData?.useManualCarbTarget,
        dailyCarbTarget: userData?.dailyCarbTarget,
        weight: userData?.weight,
        height: userData?.height,
      });

      setTargetCarbs(resolvedTarget.target);
      setTargetReason(resolvedTarget.reason ?? null);
    };

    loadTarget();
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const getCarbStatusColor = (carbs: number, target: number | null) => {
    if (target === null) return "#999";

    if (carbs > target) return "#EF4444";
    if (carbs > target * 0.85) return "#FBBF24";
    return "#10B981";
  };


  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];

  const grouped: Record<string, Meal[]> = {
    Breakfast: [],
    Lunch: [],
    Dinner: [],
    Snack: [],
  };

  mealTypes.forEach((type) => {
    grouped[type] = meals.filter((m) => m.mealType === type);
  });

  const dailyTotals = meals.reduce(
    (acc, m) => ({
      carbs: acc.carbs + (m.totalCarbohydrates ?? 0),
      energy: acc.energy + (m.totalEnergy ?? 0),
      protein: acc.protein + (m.totalProtein ?? 0),
      fat: acc.fat + (m.totalFat ?? 0),
    }),
    { carbs: 0, energy: 0, protein: 0, fat: 0 }
  );

  const mealTypeNutrition = mealTypes.reduce((acc, type) => {
    const mealsOfType = grouped[type];

    const totals = mealsOfType.reduce(
      (sum, m) => ({
        carbs: sum.carbs + (m.totalCarbohydrates ?? 0),
        protein: sum.protein + (m.totalProtein ?? 0),
        fat: sum.fat + (m.totalFat ?? 0),
        energy: sum.energy + (m.totalEnergy ?? 0),
      }),
      { carbs: 0, protein: 0, fat: 0, energy: 0 }
    );

    acc[type] = totals;
    return acc;
  }, {} as Record<string, { carbs: number; protein: number; fat: number; energy: number }>);

  const goToPreviousDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(getDayKey(d));
  };

  const goToNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(getDayKey(d));
  };

  const handleGramsSave = async (grams: number) => {
    if (!foodToAdjust || !user) return;

    const multiplier = grams / 100;

    const updatedFood = {
      ...foodToAdjust,
      servingSize: grams,
      carbohydrates: (foodToAdjust.carbohydrates ?? 0) * multiplier,
      protein: (foodToAdjust.protein ?? 0) * multiplier,
      fat: (foodToAdjust.fat ?? 0) * multiplier,
      energy: (foodToAdjust.energy ?? 0) * multiplier,
    };

    const mealId = route.params?.mealId;
    const editingFoodId = route.params?.editingFoodId;
    if (!mealId || !editingFoodId) return;

    const mealIndex = meals.findIndex(m => m.id === mealId);
    if (mealIndex === -1) return;

    const meal = meals[mealIndex];

    const updatedFoods = meal.foods.map(f =>
      f.id === editingFoodId ? updatedFood : f
    );

    const totalCarbs = updatedFoods.reduce((sum, f) => sum + (f.carbohydrates ?? 0), 0);
    const totalEnergy = updatedFoods.reduce((sum, f) => sum + (f.energy ?? 0), 0);
    const totalProtein = updatedFoods.reduce((sum, f) => sum + (f.protein ?? 0), 0);
    const totalFat = updatedFoods.reduce((sum, f) => sum + (f.fat ?? 0), 0);

    const mealRef = doc(db, "meals", user.uid, "entries", mealId);
    await updateDoc(mealRef, {
      foods: updatedFoods,
      totalCarbohydrates: totalCarbs,
      totalEnergy,
      totalProtein,
      totalFat
    });

    setShowGramsPopup(false);
    setFoodToAdjust(null);

    navigation.setParams({
      selectedFavoriteFood: undefined,
      editingFoodId: undefined,
      mealId: undefined
    });
  };


  return (
    <View style={styles.container}>
      <View style={styles.diary_dateRow}>
        <Text style={styles.diary_dateButton} onPress={goToPreviousDay}>
          ◀
        </Text>
        <Text style={styles.diary_dateText}>{selectedDate}</Text>
        <Text style={styles.diary_dateButton} onPress={goToNextDay}>
          ▶
        </Text>
      </View>

      <ScrollView>
        <Text style={styles.header}>Today's Meals</Text>

        <View style={styles.diary_targetCard}>
          <View style={styles.diary_targetHeaderRow}>
            <Text style={styles.diary_targetTitle}>Daily Carb Target</Text>
          </View>

          {targetCarbs !== null ? (
            <>
              <Text
                style={[
                  styles.diary_targetLine,
                  { color: getCarbStatusColor(dailyTotals.carbs, targetCarbs) },
                ]}
              >
                {dailyTotals.carbs.toFixed(1)} / {targetCarbs} g
              </Text>

              <View style={styles.todayChart_progressTrack}>
                <View
                  style={[
                    styles.todayChart_progressFill,
                    {
                      width: `${Math.min((dailyTotals.carbs / targetCarbs) * 100, 100)}%`,
                      backgroundColor: getCarbStatusColor(dailyTotals.carbs, targetCarbs),
                    },
                  ]}
                />
              </View>
            </>
          ) : (
            <Text style={styles.todayChart_infoText}>
              {targetReason ??
                "Missing profile info: add weight and height, or set a custom carb target."}
            </Text>
          )}
        </View>

        <View style={styles.diary_summaryCard}>
          <Text style={styles.diary_summaryTitle}>Daily Totals</Text>

          <View style={styles.diary_summaryGrid}>
            <View style={styles.diary_summaryColumn}>
              <Text style={styles.diary_summaryItem}>
                Carbs: {dailyTotals.carbs.toFixed(1)} g
              </Text>
              <Text style={styles.diary_summaryItem}>
                Protein: {dailyTotals.protein.toFixed(1)} g
              </Text>
            </View>

            <View style={styles.diary_summaryColumn}>
              <Text style={styles.diary_summaryItem}>
                Energy: {dailyTotals.energy.toFixed(0)} kcal
              </Text>
              <Text style={styles.diary_summaryItem}>
                Fat: {dailyTotals.fat.toFixed(1)} g
              </Text>
            </View>
          </View>
        </View>

        <CarbsPerMealChart mealTypeNutrition={mealTypeNutrition} />

        <Text style={styles.diary_summaryTitle}>Weekly Carb Summary</Text>

        <WeeklyCarbSummary data={weeklyCarbEntries} />

        {mealTypes.map((type) => (
          <View key={type} style={{ marginBottom: 25 }}>
            {grouped[type].length > 0 && (
              <>
                <Text style={styles.diary_mealHeader}>{type}</Text>

                {mealTypeNutrition[type].carbs > 0 && (
                  <View style={styles.diary_mealTypeSummaryCard}>
                    <View style={styles.diary_mealTypeSummaryRow}>
                      <Text style={styles.diary_mealTypeSummaryItem}>
                        Carbs: {mealTypeNutrition[type].carbs.toFixed(1)} g
                      </Text>
                      <Text style={styles.diary_mealTypeSummaryItem}>
                        Protein: {mealTypeNutrition[type].protein.toFixed(1)} g
                      </Text>
                    </View>

                    <View style={styles.diary_mealTypeSummaryRow}>
                      <Text style={styles.diary_mealTypeSummaryItem}>
                        Energy: {mealTypeNutrition[type].energy.toFixed(0)} kcal
                      </Text>
                      <Text style={styles.diary_mealTypeSummaryItem}>
                        Fat: {mealTypeNutrition[type].fat.toFixed(1)} g
                      </Text>
                    </View>
                  </View>
                )}

                {grouped[type]
                  .sort((a, b) => {
                    if (a.timestamp && b.timestamp) {
                      return a.timestamp.toMillis() - b.timestamp.toMillis()
                    }
                    return 0
                  })
                  .map((meal, index) => (
                    <DiaryMealCard key={meal.id} meal={meal} index={index + 1} />
                  ))}
              </>
            )}
          </View>
        ))}
      </ScrollView>

      {showGramsPopup && foodToAdjust && (
        <GramsPopup
          food={foodToAdjust}
          onClose={() => setShowGramsPopup(false)}
          onSave={(grams) => handleGramsSave(grams)}
        />
      )}
    </View>
  );
}