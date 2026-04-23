import { FoodItem } from "./FoodItem"

export type MealRecord = {
    id: string;
    mealType: string;
    dateString: string;
    foods: FoodItem[];
    totalEnergy?: number;
    totalCarbohydrates?: number;
    totalProtein?: number;
    totalFat?: number;
    timestamp?: any;
}

export type MacroTotals = {
    carbs: number;
    energy: number;
    protein: number;
    fat: number;
}
