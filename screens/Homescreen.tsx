import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import AuthStatus from "../components/AuthStatus";
import Logout from "../components/Logout";

export default function Homescreen({ navigation }: { navigation: any }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text>💊💊 Welcome to Diabetes App! 💊💊</Text>
      <Text> YOU'RE LOGGED IN! 😈 </Text>

      <AuthStatus />

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

      {/* Main action button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("FoodSearch")}
      >
        <Text style={styles.buttonText}>What are you eating?</Text>
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
