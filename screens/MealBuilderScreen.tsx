import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";

export default function MealBuilderScreen() {
  const [servingSize, setServingSize] = useState("");
  const [mealType, setMealType] = useState("Lunch");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Food to Diary</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Serving size</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          keyboardType="numeric"
          value={servingSize}
          onChangeText={setServingSize}
        />
      </View>

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

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>Add to Food Diary</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5F7FD",
    padding: 20,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
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
  addButton: {
    marginTop: 40,
    backgroundColor: "#009FE3",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
