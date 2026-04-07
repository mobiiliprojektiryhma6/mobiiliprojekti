import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { FoodItem } from "../types/FoodItem";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { getAuth } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

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

    // scale factor based on original serving size
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
      id: food.id, // keep same ID
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
      {/* MAIN EDIT MODAL */}
      <Modal transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.modal, mode === "products" && styles.productModal]}>
            {/* --- Step 1: Choose edit method --- */}
            {mode === "choose" && (
              <>
                <Text style={styles.title}>Edit Food</Text>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => setMode("manual")}
                >
                  <Text style={styles.optionText}>Edit manually</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    onClose();
                    navigation.navigate("FoodSearch", {
                      editingFoodId: food.id,
                      mealId: meal.id,
                      returnTo: "EditFood",
                    });
                  }}
                >
                  <Text style={styles.optionText}>Search online</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => setMode("products")}
                >
                  <Text style={styles.optionText}>Pick from products</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}

            {/* --- Step 2: Manual edit --- */}
            {mode === "manual" && (
              <>
                <Text style={styles.title}>Edit Food Manually</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  value={name}
                  onChangeText={setName}
                />

                {/* Serving size */}
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Serving size"
                    keyboardType="numeric"
                    value={servingSize}
                    onChangeText={setServingSize}
                  />
                  <Text style={styles.unitLabel}>g</Text>
                </View>

                {/* Carbohydrates */}
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Carbohydrates"
                    keyboardType="numeric"
                    value={carbs}
                    onChangeText={(v) => setCarbs(v)}
                  />
                  <Text style={styles.unitLabel}>g</Text>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setMode("choose")}
                  >
                    <Text style={styles.cancelText}>Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveManual}
                  >
                    <Text style={styles.saveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {mode === "products" && (
              <>
                <Text style={styles.productTitle}>Choose a Food</Text>

                <TextInput
                  style={styles.searchInput}
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
                  keyboardShouldPersistTaps="handled"
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.productItem}
                      onPress={() => {
                        setPendingProduct(item);
                        setProductServingSize(String(food.servingSize || 100));
                        setAmountPopupVisible(true);
                      }}
                    >
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.productInfo}>
                        {item.carbohydrates} g carbs
                      </Text>
                    </TouchableOpacity>
                  )}
                  style={styles.productsList}
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      setAmountPopupVisible(false);
                      setPendingProduct(null);
                      setMode("choose");
                    }}
                  >
                    <Text style={styles.modalCancelButtonText}>Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      setAmountPopupVisible(false);
                      setPendingProduct(null);
                      onClose();
                    }}
                  >
                    <Text style={styles.modalCancelButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>

                {amountPopupVisible && pendingProduct && (
                  <View style={styles.amountOverlay}>
                    <View style={styles.amountPopup}>
                      <Text style={styles.title}>How many grams?</Text>

                      <TextInput
                        style={styles.input}
                        keyboardType="number-pad"
                        value={productServingSize}
                        onChangeText={setProductServingSize}
                        autoFocus
                        selectTextOnFocus
                      />

                      <TouchableOpacity
                        style={[
                          styles.optionButton,
                          !(parseInt(productServingSize, 10) > 0) && { opacity: 0.4 },
                        ]}
                        disabled={!(parseInt(productServingSize, 10) > 0)}
                        onPress={() => saveFromProduct(pendingProduct, parseInt(productServingSize, 10))}
                      >
                        <Text style={styles.optionText}>Add</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.modalCancelButton}
                        onPress={() => setAmountPopupVisible(false)}
                      >
                        <Text style={styles.modalCancelButtonText}>Cancel</Text>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  productModal: {
    width: "92%",
    maxHeight: "88%",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  productTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  optionButton: {
    backgroundColor: "#4BA3C3",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  optionText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
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
  productsList: {
    maxHeight: 360,
    marginBottom: 12,
  },
  amountOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  amountPopup: {
    width: "85%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginTop: 10,
  },
  modalCancelButton: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  modalCancelButtonText: {
    color: "gray",
    fontSize: 16,
  },
  cancelButton: {
    padding: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    marginRight: 8,
  },
  saveButton: {
    padding: 12,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    textAlign: "center",
    color: "#374151",
    fontWeight: "600",
  },
  saveText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  inputField: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  unitLabel: {
    fontSize: 16,
    color: "#555",
    marginLeft: 8,
    fontWeight: "500",
  },
});
