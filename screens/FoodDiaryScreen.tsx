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

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "meals", user.uid, "entries"),
      where("dateString", "==", today)
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Today's Meals</Text>

      {mealTypes.map((type) => (
        <View key={type} style={{ marginBottom: 25 }}>
          {grouped[type].length > 0 && (
            <DiaryMealCard meal={grouped[type][0]} />
          )}
        </View>
      ))}
    </ScrollView>
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
});
