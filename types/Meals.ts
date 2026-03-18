import { FoodItem } from "./FoodItem"

export type Meal = {
  id: string
  type: "Breakfast" | "Snack" | "Lunch" | "Dinner"
  foods: FoodItem[]
}