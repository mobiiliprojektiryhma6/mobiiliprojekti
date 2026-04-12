import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { getAuth } from "firebase/auth";
import DiaryMealCard from "../components/DiaryMealCard";
import { FoodItem } from "../types/FoodItem";
import CarbsPerMealChart from "../components/CarbsPerMealChart";
import { useRoute, useNavigation } from "@react-navigation/native";

import { resolveDailyCarbTarget } from "../src/utils/carbTarget";
import GramsPopup from "../components/GramsPopup";

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

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetCarbs, setTargetCarbs] = useState<number | null>(null);
  const [targetReason, setTargetReason] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState(getDayKey());

  const [showGramsPopup, setShowGramsPopup] = useState(false);
  const [foodToAdjust, setFoodToAdjust] = useState<FoodItem | null>(null);


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
    <View style={{ flex: 1 }}>

      <View style={styles.dateRow}>
        <Text style={styles.dateButton} onPress={goToPreviousDay}>◀</Text>
        <Text style={styles.dateText}>{selectedDate}</Text>
        <Text style={styles.dateButton} onPress={goToNextDay}>▶</Text>
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.title}>Today's Meals</Text>

        <View style={styles.targetCard}>
          <View style={styles.targetHeaderRow}>
            <Text style={styles.targetTitle}>Daily Carb Target</Text>
          </View>

          {targetCarbs !== null ? (
            <>
              <Text
                style={[
                  styles.targetLine,
                  { color: getCarbStatusColor(dailyTotals.carbs, targetCarbs) }
                ]}
              >
                {dailyTotals.carbs.toFixed(1)} / {targetCarbs} g
              </Text>

              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((dailyTotals.carbs / targetCarbs) * 100, 100)}%`,
                      backgroundColor: getCarbStatusColor(dailyTotals.carbs, targetCarbs),
                    },
                  ]}
                />
              </View>
            </>
          ) : (
            <Text style={styles.targetMissing}>
              {targetReason ?? "Missing profile info: add weight and height, or set a custom carb target."}
            </Text>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Daily Totals</Text>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryItem}>Carbs: {dailyTotals.carbs.toFixed(1)} g</Text>
              <Text style={styles.summaryItem}>Protein: {dailyTotals.protein.toFixed(1)} g</Text>
            </View>

            <View style={styles.summaryColumn}>
              <Text style={styles.summaryItem}>Energy: {dailyTotals.energy.toFixed(0)} kcal</Text>
              <Text style={styles.summaryItem}>Fat: {dailyTotals.fat.toFixed(1)} g</Text>
            </View>
          </View>
        </View>

        <CarbsPerMealChart mealTypeNutrition={mealTypeNutrition} />

        {mealTypes.map((type) => (
          <View key={type} style={{ marginBottom: 25 }}>
            {grouped[type].length > 0 && (
              <>

                <Text style={styles.mealHeader}>{type}</Text>

                {mealTypeNutrition[type].carbs > 0 && (
                  <View style={styles.mealTypeSummaryCard}>
                    <View style={styles.mealTypeSummaryRow}>
                      <Text style={styles.mealTypeSummaryItem}>
                        Carbs: {mealTypeNutrition[type].carbs.toFixed(1)} g
                      </Text>
                      <Text style={styles.mealTypeSummaryItem}>
                        Protein: {mealTypeNutrition[type].protein.toFixed(1)} g
                      </Text>
                    </View>

                    <View style={styles.mealTypeSummaryRow}>
                      <Text style={styles.mealTypeSummaryItem}>
                        Energy: {mealTypeNutrition[type].energy.toFixed(0)} kcal
                      </Text>
                      <Text style={styles.mealTypeSummaryItem}>
                        Fat: {mealTypeNutrition[type].fat.toFixed(1)} g
                      </Text>
                    </View>
                  </View>
                )}


                {grouped[type]
                  .sort((a, b) => {
                    if (a.timestamp && b.timestamp) {
                      return a.timestamp.toMillis() - b.timestamp.toMillis();
                    }
                    return 0;
                  })
                  .map((meal, index) => (
                    <DiaryMealCard
                      key={meal.id}
                      meal={meal}
                      index={index + 1}
                    />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5F7FD",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  dateButton: {
    fontSize: 22,
    paddingHorizontal: 20,
    color: "#4A90E2",
  },

  dateText: {
    fontSize: 18,
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    marginBottom: 20,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },

  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  summaryColumn: {
    flex: 1,
  },

  summaryItem: {
    fontSize: 14,
    marginBottom: 6,
  },
  targetCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    marginBottom: 16,
  },
  targetHeaderRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 8,
  },
  targetTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  targetLine: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  targetMeta: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
  },
  targetOver: {
    color: "#B00020",
    fontWeight: "600",
  },
  targetMissing: {
    fontSize: 14,
    color: "#B00020",
  },

  mealHeader: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 10,
  },
  mealTypeSummary: {
    fontSize: 13,
    color: "#444",
    marginBottom: 6,
    marginLeft: 4,
  },
  mealTypeSummaryCard: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    marginBottom: 10,
    marginTop: -4,
    marginHorizontal: 4,
  },

  mealTypeSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  mealTypeSummaryItem: {
    fontSize: 12,
    color: "#444",
  },
  progressTrack: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    marginTop: 6,
    marginBottom: 4,
  },

  progressFill: {
    height: 10,
    borderRadius: 6,
  },

});
