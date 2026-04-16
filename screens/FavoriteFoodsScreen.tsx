import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getFavoriteFoods, removeFavoriteFood } from "../firebase/favorites";
import { FoodItem } from "../types/FoodItem";
import { useTheme } from "../src/theme/ThemeContext";

export default function FavoriteFoodsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const returnTo = route.params?.returnTo;
    const editingFoodId = route.params?.editingFoodId;
    const mealId = route.params?.mealId;

    const [favoriteFoods, setFavoriteFoods] = useState<FoodItem[]>([]);
    const { theme, styles } = useTheme();

    useEffect(() => {
        const load = async () => {
            const favs = await getFavoriteFoods();
            setFavoriteFoods(favs);
        };
        load();
    }, []);

    const selectFood = (food: FoodItem) => {
        if (returnTo === "MealBuilder") {
            navigation.goBack();
            setTimeout(() => {
                navigation.navigate("MealBuilder", {
                    selectedFavoriteFood: food
                });
            }, 0);
        } else {
            navigation.navigate("FoodDiary", {
                selectedFavoriteFood: food,
                editingFoodId,
                mealId,
            });
        }
    };

    const deleteFavorite = async (food: FoodItem) => {
        await removeFavoriteFood(food.id);
        setFavoriteFoods(prev => prev.filter(f => f.id !== food.id));
    };

    return (
        <View style={styles.favorites_container}>
            <Text style={styles.favorites_title}>Favorite Foods ⭐</Text>

            {favoriteFoods.length === 0 && (
                <Text style={styles.favorites_empty}>
                    You have no favorite foods yet.
                </Text>
            )}

            <FlatList
                data={favoriteFoods}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.favorites_row}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => selectFood(item)}>
                            <Text style={styles.favorites_name}>{item.name}</Text>
                            <Text style={styles.favorites_info}>{item.carbohydrates} g carbs</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => deleteFavorite(item)}>
                            <Text style={styles.favorites_delete}>🗑</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.favorites_close}>Close</Text>
            </TouchableOpacity>
        </View>
    );
}
