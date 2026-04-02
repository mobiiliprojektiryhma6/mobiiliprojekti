import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { getAuth } from "firebase/auth";
import DiaryMealCard from "../components/DiaryMealCard";
import { FoodItem } from "../types/FoodItem";
import { resolveDailyCarbTarget } from "../src/utils/carbTarget";

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
  const [targetSource, setTargetSource] = useState<"manual" | "recommended" | "missing">("missing");
  const [targetReason, setTargetReason] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState(getDayKey());
  
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

      setMeals(data);
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
      setTargetSource(resolvedTarget.source);
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

  const mealTypes = ["Breakfast", "Lunch", "Snack", "Dinner"];

  const grouped: Record<string, Meal[]> = {
    Breakfast: [],
    Lunch: [],
    Snack: [],
    Dinner: [],
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

  const remainingCarbs = targetCarbs !== null ? targetCarbs - dailyTotals.carbs : null;

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
              <Text style={styles.targetLine}>
                {dailyTotals.carbs.toFixed(1)} / {targetCarbs} g
              </Text>
              <Text style={styles.targetMeta}>
                Mode: {targetSource === "manual" ? "Custom" : "Recommended"}
              </Text>
              <Text style={[styles.targetMeta, remainingCarbs !== null && remainingCarbs < 0 && styles.targetOver]}>
                {remainingCarbs !== null && remainingCarbs >= 0
                  ? `${remainingCarbs.toFixed(1)} g left`
                  : `${Math.abs(remainingCarbs ?? 0).toFixed(1)} g over target`}
              </Text>
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

        {mealTypes.map((type) => (
          <View key={type} style={{ marginBottom: 25 }}>
            {grouped[type].length > 0 && (
              <>

                <Text style={styles.mealHeader}>{type}</Text>

    
                {grouped[type].map((meal, index) => (
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
});
