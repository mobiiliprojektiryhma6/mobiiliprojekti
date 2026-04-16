import React, { useState } from "react"
import { View, TouchableOpacity, Text } from "react-native"
import { StatusBar } from "expo-status-bar"
import Login from "../components/Login"
import Register from "../components/Register"
import { useTheme } from "../src/theme/ThemeContext"

export default function Loginscreen() {
  const [showRegister, setShowRegister] = useState(false)
  const { theme, styles } = useTheme()

  return (
    <View style={styles.center}>
      {showRegister ? <Register /> : <Login />}

      <TouchableOpacity onPress={() => setShowRegister(prev => !prev)}>
        <Text
          style={[
            styles.textPrimary,
            { color: "#007AFF", marginTop: 20, fontWeight: "600" }
          ]}
        >
          {showRegister
            ? "Already have an account? Login"
            : "Don't have an account? Register!"}
        </Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  )
}
