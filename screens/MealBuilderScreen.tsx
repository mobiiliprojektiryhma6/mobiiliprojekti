import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";

export default function MealBuilderScreen() {
  const [servingSize, setServingSize] = useState("");
  const [mealType, setMealType] = useState("Lunch");

  const [foods, setFoods] = useState<any[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [tempFoodName, setTempFoodName] = useState("");
  const [tempFoodAmount, setTempFoodAmount] = useState("");

  const addFoodToMeal = () => {
    if (!tempFoodName.trim()) return;

    const newFood = {
      id: Date.now().toString(),
      name: tempFoodName,
      amount: tempFoodAmount || "1",
    };

    setFoods([...foods, newFood]);
    setTempFoodName("");
    setTempFoodAmount("");
    setModalVisible(false);
  };

  const saveMeal = () => {
    console.log("Saving meal:", {
      mealType,
      foods,
    });

    alert("Meal saved (placeholder)");
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
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addFoodButtonText}>Add Food</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Foods in this meal:</Text>

      {foods.length === 0 ? (
        <Text style={styles.emptyText}>No foods added yet.</Text>
      ) : (
        <FlatList
          data={foods}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.foodItem}>
              <Text style={styles.foodText}>
                {item.name} — {item.amount}
              </Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={saveMeal}>
        <Text style={styles.saveButtonText}>Save Meal</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Food</Text>

            <TextInput
              style={styles.input}
              placeholder="Food name"
              value={tempFoodName}
              onChangeText={setTempFoodName}
            />

            <TextInput
              style={styles.input}
              placeholder="Amount (e.g. 1 piece, 150g)"
              value={tempFoodAmount}
              onChangeText={setTempFoodAmount}
            />

            <TouchableOpacity style={styles.modalAddButton} onPress={addFoodToMeal}>
              <Text style={styles.modalAddButtonText}>Add</Text>
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
  foodItem: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  foodText: {
    fontSize: 16,
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
});
