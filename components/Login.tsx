import React, { useState } from "react"
import { View, TextInput, Text, TouchableOpacity, Alert } from "react-native"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { globalStyles } from "../src/styles/globalStyles"

interface LoginProps {
    setLoggedIn?: (value: boolean) => void;
}
export default function Login({ setLoggedIn }: LoginProps): React.ReactElement {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    async function handleLogin(): Promise<void> {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        try {
            const auth = getAuth();
            const userCredential = await signInWithEmailAndPassword(auth, email,
                password);
            const user = userCredential.user;

            console.log("✅ User logged in: ", user.email); // Terminal debug

            if (setLoggedIn) setLoggedIn(true);
        } catch (error: any) {
            console.log('Login failed. Please try again.');
            if (error.code === 'auth/user-not-found') {
                console.log('No account found with this email address.');
                Alert.alert('Login failed', 'No account with email address.');
            } else if (error.code === 'auth/wrong-password') {
                console.log('Incorrect password.');
                Alert.alert('Login failed', 'Incorrect password.');
            } else if (error.code === 'auth/invalid-email') {
                console.log('Invalid email address.');
                Alert.alert('Login failed', 'Invalid email address.');
            } else if (error.code === 'auth/too-many-requests') {
                console.log('Too many failed attempts. Please try again later.');
                Alert.alert('Login failed', 'Too many failed attempts. Please try again later.');
            } else {
                Alert.alert('Login failed', 'Please try again.');
            }
        }
    }

    return (
        <View style={{ width: "100%", padding: 20 }}>
            <Text style={[globalStyles.header, { textAlign: "center" }]}>
                Welcome to GlugoMate! Please log in to continue.
            </Text>

            <TextInput
                style={globalStyles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={globalStyles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={globalStyles.buttonPrimary}
                onPress={handleLogin}
            >
                <Text style={globalStyles.buttonPrimaryText}>Log in</Text>
            </TouchableOpacity>
        </View>
    )
}