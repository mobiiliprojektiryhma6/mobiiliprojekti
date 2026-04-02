import { Dimensions } from "react-native";
import { MealEntryData, PieSlice } from "../../types/TodayCarbsChart";

export const PIE_COLORS = ["#009FE3", "#4CAF50", "#FF9800", "#E91E63", "#9C27B0", "#607D8B"];

export const getDayKey = (date = new Date()) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

export const getChartWidth = () => Math.min(Dimensions.get("window").width - 30, 420);

export const mapMealsToPieSlices = (meals: MealEntryData[]): PieSlice[] => {
    return meals
        .map((meal, index) => {
            const carbs = (meal.foods ?? []).reduce((sum, food) => sum + Number(food?.carbohydrates ?? 0), 0);

            return {
                name: meal.mealType?.trim() || `Meal ${index + 1}`,
                carbs,
                color: PIE_COLORS[index % PIE_COLORS.length],
                legendFontColor: "#1F2937",
                legendFontSize: 12,
            } satisfies PieSlice;
        })
        .filter((item): item is PieSlice => item.carbs > 0);
};