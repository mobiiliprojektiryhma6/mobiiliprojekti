import { FoodItem } from "./FoodItem"

export type MealCardProps = {
    food: FoodItem;
    onDelete: (foodId: string) => void;
    onToggleFavorite: (food: FoodItem) => void;
    onPress?: () => void;
}

export type NutrientRowProps = {
    label: string;
    value: number | string;
    unit: string;
    color: string;
    barPercent?: number;
}
