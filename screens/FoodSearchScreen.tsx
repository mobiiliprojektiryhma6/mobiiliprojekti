import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
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

    if (query.trim().length < 2) {
      setApiResults([]);
      setApiLoading(false);
      return;
    }

    setApiLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          query
        )}&search_simple=1&action=process&json=1&page_size=10&fields=product_name,nutriments,code`;

        const response = await fetch(url, {
          headers: { "User-Agent": "DiabetesApp/1.0 (school-project)" },
        });
        const data = await response.json();

        if (data.products) {
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
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

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
          <TouchableOpacity onPress={() => handleSelect(item)}>
            <View style={styles.detailCard}>
              <Text style={styles.detailName}>{item.name}</Text>

              <View style={styles.nutrientRow}>
                <Text style={styles.nutrientLabel}>Energy</Text>
                <Text style={styles.nutrientValue}>{item.energy} kcal</Text>
              </View>
              <View style={styles.nutrientRow}>
                <Text style={styles.nutrientLabel}>Carbohydrates</Text>
                <Text style={styles.nutrientValue}>{item.carbohydrates} g</Text>
              </View>
              <View style={styles.nutrientRow}>
                <Text style={styles.nutrientLabel}>Protein</Text>
                <Text style={styles.nutrientValue}>{item.protein} g</Text>
              </View>
              <View style={styles.nutrientRow}>
                <Text style={styles.nutrientLabel}>Fat</Text>
                <Text style={styles.nutrientValue}>{item.fat} g</Text>
              </View>
              <Text style={styles.perNote}>Per 100g</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Search bar with camera icon */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search food (e.g. bread, chocolate...)"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setSelectedItem(null);
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
  detailCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#009FE3",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginBottom: 6,
  },
  detailName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  detailBarcode: {
    fontSize: 13,
    color: "#999",
    marginBottom: 12,
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
});
