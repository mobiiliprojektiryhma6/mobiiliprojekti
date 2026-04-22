export type PieSlice = {
    name: string;
    carbs: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
};

export type MealEntryData = {
    mealType?: string;
    foods?: Array<{ carbohydrates?: number }>;
    totalCarbohydrates?: number;
};