import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity } from "react-native"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth } from "../firebase/config"
import { RegisterForm, initialState } from "../types/RegisterTypes"
import { globalStyles } from "../src/styles/globalStyles"

const Register = () => {
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
                style={globalStyles.input}
                placeholder="Display Name"
                value={values.displayName}
                onChangeText={(value) => handleChange("displayName", value)}
            />
            <TextInput
                style={globalStyles.input}
                placeholder="Email"
                value={values.email}
                onChangeText={(value) => handleChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={globalStyles.input}
                placeholder="Password"
                value={values.password}
                onChangeText={(value) => handleChange("password", value)}
                secureTextEntry
            />

            {error && (
                <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
            )}

            <TouchableOpacity
                style={globalStyles.buttonPrimary}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={globalStyles.buttonPrimaryText}>
                    {loading ? "Registering..." : "Register"}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

export default Register
