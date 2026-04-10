import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from "react-native";

type Props = {
  food: any; // or FoodItem if you want strict typing
  onSave: (grams: number) => void;
  onClose: () => void;
};

export default function GramsPopup({ food, onSave, onClose }: Props) {

  const [grams, setGrams] = useState(food.servingSize ?? 100);

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.title}>Enter grams for {food.name}</Text>

          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(grams)}
            onChangeText={(t) => setGrams(Number(t))}
          />

          <View style={styles.row}>
            <TouchableOpacity style={styles.cancel} onPress={onClose}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.save} onPress={() => onSave(grams)}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancel: {
    backgroundColor: "#aaa",
    padding: 10,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
  },
  save: {
    backgroundColor: "#4A90E2",
    padding: 10,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
