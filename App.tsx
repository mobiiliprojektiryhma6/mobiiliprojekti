import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getAuth, signOut } from "firebase/auth";
import "./firebase/config";
import { useAuth } from "./src/hooks/useAuth";
import Loginscreen from "./screens/Loginscreen";
import Homescreen from "./screens/Homescreen";
import FoodDiaryScreen from "./screens/FoodDiaryScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { BarcodeScannerScreen } from "./screens/BarcodeScanner";
import MealBuilderScreen from "./screens/MealBuilderScreen";
import HamburgerMenuButton from "./components/navigation/HamburgerMenuButton";

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

export default function App() {
  const { email, loading } = useAuth();

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      console.log("User signed out! ✅");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavigation = (screenName: string) => {
    if (screenName === "Logout") {
      handleLogout();
    } else if (navigationRef.isReady()) {
      navigationRef.navigate(screenName as never);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator>
          {!email ? (
            <Stack.Screen
              name="Login"
              component={Loginscreen}
              options={{ headerShown: false }}
            />
          ) : (
            <>
              <Stack.Screen name="Home" component={Homescreen} options={{ title: "Home" }} />
              <Stack.Screen name="FoodDiary" component={FoodDiaryScreen} options={{ title: "Food Diary" }} />
              <Stack.Screen name="MealBuilder" component={MealBuilderScreen} options={{ title: "Meal Builder" }} />
              <Stack.Screen name="Scanner" component={BarcodeScannerScreen} options={{ title: "Barcode Scanner" }} />
              <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {!!email && (
        <View pointerEvents="box-none" style={styles.fab}>
          <HamburgerMenuButton onNavigate={handleNavigation} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    fontFamily: "Avenir",
    flex: 1,
    backgroundColor: "#E5F7FD",
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    zIndex: 999,
    elevation: 12,
  },
});