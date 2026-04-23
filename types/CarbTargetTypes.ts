export type NumericInput = string | number | null | undefined

export type ActivityLevel = "sedentary" | "light" | "moderate" | "very_active"

export type CarbRecommendationResult = {
    target: number | null;
    reason?: string;
}

export type DailyCarbTargetSettings = {
    useManualCarbTarget?: boolean;
    dailyCarbTarget?: NumericInput;
    weight?: NumericInput;
    height?: NumericInput;
    age?: NumericInput;
    activityLevel?: ActivityLevel;
}
