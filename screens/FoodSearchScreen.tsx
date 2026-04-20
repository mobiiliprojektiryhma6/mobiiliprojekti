import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Modal,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { FoodItem } from "../types/FoodItem";
import { useRoute } from "@react-navigation/native";
import NutritionCircle from "../components/NutritionalCircle";
import { saveProductsToFirestore } from "../src/utils/productCache";
import { getFavoriteFoods, addFavoriteFood, removeFavoriteFood } from "../firebase/favorites";

import { globalStyles } from "../src/styles/globalStyles";

export default function FoodSearchScreen({ navigation }: { navigation: any }) {
    const route = useRoute<any>();
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState<FoodItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
    const [scannedProduct, setScannedProduct] = useState<FoodItem | null>(null);
    const [searchTrigger, setSearchTrigger] = useState("");

    const [favoriteFoods, setFavoriteFoods] = useState<FoodItem[]>([]);

    useEffect(() => {
        const loadFavorites = async () => {
            const favs = await getFavoriteFoods();
            setFavoriteFoods(favs);
        };
        loadFavorites();
    }, []);

    const toggleFavorite = async (food: FoodItem) => {
        const isFav = favoriteFoods.some(f => f.id === food.id);

        if (isFav) {
            await removeFavoriteFood(food.id);
            setFavoriteFoods(prev => prev.filter(f => f.id !== food.id));
        } else {
            await addFavoriteFood(food);
            setFavoriteFoods(prev => [...prev, food]);
        }
    };

    useEffect(() => {
        if (route.params?.scannedProduct) {
            const p = route.params.scannedProduct;
            const item: FoodItem = {
                id: p.barcode || p.name.toLowerCase().replace(/\s+/g, "-"),
                name: p.name,
                energy: p.energy,
                carbohydrates: p.carbohydrates,
                protein: p.protein,
                fat: p.fat,
                barcode: p.barcode,
            };
            setScannedProduct(item);
            setSelectedItem(item);
            navigation.setParams({ scannedProduct: undefined });
        }
    }, [route.params?.scannedProduct]);

    const [localBest, setLocalBest] = useState<FoodItem[]>([]);
    const [localSimilar, setLocalSimilar] = useState<FoodItem[]>([]);

    const [apiResults, setApiResults] = useState<FoodItem[]>([]);
    const [apiLoading, setApiLoading] = useState(false);
    const [servingSizeModalVisible, setServingSizeModalVisible] = useState(false);
    const [servingSizeInput, setServingSizeInput] = useState("100");
    const [pendingReplacement, setPendingReplacement] = useState<FoodItem | null>(null);

    const editingFoodId = route.params?.editingFoodId;
    const mealId = route.params?.mealId;
    const isEditingMealItem = Boolean(editingFoodId && mealId);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const snapshot = await getDocs(collection(db, "products"));
                const items = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as FoodItem[];
                setProducts(items);
            } catch (e) {
                console.error("Failed to load products:", e);
            }
        };
        loadProducts();
    }, []);

    useEffect(() => {
        if (query.trim().length === 0) {
            setLocalBest([]);
            setLocalSimilar([]);
            setApiResults([]);
            setApiLoading(false);
            return;
        }

        const lower = query.toLowerCase();
        const best: FoodItem[] = [];
        const similar: FoodItem[] = [];

        products.forEach((product) => {
            const name = product.name.toLowerCase();
            if (name === lower) {
                best.unshift(product);
            } else if (name.startsWith(lower)) {
                best.push(product);
            } else if (name.includes(lower)) {
                similar.push(product);
            }
        });

        setLocalBest(best);
        setLocalSimilar(similar);
    }, [query, products]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const q = searchTrigger;

        if (q.trim().length < 2) {
            setApiResults([]);
            setApiLoading(false);
            return;
        }

        if (localBest.length >= 3) {
            setApiResults([]);
            setApiLoading(false);
            return;
        }

        setApiLoading(true);

        debounceRef.current = setTimeout(async () => {
            try {
                await new Promise(r => setTimeout(r, 200));

                const url =
                    `https://world.openfoodfacts.net/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=5`;

                const response = await fetch(url);
                const text = await response.text();

                if (!text.startsWith("{")) {
                    setApiResults([]);
                    setApiLoading(false);
                    return;
                }

                const data = JSON.parse(text);

                if (data.products && Array.isArray(data.products)) {
                    const items: FoodItem[] = data.products
                        .filter((p: any) => p.product_name)
                        .map((p: any) => {
                            const n = p.nutriments || {};
                            return {
                                id: p.code || p.product_name.toLowerCase().replace(/\s+/g, "-"),
                                name: p.product_name,
                                energy: Math.round(n["energy-kcal_100g"] ?? 0),
                                carbohydrates: Math.round((n.carbohydrates_100g ?? 0) * 10) / 10,
                                protein: Math.round((n.proteins_100g ?? 0) * 10) / 10,
                                fat: Math.round((n.fat_100g ?? 0) * 10) / 10,
                                barcode: p.code || "",
                            };
                        });

                    setApiResults(items);
                    saveProductsToFirestore(items).catch(console.error);
                } else {
                    setApiResults([]);
                }
            } catch (e) {
                console.error("Open Food Facts search failed:", e);
                setApiResults([]);
            } finally {
                setApiLoading(false);
            }
        }, 2000);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchTrigger, localBest.length]);

    const hasLocal = localBest.length > 0 || localSimilar.length > 0;
    const hasAny = hasLocal || apiResults.length > 0;
    const showNoResults = query.trim().length > 0 && !hasAny && !apiLoading;

    const handleSelect = (item: FoodItem) => {
        if (selectedItem?.id === item.id) {
            setSelectedItem(null);
        } else {
            setSelectedItem(item);
        }
    };

    const handleAddFood = (item: FoodItem) => {
        if (isEditingMealItem) {
            setPendingReplacement(item);
            setServingSizeInput(String(item.servingSize ?? 100));
            setServingSizeModalVisible(true);
            return;
        }

        navigation.navigate("MealBuilder", {
            addedFood: item,
            selectedDate: route.params?.selectedDate,
        });
    };

    const scaleValue = (value: number, grams: number) => {
        const scaled = value * (grams / 100);
        return Math.round(scaled * 10) / 10;
    };

    const handleConfirmReplacementAmount = () => {
        if (!pendingReplacement) return;

        const grams = parseInt(servingSizeInput, 10);
        if (!grams || grams <= 0) return;

        const scaledFood: FoodItem = {
            ...pendingReplacement,
            servingSize: grams,
            per100g: false,
            energy: scaleValue(pendingReplacement.energy, grams),
            carbohydrates: scaleValue(pendingReplacement.carbohydrates, grams),
            protein: scaleValue(pendingReplacement.protein, grams),
            fat: scaleValue(pendingReplacement.fat, grams),
        };

        navigation.navigate("FoodDiary", {
            replaceFood: scaledFood,
            editingFoodId,
            mealId,
        });

        setServingSizeModalVisible(false);
        setPendingReplacement(null);
    };

    const renderFoodItem = (item: FoodItem, source: string) => {
        const isSelected = selectedItem?.id === item.id;

        return (
            <View key={`${source}-${item.id}`}>
                {!isSelected && (
                    <TouchableOpacity
                        style={globalStyles.card}
                        onPress={() => handleSelect(item)}
                    >
                        <Text style={globalStyles.textPrimary}>{item.name}</Text>
                        <Text style={globalStyles.foodSearch_resultDetail}>
                            {item.energy} kcal | Carbs {item.carbohydrates}g | Protein {item.protein}g | Fat {item.fat}g
                        </Text>
                    </TouchableOpacity>
                )}

                {isSelected && (
                    <TouchableOpacity onPress={() => handleSelect(item)} activeOpacity={0.95}>
                        <View style={globalStyles.card}>

                            <View style={globalStyles.foodSearch_detailHeader}>
                                <View style={globalStyles.foodSearch_detailHeaderLeft}>
                                    <Text style={globalStyles.foodSearch_detailName} numberOfLines={2}>
                                        {item.name}
                                    </Text>
                                    <Text style={globalStyles.foodSearch_detailPerNote}>per 100 g</Text>
                                </View>

                                <View style={globalStyles.foodSearch_detailEnergyBadge}>
                                    <Text style={globalStyles.foodSearch_detailEnergyValue}>{item.energy}</Text>
                                    <Text style={globalStyles.foodSearch_detailEnergyUnit}>kcal</Text>
                                </View>
                            </View>

                            <View style={globalStyles.foodSearch_detailDivider} />

                            {[ 
                                { label: "Carbohydrates", value: item.carbohydrates, unit: "g", color: "#E67E22", ref: 130 },
                                { label: "Protein", value: item.protein, unit: "g", color: "#2980B9", ref: 50 },
                                { label: "Fat", value: item.fat, unit: "g", color: "#27AE60", ref: 78 },
                            ].map(({ label, value, unit, color, ref }) => (
                                <View key={label} style={globalStyles.foodSearch_detailNutrientBlock}>
                                    <View style={globalStyles.foodSearch_detailNutrientRow}>
                                        <View style={[globalStyles.foodSearch_detailDot, { backgroundColor: color }]} />
                                        <Text style={globalStyles.foodSearch_detailNutrientLabel}>{label}</Text>
                                        <Text style={globalStyles.foodSearch_detailNutrientValue}>
                                            {value}
                                            <Text style={globalStyles.foodSearch_detailNutrientUnit}> {unit}</Text>
                                        </Text>
                                    </View>

                                    <View style={globalStyles.foodSearch_detailBarTrack}>
                                        <View
                                            style={[
                                                globalStyles.foodSearch_detailBarFill,
                                                {
                                                    width: `${Math.min((value / ref) * 100, 100)}%`,
                                                    backgroundColor: color,
                                                },
                                            ]}
                                        />
                                    </View>
                                </View>
                            ))}

                            <TouchableOpacity
                                style={globalStyles.buttonPrimary}
                                activeOpacity={0.8}
                                onPress={() => handleAddFood(item)}
                            >
                                <Text style={globalStyles.buttonPrimaryText}>
                                    {isEditingMealItem ? "Replace in Meal" : "+ Add to Meal"}
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <>
            <ScrollView
                contentContainerStyle={globalStyles.container}
                keyboardShouldPersistTaps="handled"
            >
                <View style={globalStyles.foodSearch_searchRow}>
                    <TextInput
                        style={globalStyles.input}
                        placeholder="Search food (e.g. bread, chocolate...)"
                        value={query}
                        onChangeText={(text) => setQuery(text)}
                        onSubmitEditing={() => setSearchTrigger(query)}
                        autoCorrect={false}
                        autoFocus
                    />

                    <TouchableOpacity
                        style={globalStyles.foodSearch_cameraButton}
                        onPress={() => navigation.navigate("Scanner")}
                    >
                        <Text style={{ fontSize: 22, color: "#fff" }}>📷</Text>
                    </TouchableOpacity>
                </View>

                {scannedProduct && !selectedItem && (
                    <View style={globalStyles.foodSearch_resultsSection}>
                        <Text style={globalStyles.sectionTitle}>Scanned Product</Text>
                        {renderFoodItem(scannedProduct, "scanned")}
                    </View>
                )}

                {selectedItem ? (
                    <View style={globalStyles.foodSearch_resultsSection}>
                        {renderFoodItem(selectedItem, "selected")}
                    </View>
                ) : (
                    <>
                        {(localBest.length > 0 || localSimilar.length > 0) && (
                            <View style={globalStyles.foodSearch_resultsSection}>
                                <Text style={globalStyles.sectionTitle}>Your Foods</Text>
                                {localBest.map((item) => renderFoodItem(item, "local-best"))}
                                {localSimilar.map((item) => renderFoodItem(item, "local-similar"))}
                            </View>
                        )}

                        {apiLoading && (
                            <View style={globalStyles.row}>
                                <ActivityIndicator size="small" color="#009FE3" />
                                <Text style={globalStyles.textSecondary}>Searching online...</Text>
                            </View>
                        )}

                        {apiResults.length > 0 && (
                            <View style={globalStyles.foodSearch_resultsSection}>
                                <Text style={globalStyles.sectionTitle}>Online Results</Text>
                                {apiResults.map((item) => renderFoodItem(item, "api"))}
                            </View>
                        )}

                        {showNoResults && (
                            <Text style={globalStyles.textSecondary}>
                                No results found for "{query}"
                            </Text>
                        )}
                    </>
                )}
            </ScrollView>

            <Modal visible={servingSizeModalVisible} transparent animationType="fade">
                <View style={globalStyles.modalOverlay}>
                    <View style={globalStyles.modalBox}>
                        <Text style={globalStyles.modalTitle}>Set amount before replacing</Text>
                        <Text style={globalStyles.modalDescription}>
                            Enter how many grams this meal item should use.
                        </Text>

                        <TextInput
                            style={globalStyles.modalInput}
                            keyboardType="number-pad"
                            value={servingSizeInput}
                            onChangeText={setServingSizeInput}
                            autoFocus
                            selectTextOnFocus
                            placeholder="100"
                        />

                        <TouchableOpacity
                            style={[
                                globalStyles.buttonPrimary,
                                !(parseInt(servingSizeInput, 10) > 0) && { opacity: 0.4 },
                            ]}
                            disabled={!(parseInt(servingSizeInput, 10) > 0)}
                            onPress={handleConfirmReplacementAmount}
                        >
                            <Text style={globalStyles.buttonPrimaryText}>Confirm Replacement</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={globalStyles.modalButtons}
                            onPress={() => {
                                setServingSizeModalVisible(false);
                                setPendingReplacement(null);
                            }}
                        >
                            <Text style={globalStyles.modalCancel}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}