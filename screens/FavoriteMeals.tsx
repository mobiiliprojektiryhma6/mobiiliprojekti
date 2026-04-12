import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { getFavoriteMeals } from "../firebase/favoriteMeals";
import { useNavigation } from "@react-navigation/native";

export default function FavoriteMeals() {
  const [meals, setMeals] = useState<any[]>([]);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const load = async () => {
      const favs = await getFavoriteMeals();
      setMeals(favs);
    };
    load();
  }, []);

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
