import React from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFavoriteMeals } from "../src/hooks/useFavoriteMeals";

export default function FavoriteMeals() {
  const { meals } = useFavoriteMeals();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorite Meals</Text>

      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.mealCard}
            onPress={() => navigation.navigate("MealBuilder", { favoriteMeal: item })}
          >
            <Text style={styles.mealTitle}>{item.mealType}</Text>
            <Text style={styles.mealInfo}>{item.foods.length} foods</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  mealCard: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  mealTitle: { fontSize: 18, fontWeight: "600" },
  mealInfo: { fontSize: 14, color: "#666", marginTop: 4 },
});
