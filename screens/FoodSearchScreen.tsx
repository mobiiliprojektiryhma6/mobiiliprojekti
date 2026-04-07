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
                        style={styles.resultItem}
                        onPress={() => handleSelect(item)}
                    >
                        <Text style={styles.resultName}>{item.name}</Text>
                        <Text style={styles.resultDetail}>
                            {item.energy} kcal | Carbs {item.carbohydrates}g | Protein {item.protein}g | Fat {item.fat}g
                        </Text>
                    </TouchableOpacity>
                )}

                {isSelected && (
                    <TouchableOpacity onPress={() => handleSelect(item)} activeOpacity={0.95}>
                        <View style={styles.detailCard}>

                            {/* Header */}
                            <View style={styles.detailHeader}>
                                <View style={styles.detailHeaderLeft}>
                                    <Text style={styles.detailName} numberOfLines={2}>{item.name}</Text>
                                    <Text style={styles.detailPerNote}>per 100 g</Text>
                                </View>
                                <View style={styles.detailEnergyBadge}>
                                    <Text style={styles.detailEnergyValue}>{item.energy}</Text>
                                    <Text style={styles.detailEnergyUnit}>kcal</Text>
                                </View>
                            </View>

                            {/* Divider */}
                            <View style={styles.detailDivider} />

                            {/* Nutrient rows */}
                            {[
                                { label: "Carbohydrates", value: item.carbohydrates, unit: "g", color: "#E67E22", ref: 130 },
                                { label: "Protein", value: item.protein, unit: "g", color: "#2980B9", ref: 50 },
                                { label: "Fat", value: item.fat, unit: "g", color: "#27AE60", ref: 78 },
                            ].map(({ label, value, unit, color, ref }) => (
                                <View key={label} style={styles.detailNutrientBlock}>
                                    <View style={styles.detailNutrientRow}>
                                        <View style={[styles.detailDot, { backgroundColor: color }]} />
                                        <Text style={styles.detailNutrientLabel}>{label}</Text>
                                        <Text style={styles.detailNutrientValue}>
                                            {value}
                                            <Text style={styles.detailNutrientUnit}> {unit}</Text>
                                        </Text>
                                    </View>
                                    <View style={styles.detailBarTrack}>
                                        <View style={[
                                            styles.detailBarFill,
                                            { width: `${Math.min((value / ref) * 100, 100)}%`, backgroundColor: color }
                                        ]} />
                                    </View>
                                </View>
                            ))}

                            {/* Add button */}
                            <TouchableOpacity
                                style={styles.addButton}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate("MealBuilder", { addedFood: item })}
                            >
                                <Text style={styles.addButtonText}>+ Add to Meal</Text>
                            </TouchableOpacity>

                        </View>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Search bar with camera icon */}
                <View style={styles.searchRow}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search food (e.g. bread, chocolate...)"
                        value={query}
                        onChangeText={(text) => setQuery(text)}
                        onSubmitEditing={() => {
                            setSearchTrigger(query);
                        }}
                        autoCorrect={false}
                        autoFocus
                    />
                    <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={() => navigation.navigate("Scanner")}
                    >
                        <Text style={{ fontSize: 22, color: "#fff" }}>📷</Text>
                    </TouchableOpacity>
                </View>

                {/* Scanned product result */}
                {scannedProduct && !selectedItem && (
                    <View style={styles.resultsSection}>
                        <Text style={styles.sectionTitle}>Scanned Product</Text>
                        {renderFoodItem(scannedProduct, "scanned")}
                    </View>
                )}

                {/* Selected item detail view */}
                {selectedItem ? (
                    <View style={styles.resultsSection}>
                        {renderFoodItem(selectedItem, "selected")}
                    </View>
                ) : (
                    <>
                        {/* Firestore results */}
                        {(localBest.length > 0 || localSimilar.length > 0) && (
                            <View style={styles.resultsSection}>
                                <Text style={styles.sectionTitle}>Your Foods</Text>
                                {localBest.map((item) => renderFoodItem(item, "local-best"))}
                                {localSimilar.map((item) => renderFoodItem(item, "local-similar"))}
                            </View>
                        )}

                        {/* Open Food Facts results */}
                        {apiLoading && (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator size="small" color="#009FE3" />
                                <Text style={styles.loadingText}>Searching online...</Text>
                            </View>
                        )}

                        {apiResults.length > 0 && (
                            <View style={styles.resultsSection}>
                                <Text style={styles.sectionTitle}>Online Results</Text>
                                {apiResults.map((item) => renderFoodItem(item, "api"))}
                            </View>
                        )}

                        {showNoResults && (
                            <Text style={styles.noResults}>No results found for "{query}"</Text>
                        )}
                    </>
                )}
            </ScrollView>

            <Modal visible={servingSizeModalVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Set amount before replacing</Text>
                        <Text style={styles.modalSubtitle}>Enter how many grams this meal item should use.</Text>

                        <TextInput
                            style={styles.modalInput}
                            keyboardType="number-pad"
                            value={servingSizeInput}
                            onChangeText={setServingSizeInput}
                            autoFocus
                            selectTextOnFocus
                            placeholder="100"
                        />

                        <TouchableOpacity
                            style={[
                                styles.modalActionButton,
                                !(parseInt(servingSizeInput, 10) > 0) && { opacity: 0.4 },
                            ]}
                            disabled={!(parseInt(servingSizeInput, 10) > 0)}
                            onPress={handleConfirmReplacementAmount}
                        >
                            <Text style={styles.modalActionText}>Confirm Replacement</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => {
                                setServingSizeModalVisible(false);
                                setPendingReplacement(null);
                            }}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#E5F7FD",
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
    },
    cameraButton: {
        backgroundColor: "#009FE3",
        padding: 10,
        borderRadius: 8,
        marginLeft: 8,
    },
    resultsSection: {
        width: "100%",
        marginTop: 14,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 6,
        color: "#333",
    },
    resultItem: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 8,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    resultItemSelected: {
        borderColor: "#009FE3",
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginBottom: 0,
    },
    resultName: {
        fontSize: 15,
        fontWeight: "600",
    },
    resultDetail: {
        fontSize: 13,
        color: "#666",
        marginTop: 2,
    },
    nutrientRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    nutrientLabel: {
        fontSize: 16,
        color: "#333",
    },
    nutrientValue: {
        fontSize: 16,
        fontWeight: "600",
    },
    perNote: {
        marginTop: 10,
        fontSize: 13,
        color: "#999",
        textAlign: "right",
    },
    loadingRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 14,
    },
    loadingText: {
        marginLeft: 8,
        color: "#666",
        fontSize: 14,
    },
    noResults: {
        marginTop: 14,
        color: "#999",
        fontStyle: "italic",
    },
    detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#009FE3",
    shadowColor: "#009FE3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
},
detailHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
},
detailHeaderLeft: {
    flex: 1,
    paddingRight: 12,
},
detailName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A2E",
    letterSpacing: -0.3,
    marginBottom: 3,
},
detailPerNote: {
    fontSize: 11,
    color: "#9B9B9B",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
},
detailEnergyBadge: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    minWidth: 64,
},
detailEnergyValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#E67E22",
    letterSpacing: -0.5,
},
detailEnergyUnit: {
    fontSize: 11,
    fontWeight: "600",
    color: "#E67E22",
    opacity: 0.8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
},
detailDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 14,
},
detailNutrientBlock: {
    marginBottom: 10,
},
detailNutrientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
},
detailDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
},
detailNutrientLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
},
detailNutrientValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A2E",
},
detailNutrientUnit: {
    fontSize: 12,
    fontWeight: "400",
    color: "#9B9B9B",
},
detailBarTrack: {
    height: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    marginLeft: 16,
    overflow: "hidden",
},
detailBarFill: {
    height: 4,
    borderRadius: 2,
    opacity: 0.75,
},
addButton: {
    marginTop: 14,
    backgroundColor: "#009FE3",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
},
addButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
},

});
