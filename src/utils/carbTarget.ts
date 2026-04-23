import { ActivityLevel, CarbRecommendationResult, DailyCarbTargetSettings, NumericInput } from "../../types/CarbTargetTypes"

const parsePositiveNumber = (value: NumericInput): number | null => {
    if (value === null || value === undefined) return null
    const num = typeof value === "number" ? value : Number(String(value).replace(",", "."))
    if (!Number.isFinite(num) || num <= 0) return null
    return num
}

export const calculateRecommendedCarbTarget = (
    weightInput: NumericInput,
    heightInput: NumericInput,
    ageInput: NumericInput = 30,
    activityLevel: ActivityLevel = "moderate"
): CarbRecommendationResult => {
    const weightKg = parsePositiveNumber(weightInput)
    const heightCm = parsePositiveNumber(heightInput)
    const age = parsePositiveNumber(ageInput) || 30

    if (!weightKg || !heightCm) {
        return { target: null, reason: "Missing profile info: add weight and height for recommendation." }
    }

    // Mifflin-St Jeor BMR formula (gender-averaged)
    const bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 78

    // Activity multiplier
    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        very_active: 1.725,
    }
    const tdee = bmr * activityMultipliers[activityLevel]

    // Calculate carb target: 50% of calories from carbs, divide by 4 cal/gram
    const carbsFromCalories = (tdee * 0.5) / 4
    const clamped = Math.min(350, Math.max(100, carbsFromCalories))

    return { target: Math.round(clamped) }
}

export const resolveDailyCarbTarget = (settings: DailyCarbTargetSettings): CarbRecommendationResult & { source: "manual" | "recommended" | "missing" } => {
    const manualTarget = parsePositiveNumber(settings.dailyCarbTarget)

    if (settings.useManualCarbTarget && manualTarget) {
        return { target: Math.round(manualTarget), source: "manual" }
    }

    const recommended = calculateRecommendedCarbTarget(settings.weight, settings.height, settings.age, settings.activityLevel)
    if (recommended.target === null) {
        return { target: null, reason: recommended.reason, source: "missing" }
    }

    return { target: recommended.target, source: "recommended" }
}
