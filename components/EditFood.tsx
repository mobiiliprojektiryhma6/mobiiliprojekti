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
  const [productPickerVisible, setProductPickerVisible] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const [mode, setMode] = useState<"choose" | "manual">("choose");

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
  const saveFromProduct = async (product: FoodItem) => {
    if (!user) return;

    const updatedFood: FoodItem = {
      ...product,
      id: food.id, // keep same ID
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
          <View style={styles.modal}>
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
                  onPress={() => setProductPickerVisible(true)}
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
          </View>
        </View>
      </Modal>

      {/* PRODUCT PICKER MODAL */}
      <Modal visible={productPickerVisible} animationType="slide">
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 12 }}>
            Choose a Food
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Search products..."
            value={productSearch}
            onChangeText={setProductSearch}
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
                style={styles.productItem}
                onPress={() => {
                  saveFromProduct(item);
                  setProductPickerVisible(false);
                }}
              >
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productInfo}>
                  {item.carbohydrates} g carbs
                </Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={{
              padding: 12,
              backgroundColor: "#e5e7eb",
              borderRadius: 8,
              marginTop: 20,
              alignSelf: "center",
              width: "50%",
            }}
            onPress={() => setProductPickerVisible(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
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
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
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
    padding: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontWeight: "600",
  },
  productInfo: {
    color: "gray",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
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
