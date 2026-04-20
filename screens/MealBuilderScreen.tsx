import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { globalStyles } from "../src/styles/globalStyles"

import { db } from "../firebase/config";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import MealCard from "../components/MealCard";
import { FoodItem } from "../types/FoodItem";

import { useRoute, useNavigation } from "@react-navigation/native";

import { getFavoriteFoods, addFavoriteFood, removeFavoriteFood } from "../firebase/favorites";

const getDayKey = (date = new Date()) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function MealBuilderScreen() {

  const [mealType, setMealType] = useState("Lunch");
  const [foods, setFoods] = useState<FoodItem[]>([]);

  const [products, setProducts] = useState<FoodItem[]>([]);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [chooseModalVisible, setChooseModalVisible] = useState(false);

  const [authReady, setAuthReady] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [tempName, setTempName] = useState("");
  const [tempEnergy, setTempEnergy] = useState("");
  const [tempCarbs, setTempCarbs] = useState("");
  const [tempProtein, setTempProtein] = useState("");
  const [tempFat, setTempFat] = useState("");

  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);

  const [servingSizeModalVisible, setServingSizeModalVisible] = useState(false);
  const [servingSizeInput, setServingSizeInput] = useState("100");
  const [selectedProduct, setSelectedProduct] = useState<FoodItem | null>(null);


  const [productSearch, setProductSearch] = useState("");

  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const selectedDateParam = route.params?.selectedDate;
const selectedDate = selectedDateParam
  ? new Date(selectedDateParam)
  : new Date();

  useEffect(() => {
    const unsub = getAuth().onAuthStateChanged(() => {
      setAuthReady(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!authReady) return;

    const loadProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FoodItem[];

      setProducts(items);
    };

    loadProducts();
  }, [authReady]);

  useEffect(() => {
    if (route.params?.addedFood) {
      const food = route.params.addedFood;

      setSelectedProduct(food);
      setServingSizeModalVisible(true);

      navigation.setParams({ addedFood: undefined });
    }
  }, [route.params?.addedFood]);

  useEffect(() => {
    if (route.params?.customFood) {
      setModalVisible(true);
      navigation.setParams({ customFood: undefined });
    }
  }, [route.params?.customFood]);

  const [favoriteFoods, setFavoriteFoods] = useState<FoodItem[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      const favs = await getFavoriteFoods();
      setFavoriteFoods(favs);
    };
    loadFavorites();
  }, []);

  const toggleFavorite = async (food: FoodItem) => {
    console.log("TOGGLE FAVORITE:", food.name, food.id);

    const isFav = favoriteFoods.some(f => f.id === food.id);
    console.log("  was favorite?", isFav);

    if (isFav) {
      await removeFavoriteFood(food.id);
      setFavoriteFoods(prev => [...prev.filter(f => f.id !== food.id)]);
    } else {
      await addFavoriteFood(food);
      setFavoriteFoods(prev => [...prev, food]);
    }

    console.log("  now favorites:", favoriteFoods.map(f => f.name));
  };

  const startEditingFood = (food: FoodItem) => {
    setTempName(food.name);
    setTempEnergy(String(food.energy));
    setTempCarbs(String(food.carbohydrates));
    setTempProtein(String(food.protein));
    setTempFat(String(food.fat));
    setEditingFoodId(food.id ?? null);
    setModalVisible(true);
  };

  const addOrEditFood = () => {
    if (!tempName.trim()) return;

    const foodData: FoodItem = {
      id: editingFoodId ?? tempName.toLowerCase().replace(/\s+/g, "-"),
      name: tempName,
      energy: Number(tempEnergy),
      carbohydrates: Number(tempCarbs),
      protein: Number(tempProtein),
      fat: Number(tempFat),
    };

    if (editingFoodId) {
      setFoods((prev) =>
        prev.map((f) => (f.id === editingFoodId ? foodData : f))
      );
    } else {
      setFoods((prev) => [...prev, foodData]);
    }

    setModalVisible(false);
  };

  const deleteFood = (foodId: string) => {
    setFoods((prev) => prev.filter((f) => f.id !== foodId));
  };

  const saveMeal = async () => {
    const user = getAuth().currentUser;

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    if (foods.length === 0) {
      alert("Add at least one food.");
      return;
    }

    const dateString = getDayKey(selectedDate);

    const totalEnergy = foods.reduce((sum, f) => sum + f.energy, 0);
    const totalCarbohydrates = foods.reduce((sum, f) => sum + f.carbohydrates, 0);
    const totalProtein = foods.reduce((sum, f) => sum + f.protein, 0);
    const totalFat = foods.reduce((sum, f) => sum + f.fat, 0);

    try {
      await addDoc(collection(db, "meals", user.uid, "entries"), {
        mealType,
        timestamp: serverTimestamp(),
        dateString,
        dayKey: dateString,
        foods,
        totalEnergy,
        totalCarbohydrates,
        totalProtein,
        totalFat,
      });

      alert("Meal saved!");
      setFoods([]);
    } catch (error) {
      console.error("Error saving meal:", error);
      alert("Could not save meal.");
    }
  };

  const scaleValue = (value: number, grams: number) => {
    const scaled = value * (grams / 100);
    return Math.round(scaled * 10) / 10;
  };

  const handleAddWithServingSize = () => {
    if (!selectedProduct) return;

    const grams = parseInt(servingSizeInput, 10);
    if (!grams || grams <= 0) return;

    const scaledFood: FoodItem = {
      ...selectedProduct,
      id: selectedProduct.id,
      servingSize: grams,
      per100g: false,
      energy: scaleValue(selectedProduct.energy, grams),
      carbohydrates: scaleValue(selectedProduct.carbohydrates, grams),
      protein: scaleValue(selectedProduct.protein, grams),
      fat: scaleValue(selectedProduct.fat, grams),
    };

    setFoods((prev) => [...prev, scaledFood]);

    setServingSizeModalVisible(false);
    setSelectedProduct(null);
  };

  const [favoritesModalVisible, setFavoritesModalVisible] = useState(false);

  // Load a whole favorite meal into MealBuilder
  useEffect(() => {
    if (route.params?.favoriteMeal) {
      setFoods(route.params.favoriteMeal.foods);
      navigation.setParams({ favoriteMeal: undefined });
    }
  }, [route.params?.favoriteMeal]);

  
  useEffect(() => {
  if (route.params?.selectedFavoriteFood) {
    const food = route.params.selectedFavoriteFood;

    setSelectedProduct(food);
    setServingSizeInput("100");
    setServingSizeModalVisible(true);

    navigation.setParams({ selectedFavoriteFood: undefined });
  }
}, [route.params?.selectedFavoriteFood]);

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.header}>Build Your Meal</Text>

      {/* Meal type selector */}
      <View style={globalStyles.mealBuilder_section}>
        <Text style={globalStyles.mealBuilder_label}>Meal</Text>

        <View style={globalStyles.mealBuilder_mealRow}>
          {["Breakfast", "Lunch", "Snack", "Dinner"].map((meal) => (
            <TouchableOpacity
              key={meal}
              style={[
                globalStyles.mealBuilder_mealButton,
                mealType === meal && globalStyles.mealBuilder_mealButtonSelected,
              ]}
              onPress={() => setMealType(meal)}
            >
              <Text
                style={[
                  globalStyles.mealBuilder_mealButtonText,
                  mealType === meal && globalStyles.mealBuilder_mealButtonTextSelected,
                ]}
              >
                {meal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Add food button */}
      <TouchableOpacity
        style={globalStyles.mealBuilder_addFoodButton}
        onPress={() => setChooseModalVisible(true)}
      >
        <Text style={globalStyles.mealBuilder_addFoodButtonText}>Add Food</Text>
      </TouchableOpacity>

      {/* Foods list */}
      {foods.length > 0 && (
        <>
          <Text style={globalStyles.mealBuilder_label}>Foods in this meal:</Text>

          <FlatList
            data={foods}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MealCard
                food={{ ...item, isFavorite: favoriteFoods.some(f => f.id === item.id) }}
                onDelete={deleteFood}
                onToggleFavorite={toggleFavorite}
                onPress={() => startEditingFood(item)}
              />

            )}
          />
        </>
      )}

      {/* Save meal */}
      <TouchableOpacity
        style={[
          globalStyles.mealBuilder_saveButton,
          !mealType && { opacity: 0.4 },
        ]}
        disabled={!mealType}
        onPress={saveMeal}
      >
        <Text style={globalStyles.mealBuilder_saveButtonText}>Save Meal</Text>
      </TouchableOpacity>

      {/* CHOOSE FOOD MODAL */}
      <Modal visible={chooseModalVisible} transparent animationType="fade">
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalBox}>
            <Text style={globalStyles.modalTitle}>Add Food</Text>

            <TouchableOpacity
              style={globalStyles.mealBuilder_modalAddButton}
              onPress={() => {
                setChooseModalVisible(false);
                setProductModalVisible(true);
              }}
            >
              <Text style={globalStyles.mealBuilder_modalAddButtonText}>
                Pick from products
              </Text>
            </TouchableOpacity>

            {/* Pick from Favorites */}
            <TouchableOpacity
              style={globalStyles.mealBuilder_modalAddButton}
              onPress={() => {
                setChooseModalVisible(false);
                navigation.navigate("FavoriteFoods", { returnTo: "MealBuilder" });
              }}
            >
              <Text style={styles.modalAddButtonText}>Pick from Favorites ⭐</Text>
            </TouchableOpacity>

            {/* Add from Favorite Meals */}
            <TouchableOpacity
              style={styles.modalAddButton}
              onPress={() => {
                setChooseModalVisible(false);

                setTimeout(() => {
                  navigation.navigate("FavoriteMeals");
                }, 0);
              }}
            >
              <Text style={styles.modalAddButtonText}>Add from Favorite Meals ⭐</Text>
            </TouchableOpacity>


            {/* Search online */}
            <TouchableOpacity
              style={styles.modalAddButton}
              onPress={() => {
                setChooseModalVisible(false);
               navigation.navigate("FoodSearch", { selectedDate });
              }}
            >
              <Text style={globalStyles.mealBuilder_modalAddButtonText}>
                Search online
              </Text>
            </TouchableOpacity>

            {/* Add custom food */}
            <TouchableOpacity
              style={globalStyles.mealBuilder_modalAddButton}
              onPress={() => {
                setChooseModalVisible(false);
                setEditingFoodId(null);
                setTempName("");
                setTempEnergy("");
                setTempCarbs("");
                setTempProtein("");
                setTempFat("");
                setModalVisible(true);
              }}
            >
              <Text style={globalStyles.mealBuilder_modalAddButtonText}>
                Add custom food
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={globalStyles.mealBuilder_modalCancelButton}
              onPress={() => setChooseModalVisible(false)}
            >
              <Text style={globalStyles.mealBuilder_modalCancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PRODUCT PICKER MODAL */}
      <Modal visible={productModalVisible} animationType="slide">
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={globalStyles.header}>Choose a Food</Text>

          <TextInput
            style={globalStyles.input}
            placeholder="Search products..."
            value={productSearch}
            onChangeText={setProductSearch}
          />

          <FlatList
            keyboardShouldPersistTaps="handled"
            data={
              productSearch.trim() === ""
                ? products
                : products.filter((p) =>
                  p.name.toLowerCase().includes(productSearch.toLowerCase())
                )
            }
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={globalStyles.mealBuilder_productItem}
                onPress={() => {
                  setSelectedProduct(item);
                  setServingSizeInput("100");
                  setProductModalVisible(false);
                  setServingSizeModalVisible(true);
                }}
              >
                <Text style={globalStyles.mealBuilder_productName}>{item.name}</Text>
                <Text style={globalStyles.mealBuilder_productInfo}>
                  {item.carbohydrates} carb
                </Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity onPress={() => setProductModalVisible(false)}>
            <Text style={globalStyles.textSecondary}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Favorites Modal */}
      <Modal visible={favoritesModalVisible} animationType="slide">
        <View style={{ flex: 1, padding: 20 }}>

          <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 12 }}>
            Favorite Foods ⭐
          </Text>

          {favoriteFoods.length === 0 && (
            <Text style={{ color: "gray", marginBottom: 20 }}>
              You have no favorite foods yet.
            </Text>
          )}

          {favoriteFoods.map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                backgroundColor: "#fff",
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              {/* select food */}
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => {
                  setSelectedProduct(item);
                  setServingSizeInput("100");
                  setFavoritesModalVisible(false);
                  setServingSizeModalVisible(true);
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.name}</Text>
                <Text style={{ fontSize: 14, color: "gray" }}>
                  {item.carbohydrates} carb
                </Text>
              </TouchableOpacity>

              {/* remove from favorites */}
              <TouchableOpacity onPress={() => toggleFavorite(item)}>
                <Text style={{ fontSize: 22, marginLeft: 10 }}>🗑</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity onPress={() => setFavoritesModalVisible(false)}>
            <Text style={{ textAlign: "center", marginTop: 20, color: "gray" }}>
              Close
            </Text>
          </TouchableOpacity>

        </View>
      </Modal>


      <Modal
        visible={servingSizeModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>How many grams?</Text>

            <TextInput
              style={globalStyles.input}
              keyboardType="number-pad"
              value={servingSizeInput}
              onChangeText={setServingSizeInput}
              autoFocus
              selectTextOnFocus
            />

            <TouchableOpacity
              style={[
                globalStyles.mealBuilder_modalAddButton,
                !(parseInt(servingSizeInput, 10) > 0) && { opacity: 0.4 },
              ]}
              disabled={!(parseInt(servingSizeInput, 10) > 0)}
              onPress={handleAddWithServingSize}
            >
              <Text style={globalStyles.mealBuilder_modalAddButtonText}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={globalStyles.mealBuilder_modalCancelButton}
              onPress={() => setServingSizeModalVisible(false)}
            >
              <Text style={globalStyles.mealBuilder_modalCancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ADD / EDIT CUSTOM FOOD MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalBox}>
            <Text style={globalStyles.modalTitle}>
              {editingFoodId ? "Edit Food" : "Add Food"}
            </Text>

            <TextInput
              style={globalStyles.input}
              placeholder="Name"
              value={tempName}
              onChangeText={setTempName}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Energy (kcal)"
              keyboardType="numeric"
              value={tempEnergy}
              onChangeText={setTempEnergy}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Carbs (g)"
              keyboardType="numeric"
              value={tempCarbs}
              onChangeText={setTempCarbs}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Protein (g)"
              keyboardType="numeric"
              value={tempProtein}
              onChangeText={setTempProtein}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Fat (g)"
              keyboardType="numeric"
              value={tempFat}
              onChangeText={setTempFat}
            />

            <TouchableOpacity
              style={globalStyles.mealBuilder_modalAddButton}
              onPress={addOrEditFood}
            >
              <Text style={globalStyles.mealBuilder_modalAddButtonText}>
                {editingFoodId ? "Save" : "Add"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={globalStyles.mealBuilder_modalCancelButton}
              onPress={() => {
                setModalVisible(false);
                setEditingFoodId(null);
              }}
            >
              <Text style={globalStyles.mealBuilder_modalCancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5F7FD",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  mealRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  mealButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#D0EAF7",
    borderRadius: 8,
  },
  mealButtonSelected: {
    backgroundColor: "#4BA3C3",
  },
  mealButtonText: {
    fontSize: 16,
  },
  mealButtonTextSelected: {
    color: "white",
    fontWeight: "bold",
  },
  addFoodButton: {
    backgroundColor: "#4BA3C3",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  addFoodButtonText: {
    color: "white",
    fontSize: 18,
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#009FE3",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#F0F0F0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalAddButton: {
    backgroundColor: "#4BA3C3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  modalAddButtonText: {
    color: "white",
    fontSize: 16,
  },
  modalCancelButton: {
    alignItems: "center",
    padding: 10,
  },
  modalCancelButtonText: {
    color: "gray",
    fontSize: 16,
  },

  productItem: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  productInfo: {
    fontSize: 14,
    color: "gray",
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 12,
    marginTop: 4,
    fontSize: 16,
  },
});
