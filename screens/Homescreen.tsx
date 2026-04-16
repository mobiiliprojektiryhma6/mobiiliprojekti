import React from "react"
import { View, Text } from "react-native"
import AuthStatus from "../components/AuthStatus"
import TodayCarbsChart from "../components/TodaysCarbsGraph"
import { useTheme } from "../src/theme/ThemeContext"

export default function Homescreen() {
  const { theme, styles } = useTheme()

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 20 }}>
      
      <TodayCarbsChart />

      <Text style={[styles.textPrimary, { color: theme.colors.text }]}>
        💊💊 Welcome to Diabetes App! 💊💊
      </Text>

      <Text style={[styles.textSecondary, { color: theme.colors.textSecondary }]}>
        YOU'RE LOGGED IN! 😈
      </Text>

      <AuthStatus />
    </View>
  )
}
