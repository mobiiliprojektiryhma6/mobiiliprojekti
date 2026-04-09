import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { globalStyles } from "../src/styles/globalStyles"

type Nutrition = {
  carbs: number;
  protein: number;
  fat: number;
  energy: number;
};

type Props = {
  mealTypeNutrition: Record<string, Nutrition>;
};

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function CarbsPerMealChart({ mealTypeNutrition }: Props) {
  const carbValues = mealTypes.map((type) => mealTypeNutrition[type].carbs);
  const maxCarbs = Math.max(...carbValues);

  return (
    <View style={globalStyles.carbChartCard}>
      <Text style={globalStyles.carbChartTitle}>Carbs per Meal Type</Text>

      {mealTypes.map((type) => {
        const carbs = mealTypeNutrition[type].carbs;
        const percent = maxCarbs > 0 ? (carbs / maxCarbs) * 100 : 0;

        return (
          <View key={type} style={globalStyles.carbChartRow}>
            <Text style={globalStyles.carbChartLabel}>{type}</Text>

            <View style={globalStyles.carbChartBarBackground}>
              <View style={[globalStyles.carbChartBarFill, { width: `${percent}%` }]} />
            </View>

            <Text style={globalStyles.carbChartValueRight}>
              {carbs.toFixed(1)} g
            </Text>
          </View>
        );
      })}
    </View>
  );
}