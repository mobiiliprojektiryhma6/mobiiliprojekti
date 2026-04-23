import { FoodItem } from "../../types/FoodItem"
import { MacroTotals, MealRecord } from "../../types/MealTypes"

export const scaleValuePer100g = (value: number, grams: number) => {
    const scaled = value * (grams / 100)
    return Math.round(scaled * 10) / 10
}

export const scaleFoodByServingSize = (food: FoodItem, grams: number): FoodItem => ({
    ...food,
    id: food.id,
    servingSize: grams,
    per100g: false,
    energy: scaleValuePer100g(food.energy, grams),
    carbohydrates: scaleValuePer100g(food.carbohydrates, grams),
    protein: scaleValuePer100g(food.protein, grams),
    fat: scaleValuePer100g(food.fat, grams),
})

export const calculateFoodTotals = (foods: FoodItem[]): MacroTotals => {
    return foods.reduce(
        (acc, f) => ({
            carbs: acc.carbs + (f.carbohydrates ?? 0),
            energy: acc.energy + (f.energy ?? 0),
            protein: acc.protein + (f.protein ?? 0),
            fat: acc.fat + (f.fat ?? 0),
        }),
        { carbs: 0, energy: 0, protein: 0, fat: 0 }
    )
}

export const calculateDailyTotalsFromMeals = (meals: MealRecord[]): MacroTotals => {
    return meals.reduce(
        (acc, m) => ({
            carbs: acc.carbs + (m.totalCarbohydrates ?? 0),
            energy: acc.energy + (m.totalEnergy ?? 0),
            protein: acc.protein + (m.totalProtein ?? 0),
            fat: acc.fat + (m.totalFat ?? 0),
        }),
        { carbs: 0, energy: 0, protein: 0, fat: 0 }
    )
}

export const groupMealsByType = (mealTypes: string[], meals: MealRecord[]) => {
    const grouped: Record<string, MealRecord[]> = {
        Breakfast: [],
        Lunch: [],
        Dinner: [],
        Snack: [],
    }

    mealTypes.forEach((type) => {
        grouped[type] = meals.filter((m) => m.mealType === type)
    })

    return grouped
}

export const calculateMealTypeNutrition = (mealTypes: string[], grouped: Record<string, MealRecord[]>) => {
    return mealTypes.reduce((acc, type) => {
        const mealsOfType = grouped[type]

        const totals = mealsOfType.reduce(
            (sum, m) => ({
                carbs: sum.carbs + (m.totalCarbohydrates ?? 0),
                protein: sum.protein + (m.totalProtein ?? 0),
                fat: sum.fat + (m.totalFat ?? 0),
                energy: sum.energy + (m.totalEnergy ?? 0),
            }),
            { carbs: 0, protein: 0, fat: 0, energy: 0 }
        )

        acc[type] = totals
        return acc
    }, {} as Record<string, { carbs: number; protein: number; fat: number; energy: number }>)
}

export const aggregateCarbsByDate = (dates: string[], meals: MealRecord[]) => {
    const groupedByDay: Record<string, number> = {}
    dates.forEach((d) => {
        groupedByDay[d] = 0
    })

    meals.forEach((meal) => {
        groupedByDay[meal.dateString] += meal.totalCarbohydrates ?? 0
    })

    return dates.map((d) => ({ date: d, carbs: groupedByDay[d] }))
}
