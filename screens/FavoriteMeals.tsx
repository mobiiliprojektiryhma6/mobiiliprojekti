import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { getFavoriteMeals } from "../firebase/favoriteMeals";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../src/theme/ThemeContext";

export default function FavoriteMeals() {
  const [meals, setMeals] = useState<any[]>([]);
  const navigation = useNavigation<any>();
  const { theme, styles } = useTheme();

  useEffect(() => {
    const load = async () => {
      const favs = await getFavoriteMeals();
      setMeals(favs);
    };
    load();
  }, []);

  return (
    <View style={styles.favoritesMeals_container}>
      <Text style={styles.favoritesMeals_title}>Favorite Meals</Text>

      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.favoritesMeals_card}
            onPress={() => navigation.navigate("MealBuilder", { favoriteMeal: item })}
          >
            <Text style={styles.favoritesMeals_cardTitle}>{item.mealType}</Text>
            <Text style={styles.favoritesMeals_cardInfo}>{item.foods.length} foods</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
