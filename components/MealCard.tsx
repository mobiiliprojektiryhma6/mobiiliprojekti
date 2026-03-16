import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { FoodItem } from "../types/FoodItem";

type Props = {
  food: FoodItem;
  onDelete: (foodId: string) => void;
};

export default function MealCard({ food, onDelete }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{food.name}</Text>

      <Text style={styles.nutrition}>Energy: {food.energy} kcal</Text>
      <Text style={styles.nutrition}>Carbs: {food.carbohydrates} g</Text>
      <Text style={styles.nutrition}>Protein: {food.protein} g</Text>
      <Text style={styles.nutrition}>Fat: {food.fat} g</Text>

      <Button title="Delete" onPress={() => onDelete(food.id!)} />
    </View>
  );
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
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  nutrition: {
    fontSize: 14,
  },
});
