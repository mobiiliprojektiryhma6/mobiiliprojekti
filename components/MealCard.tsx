import React from "react"
import { View, Text, Button, StyleSheet } from "react-native"

type Props = {
  food: {
    id: string
    name: string
    amount: string
  }
  onDelete: (foodId: string) => void
}

export default function MealCard({ food, onDelete }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.foodText}>
        • {food.name} — {food.amount}
      </Text>

      <Button title="Delete" onPress={() => onDelete(food.id)} />
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
  foodText: {
    fontSize: 14,
  },
})
