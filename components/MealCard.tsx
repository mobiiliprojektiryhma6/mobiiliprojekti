import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FoodItem } from "../types/FoodItem";
import { useTheme } from "../src/theme/ThemeContext"; 

type Props = {
  food: FoodItem;
  onDelete: (foodId: string) => void;
  onToggleFavorite: (food: FoodItem) => void;
  onPress?: () => void;
};

type NutrientRowProps = {
  label: string;
  value: number | string;
  unit: string;
  color: string;
  barPercent?: number;
};

function NutrientRow({ label, value, unit, color, barPercent = 0 }: NutrientRowProps) {
  const { styles } = useTheme(); 

  return (
    <View style={styles.mealCard_nutrientRow}>
      <View style={styles.mealCard_nutrientLabelRow}>
        <View style={[styles.mealCard_nutrientDot, { backgroundColor: color }]} />
        <Text style={styles.mealCard_nutrientLabel}>{label}</Text>
        <Text style={styles.mealCard_nutrientValue}>
          {value}
          <Text style={styles.mealCard_nutrientUnit}> {unit}</Text>
        </Text>
      </View>

      <View style={styles.mealCard_barTrack}>
        <View
          style={[
            styles.mealCard_barFill,
            { width: `${Math.min(barPercent, 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

export default function MealCard({ food, onDelete, onToggleFavorite, onPress }: Props) {
  const { theme, styles } = useTheme(); 

  const refValues = { carbs: 130, protein: 50, fat: 78 };

  return (
    <View style={styles.mealCard}>
      {/* Header */}
      <View style={styles.mealCard_header}>
        <View style={styles.mealCard_headerLeft}>
          <Text style={styles.mealCard_name} numberOfLines={2}>
            {food.name}
          </Text>
          <Text style={styles.mealCard_perServing}>per 100 g</Text>
        </View>

        <View style={styles.mealCard_energyBadge}>
          <Text style={styles.mealCard_energyValue}>{food.energy}</Text>
          <Text style={styles.mealCard_energyUnit}>kcal</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.mealCard_divider} />

      {/* Nutrients */}
      <View style={styles.mealCard_nutrients}>
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

      <TouchableOpacity
        style={styles.mealCard_deleteButton}
        onPress={() => onDelete(food.id!)}
        activeOpacity={0.7}
      >
        <Text style={styles.mealCard_deleteText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
}