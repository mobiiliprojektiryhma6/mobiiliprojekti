import React from "react";
import { View, Text, StyleSheet } from "react-native";

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
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Carbs per Meal Type</Text>

      {mealTypes.map((type) => {
        const carbs = mealTypeNutrition[type].carbs;
        const percent =
          maxCarbs > 0 ? `${(carbs / maxCarbs) * 100}%` : "0%";

        return (
          <View key={type} style={styles.row}>
            <Text style={styles.chartLabel}>{type}</Text>

            <View style={styles.chartBarBackground}>
              <View style={[styles.chartBarFill, { width: percent }]} />
            </View>

            <Text style={styles.chartValueRight}>
              {carbs.toFixed(1)} g
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    marginBottom: 20,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },

  row: {
    marginBottom: 10, // tighter spacing
  },

  chartLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  },

  chartBarBackground: {
    height: 10,
    backgroundColor: "#e5e7eb",
    borderRadius: 5,
    overflow: "hidden",
  },

  chartBarFill: {
    height: "100%",
    backgroundColor: "#4BA3C3",
    borderRadius: 5,
    opacity: 0.9,
  },

  chartValueRight: {
    fontSize: 12,
    color: "#444",
    marginTop: 2,
    textAlign: "right",
  },
});
