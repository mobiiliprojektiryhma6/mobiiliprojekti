import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AuthStatus from "../components/AuthStatus";

export default function Homescreen() {
  return (
    <View style={styles.container}>
      <Text>💊💊 Welcome to Diabetes App! 💊💊</Text>
      <Text> YOU'RE LOGGED IN! 😈 </Text>
    <AuthStatus />
    </View>
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
