import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { useTheme } from "../src/theme/ThemeContext";

type Props = {
  food: any;
  onSave: (grams: number) => void;
  onClose: () => void;
};

export default function GramsPopup({ food, onSave, onClose }: Props) {
  const { styles } = useTheme();
  const [grams, setGrams] = useState(food.servingSize ?? 100);

  return (
    <Modal transparent animationType="fade">
      <View style={styles.grams_overlay}>
        <View style={styles.grams_popup}>
          <Text style={styles.grams_title}>Enter grams for {food.name}</Text>

          <TextInput
            style={styles.grams_input}
            keyboardType="numeric"
            value={String(grams)}
            onChangeText={(t) => setGrams(Number(t))}
          />

          <View style={styles.grams_row}>
            <TouchableOpacity style={styles.grams_cancel} onPress={onClose}>
              <Text style={styles.grams_btnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.grams_save} onPress={() => onSave(grams)}>
              <Text style={styles.grams_btnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
