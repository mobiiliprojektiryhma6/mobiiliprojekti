import React from "react";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, StyleSheet } from "react-native";

import LoginScreen from "../../screens/Loginscreen";
import HomeScreen from "../../screens/Homescreen";
import FoodDiaryScreen from "../../screens/FoodDiaryScreen";
import ProfileScreen from "../../screens/ProfileScreen";
import MealBuilderScreen from "../../screens/MealBuilderScreen";
import FoodSearchScreen from "../../screens/FoodSearchScreen";
import BarcodeScanner from "../../screens/BarcodeScanner";
import HamburgerMenuButton from "../../components/navigation/HamburgerMenuButton";
import AccountSettingsScreen from "../../screens/AccountSettingsScreen";

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

export default function AppNavigator() {
  return (
    <View style={styles.root}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
          <Stack.Screen name="FoodDiary" component={FoodDiaryScreen} options={{ title: "Food Diary" }} />
          <Stack.Screen name="MealBuilder" component={MealBuilderScreen} options={{ title: "Meal Builder" }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
          <Stack.Screen name="FoodSearch" component={FoodSearchScreen} options={{ title: "Food Search" }} />
          <Stack.Screen name="Scanner" component={BarcodeScanner} options={{ title: "Scan Barcode" }} />
          <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} options={{ title: "Account Settings" }} />
        </Stack.Navigator>
      </NavigationContainer>

      <View pointerEvents="box-none" style={styles.fab}>
        <HamburgerMenuButton
          onNavigate={(screenName) => {
            if (navigationRef.isReady()) {
              navigationRef.navigate(screenName as never);
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    zIndex: 999,
    elevation: 12,
  },
});