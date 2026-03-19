import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";

export const BarcodeScannerScreen = () => {
  const navigation = useNavigation<any>();
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  // Reset scanned state when screen comes back into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setScanned(false);
    });
    return unsubscribe;
  }, [navigation]);

  const lookupBarcode = async (barcode: string) => {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
        {
          headers: { "User-Agent": "DiabetesApp/1.0 (school-project)" },
        }
      );
      const data = await response.json();

      if (data.status !== 1 || !data.product) {
        alert("Product not found for this barcode.");
        setScanned(false);
        return;
      }

      const p = data.product;
      const n = p.nutriments || {};

      navigation.navigate("ProductDetail", {
        name: p.product_name || p.product_name_en || "Unknown product",
        energy: Math.round(n["energy-kcal_100g"] ?? n["energy-kcal"] ?? 0),
        carbohydrates:
          Math.round((n.carbohydrates_100g ?? n.carbohydrates ?? 0) * 10) / 10,
        protein:
          Math.round((n.proteins_100g ?? n.proteins ?? 0) * 10) / 10,
        fat: Math.round((n.fat_100g ?? n.fat ?? 0) * 10) / 10,
        barcode,
        source: "scanner",
      });
    } catch (e) {
      alert("Failed to fetch product info. Check your connection.");
      setScanned(false);
    }
  };

  if (!permission) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (!permission.granted) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128"],
        }}
        onBarcodeScanned={(result) => {
          if (scanned) return;
          setScanned(true);
          lookupBarcode(result.data);
        }}
      />
      {scanned && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Looking up product...</Text>
        </View>
      )}
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Point camera at a barcode</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  overlayText: {
    color: "#fff",
    fontSize: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
});
