import React, { useState } from "react"
import { ScrollView, Text, View, Button, StyleSheet } from "react-native"
import { DiaryDay } from "../types/DiaryDay"
import { Meal } from "../types/Meals"
import { FoodItem } from "../types/FoodItem"
import MealCard from "../components/MealCard"

export default function FoodDiaryScreen() {

  const today = new Date().toISOString().slice(0, 10)

  const initialMeals: Meal[] = [
    { id: "b", type: "Breakfast", foods: [] },
    { id: "s1", type: "Snack", foods: [] },
    { id: "l", type: "Lunch", foods: [] },
    { id: "s2", type: "Snack", foods: [] },
    { id: "d", type: "Dinner", foods: [] },
  ]

  const [diary, setDiary] = useState<DiaryDay>({
    date: today,
    meals: initialMeals
  })

  const handleAddFood = (mealId: string) => {

    const newFood: FoodItem = {
      id: Date.now().toString(),
      name: "Apple",
      energy: 52,
      carbohydrates: 12,
      protein: 0.3,
      fat: 0.2
    }

    const updatedMeals = diary.meals.map((meal) => {
      if (meal.id === mealId) {
        return { ...meal, foods: [...meal.foods, newFood] }
      }
      return meal
    })

    setDiary({ ...diary, meals: updatedMeals })
  }

  const handleDeleteFood = (mealId: string, foodId: string) => {

    const updatedMeals = diary.meals.map((meal) => {
      if (meal.id === mealId) {
        return {
          ...meal,
          foods: meal.foods.filter((food) => food.id !== foodId)
        }
      }
      return meal
    })

    setDiary({ ...diary, meals: updatedMeals })
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Food Diary</Text>
      <Text style={styles.date}>{diary.date}</Text>

      {diary.meals.map((meal) => (
        <View key={meal.id} style={styles.mealSection}>
          <Text style={styles.mealType}>{meal.type}</Text>
          {meal.foods.map((food) => (
            <MealCard
              key={food.id}
              food={food}
              onDelete={(foodId) => handleDeleteFood(meal.id, foodId)}
            />
          ))}
          <Button title="+ Add Food" onPress={() => handleAddFood(meal.id)} />
        </View>

      ))}

    </ScrollView>
  )
}

const styles = StyleSheet.create({

  container: {
    padding: 10,
    width: '100%',
    alignItems: 'stretch'
  },

  title: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },

  date: { marginBottom: 15, color: "#666" },
  
  mealSection: { 
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },

  mealType: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  }

})