import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

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
        <View style={styles.container}>
            <Text style={styles.title}>Login 💉</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Login 😈" onPress={handleLogin} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
});