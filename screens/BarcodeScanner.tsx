import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function BarcodeScanner({ navigation }: { navigation: any }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    try {
      const url = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(data)}.json`;
      const response = await fetch(url, {
        headers: { "User-Agent": "DiabetesApp/1.0 (school-project)" },
      });
      const result = await response.json();

      if (result.status === 1 && result.product) {
        const p = result.product;
        const n = p.nutriments || {};
        const scannedProduct = {
          name: p.product_name || "Unknown product",
          energy: Math.round(n["energy-kcal_100g"] ?? n["energy-kcal"] ?? 0),
          carbohydrates:
            Math.round((n.carbohydrates_100g ?? n.carbohydrates ?? 0) * 10) / 10,
          protein: Math.round((n.proteins_100g ?? n.proteins ?? 0) * 10) / 10,
          fat: Math.round((n.fat_100g ?? n.fat ?? 0) * 10) / 10,
          barcode: data,
        };
        navigation.navigate("FoodSearch", { scannedProduct });
      } else {
        alert("Product not found for barcode: " + data);
        setScanned(false);
      }
    } catch (e) {
      console.error("Barcode lookup failed:", e);
      alert("Failed to look up product. Please try again.");
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#009FE3" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Camera permission is required to scan barcodes.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: [
            "ean13",
            "ean8",
            "upc_a",
            "upc_e",
            "code128",
            "code39",
            "code93",
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <View style={styles.overlay}>
        <Text style={styles.instructions}>Point the camera at a barcode</Text>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Looking up product...</Text>
        </View>
      )}

      {scanned && !loading && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.buttonText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5F7FD",
    padding: 20,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  overlay: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instructions: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 12,
  },
  bottomBar: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#009FE3",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
