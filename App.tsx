import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { FoodInput } from "./src/components/FoodInput";
import { BarcodeScannerScreen } from "./src/screens/BarcodeScanner";

export default function App() {
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);

  const handleScanned = (code: string) => {
    setScanning(false);
    setBarcode(code);
    console.log("Scanned barcode:", code);
  };

  return (
    <View style={styles.container}>
      {!scanning && (
        <>
          <FoodInput onOpenScanner={() => setScanning(true)} />
          {barcode && (
            <Text style={styles.lastScannedText}>
              Last scanned: {barcode}
            </Text>
          )}
        </>
      )}

      {scanning && (
        <BarcodeScannerScreen onScanned={handleScanned} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 60,
    padding: 20,
    backgroundColor: "white",
  },
  lastScannedText: {
    marginTop: 20,
    fontSize: 18,
    color: "gray",
  },
});
