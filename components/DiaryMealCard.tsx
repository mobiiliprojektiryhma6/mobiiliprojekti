import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FoodItem } from "../types/FoodItem";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { getAuth } from "firebase/auth";
import EditFood from "./EditFood";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getFavoriteFoods } from "../firebase/favorites";
import { addFavoriteMeal, removeFavoriteMeal, getFavoriteMeals } from "../firebase/favoriteMeals";
import { globalStyles } from "../src/styles/globalStyles"

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

function calculateMealTotals(foods: FoodItem[]) {
  let totalCarbohydrates = 0;
  let totalEnergy = 0;
  let totalProtein = 0;
  let totalFat = 0;

  foods.forEach((f) => {
    totalCarbohydrates += f.carbohydrates || 0;
    totalEnergy += f.energy || 0;
    totalProtein += f.protein || 0;
    totalFat += f.fat || 0;
  });

  return {
    totalCarbohydrates,
    totalEnergy,
    totalProtein,
    totalFat,
  };
}

export default function DiaryMealCard({ meal, index }: Props) {
  const [expanded, setExpanded] = useState(false);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const user = getAuth().currentUser;

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [foodToEdit, setFoodToEdit] = useState<FoodItem | null>(null);

  const openEditModal = (food: FoodItem) => {
    setFoodToEdit(food);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setFoodToEdit(null);
  };

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

  const handleDelete = async (foodId: string) => {
    if (!user) return;

    const updatedFoods = meal.foods.filter((f) => f.id !== foodId);
    const mealRef = doc(db, "meals", user.uid, "entries", meal.id);

    if (updatedFoods.length === 0) {
      await deleteDoc(mealRef);
      return;
    }

    const totals = calculateMealTotals(updatedFoods);

    await updateDoc(mealRef, {
      foods: updatedFoods,
      ...totals,
    });
  };

  const [favoriteFoods, setFavoriteFoods] = useState<FoodItem[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      const favs = await getFavoriteFoods();
      setFavoriteFoods(favs);
    };
    loadFavorites();
  }, []);

  const [favoriteMeals, setFavoriteMeals] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const favs = await getFavoriteMeals();
      setFavoriteMeals(favs);
    };
    load();
  }, []);

  // Replacement from FoodSearch
  useEffect(() => {
    const params = route.params;

    if (!params?.replaceFood || !user || params.mealId !== meal.id) return;

    const product = params.replaceFood;
    const editingFoodId = params.editingFoodId;

    if (!editingFoodId) return;

    const updatedFoods = meal.foods.map((f) =>
      f.id === editingFoodId ? { ...product, id: editingFoodId } : f
    );

    const totals = calculateMealTotals(updatedFoods);
    const mealRef = doc(db, "meals", user.uid, "entries", meal.id);

    const updateMeal = async () => {
      await updateDoc(mealRef, {
        foods: updatedFoods,
        ...totals,
      });

      navigation.setParams({
        replaceFood: undefined,
        editingFoodId: undefined,
        mealId: undefined,
      });

      setEditModalVisible(false);
      setFoodToEdit(null);
    };

    updateMeal();
  }, [route.params?.replaceFood, route.params?.mealId, meal.id, meal.foods, navigation, user]);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setExpanded(!expanded)}
        style={globalStyles.diaryCard}
      >
        <View style={styles.header}>

          {/* Group meal title + star together */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.headerText}>
              {meal.mealType} #{index}
            </Text>

            <TouchableOpacity
              onPress={async () => {
                if (favoriteMeals.some(m => m.id === meal.id)) {
                  await removeFavoriteMeal(meal.id);
                } else {
                  await addFavoriteMeal(meal);
                }
                const favs = await getFavoriteMeals();
                setFavoriteMeals(favs);
              }}
            >
              <Text style={{ fontSize: 22, marginLeft: 8 }}>
                {favoriteMeals.some(m => m.id === meal.id) ? "⭐" : "☆"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Right side: carbs + time */}
          <View style={{ alignItems: "flex-end" }}>
            <Text style={globalStyles.diaryHeaderCarbs}>
              {totalCarbs.toFixed(1)} g carbs
            </Text>
            <Text style={globalStyles.diaryTimeText}>{timeString}</Text>
          </View>
        </View>

        {!expanded && <Text style={globalStyles.diaryTapHint}>Tap to expand</Text>}

        {expanded && (
          <View style={styles.body}>
            <View style={styles.section}>
              {meal.foods.map((food) => {
                const baseName = food.name.split("(")[0].trim().toLowerCase();

                const isFavorite = favoriteFoods.some(f =>
                  f.id === food.id ||
                  f.name.toLowerCase() === baseName
                );

                return (
                  <View key={food.id} style={styles.foodRow}>
                    <Text style={styles.foodName}>
                      {isFavorite ? "⭐ " : ""}
                      {food.name}
                      {food.servingSize ? ` (${food.servingSize} g)` : ""}
                    </Text>

                    <Text style={styles.foodCarbs}>
                      {food.carbohydrates.toFixed(1)} g
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={globalStyles.diarySection}>
              <Text style={globalStyles.diaryNutrient}>Carbs: {totalCarbs.toFixed(1)} g</Text>
              <Text style={globalStyles.diaryNutrient}>Energy: {totalEnergy.toFixed(0)} kcal</Text>
              <Text style={globalStyles.diaryNutrient}>Protein: {totalProtein.toFixed(1)} g</Text>
              <Text style={globalStyles.diaryNutrient}>Fat: {totalFat.toFixed(1)} g</Text>
            </View>

            <View style={globalStyles.diarySection}>
              <Text style={globalStyles.diaryChartTitle}>Carbs per food</Text>

              {meal.foods.map((food) => {
                const pct = totalCarbs > 0 ? (food.carbohydrates / totalCarbs) * 100 : 0

                return (
                  <View key={food.id} style={globalStyles.diaryBarRow}>
                    <Text style={globalStyles.diaryBarLabel}>{food.name}</Text>

                    <View style={globalStyles.diaryBarTrack}>
                      <View
                        style={[
                          globalStyles.diaryBarFill,
                          { width: `${pct}%` },
                        ]}
                      />
                    </View>

                    <Text style={globalStyles.diaryFoodCarbs}>
                      {food.carbohydrates.toFixed(1)} g
                    </Text>

                    <View style={globalStyles.diaryActionColumn}>
                      <TouchableOpacity onPress={() => openEditModal(food)}>
                        <Text style={globalStyles.diaryEditButton}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => handleDelete(food.id)}>
                        <Text style={globalStyles.diaryDeleteButton}>Del</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        )}
      </TouchableOpacity>

      {editModalVisible && foodToEdit && (
        <EditFood food={foodToEdit} meal={meal} onClose={closeEditModal} />
      )}
    </>
  )
}