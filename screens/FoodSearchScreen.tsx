import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Modal,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { FoodItem } from "../types/FoodItem";
import { useRoute } from "@react-navigation/native";
import { globalStyles } from "../src/styles/globalStyles"

/* Two screens work as a team -> FoodSearchScreen and BarcodeScanner
- FoodSearchScreen: search page where users type a food name to find nutritional info. It also has a camera icon that opens BarcodeScanner. 
- BarcodeScanner: camera page  where users can scan a product's barcode to look its nutritional info. After scanning the product data is sent back to FoodSearchScreen

1. FoodSearchScreen - User taps camera button -> BarcodeScanner (navigation.navigate("Scanner"))
2. BarcodeScanner - User scans barcode -> API lookup (navigation.navigate("FoodSearch", { scannedProduct }))
3. FoodSearchScreen - useEffect picks up (route.params.scannedProduct) and displays product's nutritional info

The data is passed through navigation, small data package is attacked to the navigation action
*/

export default function FoodSearchScreen({ navigation }: { navigation: any }) {
    const route = useRoute<any>();
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState<FoodItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
    const [scannedProduct, setScannedProduct] = useState<FoodItem | null>(null);
    const [searchTrigger, setSearchTrigger] = useState("");

    // Handle scanned product from BarcodeScanner - When BarcodeScanner navigates back with a scanned product
    /* if (route.params?.scannedProduct) {
          setScannedProduct(item); // save it
          setSelectedItem(item); // auto-expand its detail card
          navigation.setParams({ scannedProduct: undefined }); // clean up so it does not trigger again
    */

    useEffect(() => {
        if (route.params?.scannedProduct) {
            const p = route.params.scannedProduct;
            const item: FoodItem = {
                id: p.barcode || String(Math.random()),
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

    // Firestore results (instant)
    const [localBest, setLocalBest] = useState<FoodItem[]>([]);
    const [localSimilar, setLocalSimilar] = useState<FoodItem[]>([]);

    // Open Food Facts results (debounced API call)
    const [apiResults, setApiResults] = useState<FoodItem[]>([]);
    const [apiLoading, setApiLoading] = useState(false);
    const [servingSizeModalVisible, setServingSizeModalVisible] = useState(false);
    const [servingSizeInput, setServingSizeInput] = useState("100");
    const [pendingReplacement, setPendingReplacement] = useState<FoodItem | null>(null);

    const editingFoodId = route.params?.editingFoodId;
    const mealId = route.params?.mealId;
    const isEditingMealItem = Boolean(editingFoodId && mealId);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load local data from Firestore, convert to array and save to state
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

    /* Instant local search, every time the user types a letter, this runs intantly - User types "ch"                                                                                                                                                                                                                                       
      - Exact match?     "ch" === "ch"         → goes to "best" list (top priority)                                                                                                                                                                          
      - Starts with?     "chocolate".startsWith("ch")  → also "best"                                                                                                                                                                                         
      - Contains?        "white chocolate".includes("ch") → goes to "similar" list                                                                                                                                                                           
      - No match?        → doesn't show 
  Fast because product is loaded in memory -> no network call needed
    */
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

    /* Debounced Open Food Facts API search - At the same time the app searched Open Food Facts online DB but with 300ms delay (debounce)
    - User types "c"     → timer starts (300ms)                                                                                                                                                                                                                
    - User types "ch"    → old timer cancelled, NEW timer starts (300ms)                                                                                                                                                                                       
    - User types "cho"   → old timer cancelled, NEW timer starts (300ms)                                                                                                                                                                                       
    - User stops typing  → 300ms passes → API call fires for "cho" 
    
    Why debounce? Without it, the app would make an API call for every single keystroke (c, ch, cho, ...) = Wasteful and slow
    The debounce waits until the user pauses typing, then makes one call
  
    The API returns data (calories, carbs, protein, and fat per 100 g and it is displayed in the results)
    */
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        const q = searchTrigger;

        if (q.trim().length < 2) {
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

                const response = await fetch(url, {
                    headers: {
                        "User-Agent": "FoodAppSchoolProject/1.0 (test@test.com)",
                        "Accept": "application/json",
                    },
                });
                const text = await response.text();

                if (!text.startsWith("{")) {
                    console.log("Not JSON:", text);
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
                                id: p.code || String(Math.random()),
                                name: p.product_name,
                                energy: Math.round(n["energy-kcal_100g"] ?? n["energy-kcal"] ?? 0),
                                carbohydrates:
                                    Math.round((n.carbohydrates_100g ?? n.carbohydrates ?? 0) * 10) / 10,
                                protein: Math.round((n.proteins_100g ?? n.proteins ?? 0) * 10) / 10,
                                fat: Math.round((n.fat_100g ?? n.fat ?? 0) * 10) / 10,
                                barcode: p.code || "",
                            };
                        });
                    setApiResults(items);
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
    }, [searchTrigger]);

    const hasLocal = localBest.length > 0 || localSimilar.length > 0;
    const hasAny = hasLocal || apiResults.length > 0;
    const showNoResults = query.trim().length > 0 && !hasAny && !apiLoading;

    /* The UI - tap to expand/collapse
    - Each food item shows a compact view (name + one-line summary)
    - When tapped, it expands into a detail card showing nutritional info
    - Tap again to close the card */

    const handleSelect = (item: FoodItem) => {
        if (selectedItem?.id === item.id) {
            setSelectedItem(null); // already selected -> close it
        } else {
            setSelectedItem(item); // select and expand 
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

                            {/* Header */}
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

                            {/* Divider */}
                            <View style={globalStyles.foodSearch_detailDivider} />

                            {/* Nutrient rows */}
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

                            {/* Add button */}
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
                {/* Search bar with camera icon */}
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

                {/* Scanned product result */}
                {scannedProduct && !selectedItem && (
                    <View style={globalStyles.foodSearch_resultsSection}>
                        <Text style={globalStyles.sectionTitle}>Scanned Product</Text>
                        {renderFoodItem(scannedProduct, "scanned")}
                    </View>
                )}

                {/* Selected item detail view */}
                {selectedItem ? (
                    <View style={globalStyles.foodSearch_resultsSection}>
                        {renderFoodItem(selectedItem, "selected")}
                    </View>
                ) : (
                    <>
                        {/* Firestore results */}
                        {(localBest.length > 0 || localSimilar.length > 0) && (
                            <View style={globalStyles.foodSearch_resultsSection}>
                                <Text style={globalStyles.sectionTitle}>Your Foods</Text>
                                {localBest.map((item) => renderFoodItem(item, "local-best"))}
                                {localSimilar.map((item) => renderFoodItem(item, "local-similar"))}
                            </View>
                        )}

                        {/* Open Food Facts results */}
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

            {/* Replacement modal */}
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