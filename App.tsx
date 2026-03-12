import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import "./firebase/config";
import { useAuth } from "./src/hooks/useAuth";

import Loginscreen from "./screens/Loginscreen";
import Homescreen from "./screens/Homescreen";
import FoodDiaryScreen from "./screens/FoodDiaryScreen";

import { BarcodeScannerScreen } from "./screens/BarcodeScanner";
import { FoodInput } from "./components/FoodInput";

const Stack = createNativeStackNavigator();

export default function App() {
  const { email, loading } = useAuth();
  
  const [barcode, setBarcode] = useState<string | null>(null);

  const handleScanned = (code: string) => {
    setBarcode(code);
    console.log("Scanned barcode:", code);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>

        {!email ? (
          <Stack.Screen
            name="Login"
            component={Loginscreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={Homescreen}
              options={{ title: "Home" }}
            />

            <Stack.Screen
              name="FoodDiary"
              component={FoodDiaryScreen}
              options={{ title: "Food Diary" }}
            />

            <Stack.Screen name="Scanner">
              {() => (
                <BarcodeScannerScreen onScanned={handleScanned} />
              )}
            </Stack.Screen>

          </>
        )}
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    fontFamily: "Avenir",
    flex: 1,
    backgroundColor: "#E5F7FD",
    alignItems: "center",
    justifyContent: "center",
  },
});