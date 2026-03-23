import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { getAuth } from "firebase/auth";
import DiaryMealCard from "../components/DiaryMealCard";
import { FoodItem } from "../types/FoodItem";

type Meal = {
  id: string;
  mealType: string;
  dateString: string;
  foods: FoodItem[];
  totalEnergy?: number;
  totalCarbohydrates?: number;
  totalProtein?: number;
  totalFat?: number;
};

export default function FoodDiaryScreen() {
  const user = getAuth().currentUser;

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(
  new Date().toISOString().split("T")[0]
);

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

  const goToPreviousDay = () => {
  const d = new Date(selectedDate);
  d.setDate(d.getDate() - 1);
  setSelectedDate(d.toISOString().split("T")[0]);
};

const goToNextDay = () => {
  const d = new Date(selectedDate);
  d.setDate(d.getDate() + 1);
  setSelectedDate(d.toISOString().split("T")[0]);
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
            <DiaryMealCard meal={grouped[type][0]} />
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

});
