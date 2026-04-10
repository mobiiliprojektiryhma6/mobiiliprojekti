import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getFavoriteFoods, removeFavoriteFood } from "../firebase/favorites";
import { FoodItem } from "../types/FoodItem";

export default function FavoriteFoodsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const returnTo = route.params?.returnTo;
    const editingFoodId = route.params?.editingFoodId;
    const mealId = route.params?.mealId;

    const [favoriteFoods, setFavoriteFoods] = useState<FoodItem[]>([]);

    useEffect(() => {
        const load = async () => {
            const favs = await getFavoriteFoods();
            setFavoriteFoods(favs);
        };
        load();
    }, []);

const selectFood = (food: FoodItem) => {
    if (returnTo === "MealBuilder") {
        navigation.navigate("MealBuilder", {
            selectedFavoriteFood: food
        });
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
        <View style={styles.container}>
            <Text style={styles.title}>Favorite Foods ⭐</Text>

            {favoriteFoods.length === 0 && (
                <Text style={styles.empty}>You have no favorite foods yet.</Text>
            )}

            <FlatList
                data={favoriteFoods}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => selectFood(item)}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.info}>{item.carbohydrates} g carbs</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => deleteFavorite(item)}>
                            <Text style={styles.delete}>🗑</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.close}>Close</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#E5F7FD" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
    empty: { color: "gray", marginBottom: 20 },
    row: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 10,
    },
    name: { fontSize: 16, fontWeight: "bold" },
    info: { fontSize: 14, color: "gray" },
    delete: { fontSize: 22, marginLeft: 10 },
    close: { textAlign: "center", marginTop: 20, color: "gray" },
});
