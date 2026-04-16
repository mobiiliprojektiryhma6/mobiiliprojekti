import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../src/theme/ThemeContext";

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
  const { theme, styles } = useTheme();
  const carbValues = mealTypes.map((type) => mealTypeNutrition[type].carbs);
  const maxCarbs = Math.max(...carbValues);

  return (
    <View style={styles.carbChartCard}>
      <Text style={styles.carbChartTitle}>Carbs per Meal Type</Text>

      {mealTypes.map((type) => {
        const carbs = mealTypeNutrition[type].carbs;
        const percent = maxCarbs > 0 ? (carbs / maxCarbs) * 100 : 0;

        return (
          <View key={type} style={styles.carbChartRow}>
            <Text style={styles.carbChartLabel}>{type}</Text>

            <View style={styles.carbChartBarBackground}>
              <View
                style={[
                  styles.carbChartBarFill,
                  { width: `${percent}%`, backgroundColor: theme.colors.primary },
                ]}
              />
            </View>

            <Text style={styles.carbChartValueRight}>
              {carbs.toFixed(1)} g
            </Text>
          </View>
        );
      })}
    </View>
  );
}