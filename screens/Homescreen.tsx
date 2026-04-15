import React from "react"
import { View, Text } from "react-native"
import AuthStatus from "../components/AuthStatus"
import TodayCarbsChart from "../components/TodaysCarbsGraph"
import { globalStyles } from "../src/styles/globalStyles"

export default function Homescreen() {
  return (
    <View style={globalStyles.container}>
      <TodayCarbsChart />

      <Text style={globalStyles.textPrimary}>💊💊 Welcome to Diabetes App! 💊💊</Text>
      <Text style={globalStyles.textSecondary}>YOU'RE LOGGED IN! 😈</Text>

      <AuthStatus />
    </View>
  )
}