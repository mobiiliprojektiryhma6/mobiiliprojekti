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
import { globalStyles } from "../src/styles/globalStyles";

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
        <View style={globalStyles.modalOverlay}>
          <View style={[globalStyles.modalBox, mode === "products" && globalStyles.editFood_productModal]}>

            {/* CHOOSE MODE */}
            {mode === "choose" && (
              <>
                <Text style={globalStyles.modalTitle}>Edit Food</Text>

                <TouchableOpacity
                  style={globalStyles.editFood_optionButton}
                  onPress={() => setMode("manual")}
                >
                  <Text style={globalStyles.editFood_optionText}>Edit manually</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={globalStyles.editFood_optionButton}
                  onPress={() => {
                    onClose();
                    navigation.navigate("FoodSearch", {
                      editingFoodId: food.id,
                      mealId: meal.id,
                      returnTo: "EditFood",
                    });
                  }}
                >
                  <Text style={globalStyles.editFood_optionText}>Search online</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={globalStyles.editFood_optionButton}
                  onPress={() => setMode("products")}
                >
                  <Text style={globalStyles.editFood_optionText}>Pick from products</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={globalStyles.editFood_optionButton}
                  onPress={() => {
                    onClose();
                    navigation.navigate("FavoriteFoods", {
                      editingFoodId: food.id,
                      mealId: meal.id,
                      returnTo: "EditFood",
                    });
                  }}
                >
                  <Text style={globalStyles.editFood_optionText}>Pick from Favorites ⭐</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose}>
                  <Text style={globalStyles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}

            {/* MANUAL MODE */}
            {mode === "manual" && (
              <>
                <Text style={globalStyles.modalTitle}>Edit Food Manually</Text>

                <TextInput
                  style={globalStyles.modalInput}
                  placeholder="Name"
                  value={name}
                  onChangeText={setName}
                />

                <View style={globalStyles.editFood_inputRow}>
                  <TextInput
                    style={globalStyles.editFood_inputField}
                    placeholder="Serving size"
                    keyboardType="numeric"
                    value={servingSize}
                    onChangeText={setServingSize}
                  />
                  <Text style={globalStyles.editFood_unitLabel}>g</Text>
                </View>

                <View style={globalStyles.editFood_inputRow}>
                  <TextInput
                    style={globalStyles.editFood_inputField}
                    placeholder="Carbohydrates"
                    keyboardType="numeric"
                    value={carbs}
                    onChangeText={setCarbs}
                  />
                  <Text style={globalStyles.editFood_unitLabel}>g</Text>
                </View>

                <View style={globalStyles.editFood_buttonRow}>
                  <TouchableOpacity onPress={() => setMode("choose")}>
                    <Text style={globalStyles.modalCancel}>Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onClose}>
                    <Text style={globalStyles.modalCancel}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={globalStyles.buttonPrimary}
                    onPress={saveManual}
                  >
                    <Text style={globalStyles.buttonPrimaryText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* PRODUCT MODE */}
            {mode === "products" && (
              <>
                <Text style={globalStyles.modalTitle}>Choose a Food</Text>

                <TextInput
                  style={globalStyles.editFood_searchInput}
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
                      style={globalStyles.editFood_productItem}
                      onPress={() => {
                        setPendingProduct(item);
                        setProductServingSize(String(food.servingSize || 100));
                        setAmountPopupVisible(true);
                      }}
                    >
                      <Text style={globalStyles.editFood_productName}>{item.name}</Text>
                      <Text style={globalStyles.editFood_productInfo}>
                        {item.carbohydrates} g carbs
                      </Text>
                    </TouchableOpacity>
                  )}
                  style={globalStyles.editFood_productsList}
                />

                <View style={globalStyles.editFood_buttonRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setAmountPopupVisible(false);
                      setPendingProduct(null);
                      setMode("choose");
                    }}
                  >
                    <Text style={globalStyles.modalCancel}>Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setAmountPopupVisible(false);
                      setPendingProduct(null);
                      onClose();
                    }}
                  >
                    <Text style={globalStyles.modalCancel}>Close</Text>
                  </TouchableOpacity>
                </View>

                {amountPopupVisible && pendingProduct && (
                  <View style={globalStyles.editFood_amountOverlay}>
                    <View style={globalStyles.editFood_amountPopup}>
                      <Text style={globalStyles.modalTitle}>How many grams?</Text>

                      <TextInput
                        style={globalStyles.modalInput}
                        keyboardType="number-pad"
                        value={productServingSize}
                        onChangeText={setProductServingSize}
                        autoFocus
                        selectTextOnFocus
                      />

                      <TouchableOpacity
                        style={[
                          globalStyles.editFood_optionButton,
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
                        <Text style={globalStyles.editFood_optionText}>Add</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => setAmountPopupVisible(false)}>
                        <Text style={globalStyles.modalCancel}>Cancel</Text>
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
