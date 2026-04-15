import React, { useState } from "react"
import { View, TouchableOpacity, Text } from "react-native"
import { StatusBar } from "expo-status-bar"
import Login from "../components/Login"
import Register from "../components/Register"
import { globalStyles } from "../src/styles/globalStyles"

export default function Loginscreen() {
  const [showRegister, setShowRegister] = useState(false)

  return (
    <View style={globalStyles.center}>
      {showRegister ? <Register /> : <Login />}

      <TouchableOpacity onPress={() => setShowRegister(prev => !prev)}>
        <Text
          style={[
            globalStyles.textPrimary,
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