import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { FoodItem } from "../types/FoodItem";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { getAuth } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../src/theme/ThemeContext";

// --- Helper: recalc totals ---
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

type Props = {
  food: FoodItem;
  meal: {
    id: string;
    foods: FoodItem[];
  };
  onClose: () => void;
};

export default function EditFoodModal({ food, meal, onClose }: Props) {
  const { theme, styles } = useTheme();

  const user = getAuth().currentUser;
  const navigation = useNavigation<any>();

  const [products, setProducts] = useState<FoodItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [pendingProduct, setPendingProduct] = useState<FoodItem | null>(null);
  const [productServingSize, setProductServingSize] = useState(String(food.servingSize || 100));
  const [amountPopupVisible, setAmountPopupVisible] = useState(false);

  const [mode, setMode] = useState<"choose" | "manual" | "products">("choose");

  const [name, setName] = useState(food.name);
  const [servingSize, setServingSize] = useState("");
  const [carbs, setCarbs] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FoodItem[];

      setProducts(items);
    };

    loadProducts();
  }, []);

  // --- Save manually edited food ---
  const saveManual = async () => {
    if (!user) return;

    const grams = Number(servingSize) || 0;

    const originalGrams = food.servingSize || 100;
    const factor = grams / originalGrams;

    const updatedFood: FoodItem = {
      ...food,
      name,
      servingSize: grams,
      carbohydrates: Number(((food.carbohydrates || 0) * factor).toFixed(2)),
      energy: (food.energy || 0) * factor,
      protein: (food.protein || 0) * factor,
      fat: (food.fat || 0) * factor,
    };

    const updatedFoods = meal.foods.map((f) =>
      f.id === food.id ? updatedFood : f
    );

    const totals = calculateMealTotals(updatedFoods);

    const mealRef = doc(db, "meals", user.uid, "entries", meal.id);
    await updateDoc(mealRef, {
      foods: updatedFoods,
      ...totals,
    });

    onClose();
  };

  // --- Save using a selected product ---
  const scaleValue = (value: number, grams: number) => {
    const scaled = value * (grams / 100);
    return Math.round(scaled * 10) / 10;
  };

  const saveFromProduct = async (product: FoodItem, grams: number) => {
    if (!user) return;
    if (!grams || grams <= 0) return;

    const updatedFood: FoodItem = {
      ...product,
      id: food.id,
      servingSize: grams,
      per100g: false,
      energy: scaleValue(product.energy, grams),
      carbohydrates: scaleValue(product.carbohydrates, grams),
      protein: scaleValue(product.protein, grams),
      fat: scaleValue(product.fat, grams),
    };

    const updatedFoods = meal.foods.map((f) =>
      f.id === food.id ? updatedFood : f
    );

    const totals = calculateMealTotals(updatedFoods);

    const mealRef = doc(db, "meals", user.uid, "entries", meal.id);
    await updateDoc(mealRef, {
      foods: updatedFoods,
      ...totals,
    });

    onClose();
  };

  return (
    <>
      <Modal transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, mode === "products" && styles.editFood_productModal]}>

            {/* CHOOSE MODE */}
            {mode === "choose" && (
              <>
                <Text style={styles.modalTitle}>Edit Food</Text>

                <TouchableOpacity
                  style={styles.editFood_optionButton}
                  onPress={() => setMode("manual")}
                >
                  <Text style={styles.editFood_optionText}>Edit manually</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editFood_optionButton}
                  onPress={() => {
                    onClose();
                    navigation.navigate("FoodSearch", {
                      editingFoodId: food.id,
                      mealId: meal.id,
                      returnTo: "EditFood",
                    });
                  }}
                >
                  <Text style={styles.editFood_optionText}>Search online</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editFood_optionButton}
                  onPress={() => setMode("products")}
                >
                  <Text style={styles.editFood_optionText}>Pick from products</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editFood_optionButton}
                  onPress={() => {
                    onClose();
                    navigation.navigate("FavoriteFoods", {
                      editingFoodId: food.id,
                      mealId: meal.id,
                      returnTo: "EditFood",
                    });
                  }}
                >
                  <Text style={styles.editFood_optionText}>Pick from Favorites ⭐</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}

            {/* MANUAL MODE */}
            {mode === "manual" && (
              <>
                <Text style={styles.modalTitle}>Edit Food Manually</Text>

                <TextInput
                  style={styles.modalInput}
                  placeholder="Name"
                  value={name}
                  onChangeText={setName}
                />

                <View style={styles.editFood_inputRow}>
                  <TextInput
                    style={styles.editFood_inputField}
                    placeholder="Serving size"
                    keyboardType="numeric"
                    value={servingSize}
                    onChangeText={setServingSize}
                  />
                  <Text style={styles.editFood_unitLabel}>g</Text>
                </View>

                <View style={styles.editFood_inputRow}>
                  <TextInput
                    style={styles.editFood_inputField}
                    placeholder="Carbohydrates"
                    keyboardType="numeric"
                    value={carbs}
                    onChangeText={setCarbs}
                  />
                  <Text style={styles.editFood_unitLabel}>g</Text>
                </View>

                <View style={styles.editFood_buttonRow}>
                  <TouchableOpacity onPress={() => setMode("choose")}>
                    <Text style={styles.modalCancel}>Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onClose}>
                    <Text style={styles.modalCancel}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.buttonPrimary}
                    onPress={saveManual}
                  >
                    <Text style={styles.buttonPrimaryText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* PRODUCT MODE */}
            {mode === "products" && (
              <>
                <Text style={styles.modalTitle}>Choose a Food</Text>

                <TextInput
                  style={styles.editFood_searchInput}
                  placeholder="Search products..."
                  value={productSearch}
                  onChangeText={setProductSearch}
                  autoFocus
                />

                <FlatList
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
                      style={styles.editFood_productItem}
                      onPress={() => {
                        setPendingProduct(item);
                        setProductServingSize(String(food.servingSize || 100));
                        setAmountPopupVisible(true);
                      }}
                    >
                      <Text style={styles.editFood_productName}>{item.name}</Text>
                      <Text style={styles.editFood_productInfo}>
                        {item.carbohydrates} g carbs
                      </Text>
                    </TouchableOpacity>
                  )}
                  style={styles.editFood_productsList}
                />

                <View style={styles.editFood_buttonRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setAmountPopupVisible(false);
                      setPendingProduct(null);
                      setMode("choose");
                    }}
                  >
                    <Text style={styles.modalCancel}>Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setAmountPopupVisible(false);
                      setPendingProduct(null);
                      onClose();
                    }}
                  >
                    <Text style={styles.modalCancel}>Close</Text>
                  </TouchableOpacity>
                </View>

                {amountPopupVisible && pendingProduct && (
                  <View style={styles.editFood_amountOverlay}>
                    <View style={styles.editFood_amountPopup}>
                      <Text style={styles.modalTitle}>How many grams?</Text>

                      <TextInput
                        style={styles.modalInput}
                        keyboardType="number-pad"
                        value={productServingSize}
                        onChangeText={setProductServingSize}
                        autoFocus
                        selectTextOnFocus
                      />

                      <TouchableOpacity
                        style={[
                          styles.editFood_optionButton,
                          !(parseInt(productServingSize, 10) > 0) && { opacity: 0.4 },
                        ]}
                        disabled={!(parseInt(productServingSize, 10) > 0)}
                        onPress={() =>
                          saveFromProduct(
                            pendingProduct,
                            parseInt(productServingSize, 10)
                          )
                        }
                      >
                        <Text style={styles.editFood_optionText}>Add</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => setAmountPopupVisible(false)}>
                        <Text style={styles.modalCancel}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}