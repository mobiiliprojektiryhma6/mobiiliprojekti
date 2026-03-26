import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FoodItem } from "../types/FoodItem";

type Meal = {
  id: string;
  mealType: string;
  dateString: string;
  foods: FoodItem[];
  totalEnergy?: number;
  totalCarbohydrates?: number;
  totalProtein?: number;
  totalFat?: number;
  timestamp?: any;
};

type Props = {
  meal: Meal;
  index: number;
};

export default function DiaryMealCard({ meal, index }: Props) {
  const [expanded, setExpanded] = useState(false);

  const timeString = meal.timestamp
  ? meal.timestamp.toDate().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  : "";

  const totalCarbs = meal.totalCarbohydrates ?? 0;
  const totalEnergy = meal.totalEnergy ?? 0;
  const totalProtein = meal.totalProtein ?? 0;
  const totalFat = meal.totalFat ?? 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setExpanded(!expanded)}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {meal.mealType} #{index}
        </Text>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.headerCarbs}>{totalCarbs.toFixed(1)} g carbs</Text>
          <Text style={styles.timeText}>{timeString}</Text>
        </View>
      </View>

      {!expanded && (
        <Text style={styles.tapHint}>Tap to expand</Text>
      )}

      {expanded && (
        <View style={styles.body}>

          <View style={styles.section}>
            {meal.foods.map((food) => (
              <View key={food.id} style={styles.foodRow}>
                <Text style={styles.foodName}>
                  {food.name}
                  {food.servingSize ? ` (${food.servingSize} g)` : ""}
                </Text>
                <Text style={styles.foodCarbs}>
                  {food.carbohydrates.toFixed(1)} g
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.nutrient}>Carbs: {totalCarbs.toFixed(1)} g</Text>
            <Text style={styles.nutrient}>Energy: {totalEnergy.toFixed(0)} kcal</Text>
            <Text style={styles.nutrient}>Protein: {totalProtein.toFixed(1)} g</Text>
            <Text style={styles.nutrient}>Fat: {totalFat.toFixed(1)} g</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.chartTitle}>Carbs per food</Text>

            {meal.foods.map((food) => {
              const pct =
                totalCarbs > 0 ? (food.carbohydrates / totalCarbs) * 100 : 0;

                return (
                    <View key={food.id} style={styles.barRow}>
                        <Text style={styles.barLabel}>{food.name}</Text>

                        <View style={styles.barTrack}>
                            <View style={[styles.barFill, { width: `${pct}%` }]} />
                        </View>

                        <Text style={styles.foodCarbs}>{food.carbohydrates.toFixed(1)} g</Text>
                    </View>
              );
            })}
          </View>

        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    overflow: "hidden",
  }, 

  header: {
  backgroundColor: "#4A90E2",   
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 12,
  marginBottom: 12,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

  headerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },

  headerCarbs: {
    fontSize: 14,
    color: "#4B5563",
  },

  tapHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
  },

  body: {
    padding: 16,
  },

  section: {
    marginBottom: 24,
  },

  foodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  foodName: {
    fontSize: 14,
    color: "#374151",
  },

  foodCarbs: {
    fontSize: 14,
    color: "#4B5563",
  },

  nutrient: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },

 barRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 8,
},

  barTrack: {
    flex: 1,
    height: 14,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginHorizontal: 8,
  },

  barFill: {
    height: 14,
    backgroundColor: "#3B82F6",
    borderRadius: 4,
  },

  barLabel: {
  width: 90,              
  fontSize: 14,
  color: "#374151",
},

timeText: {
  fontSize: 14,
  color: "#4B5563",
  fontWeight: "500",
},

});
