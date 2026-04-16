import React, { useState } from "react"
import { View, TextInput, Text, TouchableOpacity, Alert } from "react-native"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { useTheme } from "../src/theme/ThemeContext" 

interface LoginProps {
    setLoggedIn?: (value: boolean) => void;
}

export default function Login({ setLoggedIn }: LoginProps): React.ReactElement {
    const { theme, styles } = useTheme() 

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    async function handleLogin(): Promise<void> {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        try {
            const auth = getAuth();
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("✅ User logged in: ", user.email);

            if (setLoggedIn) setLoggedIn(true);
        } catch (error: any) {
            console.log('Login failed. Please try again.');
            if (error.code === 'auth/user-not-found') {
                console.log('No account found with this email address.');
            } else if (error.code === 'auth/wrong-password') {
                console.log('Incorrect password.');
            } else if (error.code === 'auth/invalid-email') {
                console.log('Invalid email address.');
            } else if (error.code === 'auth/too-many-requests') {
                console.log('Too many failed attempts. Please try again later.');
            }
        }
    }

    return (
        <View style={{ width: "100%", padding: 20 }}>
            <Text style={[styles.header, { textAlign: "center" }]}>
                Login 💉
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.buttonPrimary}
                onPress={handleLogin}
            >
                <Text style={styles.buttonPrimaryText}>Login 😈</Text>
            </TouchableOpacity>
        </View>
    )
}