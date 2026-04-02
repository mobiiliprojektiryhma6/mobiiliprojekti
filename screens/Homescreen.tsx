import React from "react";
import { View, Text, StyleSheet } from "react-native";
import AuthStatus from "../components/AuthStatus";
import TodayCarbsChart from "../components/TodaysCarbsGraph";

export default function Homescreen() {
  return (
    <View style={styles.container}>
      <TodayCarbsChart />
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
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    paddingTop: 16,
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
