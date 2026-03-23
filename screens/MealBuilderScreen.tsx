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

import { db } from "../firebase/config";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import MealCard from "../components/MealCard";
import { FoodItem } from "../types/FoodItem";

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
      id: editingFoodId ?? Date.now().toString(),
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

  
  const dateString = new Date().toISOString().split("T")[0];

 
  const totalEnergy = foods.reduce((sum, f) => sum + f.energy, 0);
  const totalCarbohydrates = foods.reduce((sum, f) => sum + f.carbohydrates, 0);
  const totalProtein = foods.reduce((sum, f) => sum + f.protein, 0);
  const totalFat = foods.reduce((sum, f) => sum + f.fat, 0);

  try {
    await addDoc(collection(db, "meals", user.uid, "entries"), {
      mealType,
      timestamp: serverTimestamp(),
      dateString,
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
    id: `${selectedProduct.id}-${Date.now()}`,
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Build Your Meal</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Meal</Text>

        <View style={styles.mealRow}>
          {["Breakfast", "Lunch", "Snack", "Dinner"].map((meal) => (
            <TouchableOpacity
              key={meal}
              style={[
                styles.mealButton,
                mealType === meal && styles.mealButtonSelected,
              ]}
              onPress={() => setMealType(meal)}
            >
              <Text
                style={[
                  styles.mealButtonText,
                  mealType === meal && styles.mealButtonTextSelected,
                ]}
              >
                {meal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.addFoodButton}
        onPress={() => setChooseModalVisible(true)}
      >
        <Text style={styles.addFoodButtonText}>Add Food</Text>
      </TouchableOpacity>

      {foods.length > 0 && (
        <>
          <Text style={styles.label}>Foods in this meal:</Text>

          <FlatList
            data={foods}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => startEditingFood(item)}>
                <MealCard food={item} onDelete={deleteFood} />
              </TouchableOpacity>
            )}
          />
        </>
      )}


      <TouchableOpacity style={styles.saveButton} onPress={saveMeal}>
        <Text style={styles.saveButtonText}>Save Meal</Text>
      </TouchableOpacity>


      <Modal visible={chooseModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Food</Text>

            <TouchableOpacity
              style={styles.modalAddButton}
              onPress={() => {
                setChooseModalVisible(false);
                setProductModalVisible(true);
              }}
            >
              <Text style={styles.modalAddButtonText}>Pick from products</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalAddButton}
              onPress={() => {
                setChooseModalVisible(false);
                setModalVisible(true);
              }}
            >
              <Text style={styles.modalAddButtonText}>Add custom food</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setChooseModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

  
      <Modal visible={productModalVisible} animationType="slide">
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
            Choose a Food
          </Text>

          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.productItem}
                onPress={() => {
                  setSelectedProduct(item);
                  setServingSizeInput("100");
                  setProductModalVisible(false);
                  setServingSizeModalVisible(true);
                }}
              >
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productInfo}>{item.carbohydrates} carb</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity onPress={() => setProductModalVisible(false)}>
            <Text style={{ textAlign: "center", marginTop: 20, color: "gray" }}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

 
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editingFoodId ? "Edit Food" : "Add Food"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={tempName}
              onChangeText={setTempName}
            />

            <TextInput
              style={styles.input}
              placeholder="Energy (kcal)"
              keyboardType="numeric"
              value={tempEnergy}
              onChangeText={setTempEnergy}
            />

            <TextInput
              style={styles.input}
              placeholder="Carbs (g)"
              keyboardType="numeric"
              value={tempCarbs}
              onChangeText={setTempCarbs}
            />

            <TextInput
              style={styles.input}
              placeholder="Protein (g)"
              keyboardType="numeric"
              value={tempProtein}
              onChangeText={setTempProtein}
            />

            <TextInput
              style={styles.input}
              placeholder="Fat (g)"
              keyboardType="numeric"
              value={tempFat}
              onChangeText={setTempFat}
            />

            <TouchableOpacity style={styles.modalAddButton} onPress={addOrEditFood}>
              <Text style={styles.modalAddButtonText}>
                {editingFoodId ? "Save Changes" : "Add"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={servingSizeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>How many grams?</Text>

            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={servingSizeInput}
              onChangeText={setServingSizeInput}
              autoFocus
              selectTextOnFocus
            />
            <TouchableOpacity
              style={[
                styles.modalAddButton,
                !(parseInt(servingSizeInput, 10) > 0) && { opacity: 0.4 },
              ]}
              disabled={!(parseInt(servingSizeInput, 10) > 0)}
              onPress={handleAddWithServingSize}
            >
              <Text style={styles.modalAddButtonText}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setServingSizeModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
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
});
