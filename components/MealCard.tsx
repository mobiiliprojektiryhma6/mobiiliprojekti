import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FoodItem } from "../types/FoodItem";
import { globalStyles } from "../src/styles/globalStyles"

type Props = {
  food: FoodItem;
  onDelete: (foodId: string) => void;
};

type NutrientRowProps = {
  label: string;
  value: number | string;
  unit: string;
  color: string;
  barPercent?: number;
};

function NutrientRow({ label, value, unit, color, barPercent = 0 }: NutrientRowProps) {
  return (
    <View style={globalStyles.mealCard_nutrientRow}>
      <View style={globalStyles.mealCard_nutrientLabelRow}>
        <View style={[globalStyles.mealCard_nutrientDot, { backgroundColor: color }]} />
        <Text style={globalStyles.mealCard_nutrientLabel}>{label}</Text>
        <Text style={globalStyles.mealCard_nutrientValue}>
          {value}
          <Text style={globalStyles.mealCard_nutrientUnit}> {unit}</Text>
        </Text>
      </View>

      <View style={globalStyles.mealCard_barTrack}>
        <View
          style={[
            globalStyles.mealCard_barFill,
            { width: `${Math.min(barPercent, 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

export default function MealCard({ food, onDelete }: Props) {
  // Rough daily reference values for bar scaling (per 100g context)
  const refValues = { carbs: 130, protein: 50, fat: 78 };

  return (
    <View style={globalStyles.mealCard}>
      {/* Header */}
      <View style={globalStyles.mealCard_header}>
        <View style={globalStyles.mealCard_headerLeft}>
          <Text style={globalStyles.mealCard_name} numberOfLines={2}>
            {food.name}
          </Text>
          <Text style={globalStyles.mealCard_perServing}>per 100 g</Text>
        </View>

        <View style={globalStyles.mealCard_energyBadge}>
          <Text style={globalStyles.mealCard_energyValue}>{food.energy}</Text>
          <Text style={globalStyles.mealCard_energyUnit}>kcal</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={globalStyles.mealCard_divider} />

      {/* Nutrients */}
      <View style={globalStyles.mealCard_nutrients}>
        <NutrientRow
          label="Carbs"
          value={food.carbohydrates}
          unit="g"
          color="#E67E22"
          barPercent={(food.carbohydrates / refValues.carbs) * 100}
        />
        <NutrientRow
          label="Protein"
          value={food.protein}
          unit="g"
          color="#2980B9"
          barPercent={(food.protein / refValues.protein) * 100}
        />
        <NutrientRow
          label="Fat"
          value={food.fat}
          unit="g"
          color="#27AE60"
          barPercent={(food.fat / refValues.fat) * 100}
        />
      </View>

      {/* Delete button */}
      <TouchableOpacity
        style={globalStyles.mealCard_deleteButton}
        onPress={() => onDelete(food.id!)}
        activeOpacity={0.7}
      >
        <Text style={globalStyles.mealCard_deleteText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
}