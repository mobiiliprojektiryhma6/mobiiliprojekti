import { Dimensions } from "react-native";
import { MealEntryData, PieSlice } from "../../types/TodayCarbsChart";

export const PIE_COLORS = ["#009FE3", "#4CAF50", "#FF9800", "#E91E63", "#9C27B0", "#607D8B"];

const CANONICAL_MEAL_LABELS: Record<string, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
};

const MEAL_TYPE_COLORS: Record<string, string> = {
    breakfast: "#2A9D8F",
    lunch: "#457B9D",
    dinner: "#E76F51",
    snack: "#E9C46A",
};

const FALLBACK_COLORS = ["#6B7280", "#7C6EA8", "#4D908E", "#F4A261"];

const hashString = (value: string) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash;
};

const normalizeMealType = (mealType?: string) => mealType?.trim().replace(/\s+/g, " ") ?? "";

const getStableColor = (mealTypeKey: string) => {
    if (MEAL_TYPE_COLORS[mealTypeKey]) {
        return MEAL_TYPE_COLORS[mealTypeKey];
    }

    return FALLBACK_COLORS[hashString(mealTypeKey) % FALLBACK_COLORS.length];
};

export const getDayKey = (date = new Date()) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

export const getChartWidth = () => Math.min(Dimensions.get("window").width - 30, 420);

export const mapMealsToPieSlices = (meals: MealEntryData[]): PieSlice[] => {
    const groupedMeals = new Map<string, { name: string; carbs: number; color: string }>();

    meals.forEach((meal, index) => {
        const carbs = (meal.foods ?? []).reduce((sum, food) => sum + Number(food?.carbohydrates ?? 0), 0);
        if (carbs <= 0) return;

        const normalizedMealType = normalizeMealType(meal.mealType);
        const mealTypeKey = normalizedMealType.toLowerCase();
        const groupKey = mealTypeKey || `meal-${index}`;

        const existing = groupedMeals.get(groupKey);
        if (existing) {
            existing.carbs += carbs;
            return;
        }

        groupedMeals.set(groupKey, {
            name: CANONICAL_MEAL_LABELS[mealTypeKey] || normalizedMealType || `Meal ${index + 1}`,
            carbs,
            color: getStableColor(groupKey),
        });
    });

    return Array.from(groupedMeals.values()).map((item, index) => ({
        name: item.name,
        carbs: item.carbs,
        color: item.color || PIE_COLORS[index % PIE_COLORS.length],
        legendFontColor: "#1F2937",
        legendFontSize: 12,
    } satisfies PieSlice));
};