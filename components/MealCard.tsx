import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FoodItem } from "../types/FoodItem";

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
  return (
    <View style={styles.nutrientRow}>
      <View style={styles.nutrientLabelRow}>
        <View style={[styles.nutrientDot, { backgroundColor: color }]} />
        <Text style={styles.nutrientLabel}>{label}</Text>
        <Text style={styles.nutrientValue}>
          {value}
          <Text style={styles.nutrientUnit}> {unit}</Text>
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.min(barPercent, 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

export default function MealCard({ food, onDelete, onToggleFavorite, onPress }: Props) {
  const refValues = { carbs: 130, protein: 50, fat: 78 };

  return (
    <View style={styles.cardWrapper}>
      {/* Whole card press */}
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <View style={styles.card}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.name} numberOfLines={2}>
                {food.isFavorite ? "⭐ " : ""}
                {food.name}
              </Text>
              <Text style={styles.perServing}>per 100 g</Text>
            </View>

            {/* Energy badge */}
            <View style={styles.energyBadge}>
              <Text style={styles.energyValue}>{food.energy}</Text>
              <Text style={styles.energyUnit}>kcal</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Nutrients */}
          <View style={styles.nutrients}>
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
            style={styles.deleteButton}
            onPress={() => onDelete(food.id!)}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteText}>Remove</Text>
          </TouchableOpacity>

        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => onToggleFavorite(food)}
      >
        <Text style={{ fontSize: 22 }}>
          {food.isFavorite ? "⭐" : "☆"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 2,
    padding: 16,
    paddingRight: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A2E",
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  perServing: {
    fontSize: 12,
    color: "#9B9B9B",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  energyBadge: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    minWidth: 64,
  },
  energyValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#E67E22",
    letterSpacing: -0.5,
  },
  energyUnit: {
    fontSize: 11,
    fontWeight: "600",
    color: "#E67E22",
    opacity: 0.8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 14,
  },

  nutrients: {
    gap: 10,
    marginBottom: 16,
  },
  nutrientRow: {
    gap: 5,
  },
  nutrientLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nutrientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  nutrientLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    letterSpacing: 0.1,
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  nutrientUnit: {
    fontSize: 12,
    fontWeight: "400",
    color: "#9B9B9B",
  },
  barTrack: {
    height: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    marginLeft: 16,
    overflow: "hidden",
  },
  barFill: {
    height: 4,
    borderRadius: 2,
    opacity: 0.75,
  },

  deleteButton: {
    borderWidth: 1,
    borderColor: "#FFD6D6",
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
    backgroundColor: "#FFF5F5",
  },
  deleteText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#E74C3C",
    letterSpacing: 0.3,
  },

  cardWrapper: {
    position: "relative",
  },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
});
