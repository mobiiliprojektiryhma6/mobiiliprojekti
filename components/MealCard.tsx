import React from "react"
import { View, Text, Button, StyleSheet } from "react-native"
import { Meal } from "../types/Meals"

type Props = {
  meal: Meal
  onAddFood: (mealId: string) => void
  onDeleteFood: (mealId: string, foodId: string) => void
}

export default function MealCard({ meal, onAddFood, onDeleteFood }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.mealTitle}>{meal.type}</Text>

      {meal.foods.length === 0 ? (
        <Text style={styles.emptyText}>No foods added yet</Text>
      ) : (
        meal.foods.map((food) => (
          <View key={food.id} style={styles.foodRow}>
            <Text style={styles.foodText}>
              • {food.name} — {food.grams} g{" "}
              {food.carbs !== undefined ? `(${food.carbs}g carbs)` : ""}
            </Text>
            <Button
              title="Delete"
              onPress={() => onDeleteFood(meal.id, food.id)}
            />
          </View>
        ))
      )}

      <Button title="Add Food" onPress={() => onAddFood(meal.id)} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  mealTitle: {
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 16,
  },
  emptyText: {
    fontStyle: "italic",
    marginBottom: 5,
    color: "#666",
  },
  foodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  foodText: {
    fontSize: 14,
  },
})