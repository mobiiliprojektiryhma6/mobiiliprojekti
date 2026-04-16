import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity } from "react-native"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth } from "../firebase/config"
import { RegisterForm, initialState } from "../types/RegisterTypes"
import { useTheme } from "../src/theme/ThemeContext" 

const Register = () => {
    const { theme, styles } = useTheme()

    const [values, setValues] = useState<RegisterForm>(initialState)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleChange = (name: keyof RegisterForm, value: string) => {
        setValues((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {
        setError(null)
        setLoading(true)

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                values.email,
                values.password
            )

            await updateProfile(userCredential.user, {
                displayName: values.displayName,
            })

            console.log("User registered:", userCredential.user)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={{ width: "100%", padding: 20, alignItems: "center" }}>
            <TextInput
                style={styles.input}
                placeholder="Display Name"
                value={values.displayName}
                onChangeText={(value) => handleChange("displayName", value)}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={values.email}
                onChangeText={(value) => handleChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={values.password}
                onChangeText={(value) => handleChange("password", value)}
                secureTextEntry
            />

            {error && (
                <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
            )}

            <TouchableOpacity
                style={styles.buttonPrimary}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.buttonPrimaryText}>
                    {loading ? "Registering..." : "Register"}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

export default Register