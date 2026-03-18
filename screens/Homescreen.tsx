import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { FoodItem } from "../types/FoodItem";
import AuthStatus from "../components/AuthStatus";
import Logout from "../components/Logout";

export default function Homescreen({ navigation }: { navigation: any }) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<FoodItem[]>([]);
  const [bestMatches, setBestMatches] = useState<FoodItem[]>([]);
  const [similarResults, setSimilarResults] = useState<FoodItem[]>([]);

  // Load products from Firestore once
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

  // Filter products when query changes
  useEffect(() => {
    if (query.trim().length === 0) {
      setBestMatches([]);
      setSimilarResults([]);
      return;
    }

    const lower = query.toLowerCase();

    const best: FoodItem[] = [];
    const similar: FoodItem[] = [];

    products.forEach((product) => {
      const name = product.name.toLowerCase();
      if (name === lower) {
        // Exact match goes first
        best.unshift(product);
      } else if (name.startsWith(lower)) {
        // Name starts with query
        best.push(product);
      } else if (name.includes(lower)) {
        // Name contains query somewhere
        similar.push(product);
      }
    });

    setBestMatches(best);
    setSimilarResults(similar);
  }, [query, products]);

  const hasResults = bestMatches.length > 0 || similarResults.length > 0;
  const showNoResults = query.trim().length > 0 && !hasResults;

  const renderFoodItem = (item: FoodItem) => (
    <TouchableOpacity key={item.id} style={styles.resultItem}>
      <Text style={styles.resultName}>{item.name}</Text>
      <Text style={styles.resultDetail}>
        {item.energy} kcal | Carbs {item.carbohydrates}g | Protein {item.protein}g | Fat {item.fat}g
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text>💊💊 Welcome to Diabetes App! 💊💊</Text>
      <Text> YOU'RE LOGGED IN! 😈 </Text>

      <AuthStatus />

      {/* Search bar with camera icon */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search food (e.g. bread, chocolate...)"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={() => navigation.navigate("Scanner")}
        >
          <Text style={{ fontSize: 22, color: "#fff" }}>📷</Text>
        </TouchableOpacity>
      </View>

      {/* Search results */}
      {bestMatches.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Best Matches</Text>
          {bestMatches.map(renderFoodItem)}
        </View>
      )}

      {similarResults.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>More Results</Text>
          {similarResults.map(renderFoodItem)}
        </View>
      )}

      {showNoResults && (
        <Text style={styles.noResults}>No results found for "{query}"</Text>
      )}

      {/* Navigation buttons */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("FoodDiary")}
      >
        <Text style={styles.buttonText}>Open Food Diary</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("MealBuilder")}
      >
        <Text style={styles.buttonText}>Open Meal Builder</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Scanner")}
      >
        <Text style={styles.buttonText}>Open Barcode Scanner</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Profile")}
      >
        <Text style={styles.buttonText}>Go to Profile</Text>
      </TouchableOpacity>

      <Logout />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#E5F7FD",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
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
    marginTop: 10,
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
  resultName: {
    fontSize: 15,
    fontWeight: "600",
  },
  resultDetail: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  noResults: {
    marginTop: 10,
    color: "#999",
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#009FE3",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
