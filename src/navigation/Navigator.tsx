import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../../screens/Loginscreen";
import HomeScreen from "../../screens/Homescreen";
import FoodDiaryScreen from "../../screens/FoodDiaryScreen";
import ProfileScreen from "../../screens/ProfileScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: "Home" }}
        />

        <Stack.Screen 
          name="FoodDiary" 
          component={FoodDiaryScreen} 
          options={{ title: "Food Diary" }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: "Profile" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
