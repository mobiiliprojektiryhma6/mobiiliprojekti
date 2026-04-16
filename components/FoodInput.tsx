import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import React from 'react';
import { FoodItem } from '../types/FoodItem';
import { useTheme } from "../src/theme/ThemeContext";

type Props = {
  onSubmit: (food: FoodItem) => void;
  onOpenScanner?: () => void;
  initial?: Partial<FoodItem>;
};

export const FoodInput: React.FC<Props> = ({ onSubmit, onOpenScanner, initial = {} }) => {
  const { theme, styles } = useTheme();

  const [name, setName] = React.useState(initial.name ?? '');
  const [energy, setEnergy] = React.useState(String(initial.energy ?? ''));
  const [carbs, setCarbs] = React.useState(String(initial.carbohydrates ?? ''));
  const [protein, setProtein] = React.useState(String(initial.protein ?? ''));
  const [fat, setFat] = React.useState(String(initial.fat ?? ''));

  const handleSubmit = () => {
    const food: FoodItem = {
      id: initial.id ?? Date.now().toString(),
      name,
      energy: Number(energy),
      carbohydrates: Number(carbs),
      protein: Number(protein),
      fat: Number(fat),
    };

    onSubmit(food);
  };

  return (
    <View style={styles.foodInput_container}>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Energy (kcal)"
        value={energy}
        onChangeText={setEnergy}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Carbs (g)"
        value={carbs}
        onChangeText={setCarbs}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Protein (g)"
        value={protein}
        onChangeText={setProtein}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Fat (g)"
        value={fat}
        onChangeText={setFat}
        keyboardType="numeric"
      />

      {onOpenScanner && (
        <TouchableOpacity
          onPress={onOpenScanner}
          style={styles.foodInput_cameraButton}
        >
          <Text style={styles.foodInput_cameraIcon}>📷</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        style={styles.buttonPrimary}
      >
        <Text style={styles.buttonPrimaryText}>Add Food</Text>
      </TouchableOpacity>
    </View>
  );
};