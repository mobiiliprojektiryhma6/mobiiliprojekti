import { FoodItem } from "./FoodTypes"

export type Meal = {
  id: string
  type: "Breakfast" | "Snack" | "Lunch" | "Dinner"
  foods: FoodItem[]
}