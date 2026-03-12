import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Login from '../components/Login';
import Register from '../components/Register';

export default function Loginscreen() {
    const [showRegister, setShowRegister] = useState(false);

    return (
        <View style={styles.container}>
            {showRegister ? <Register /> : <Login />}

            <TouchableOpacity
                onPress={() => setShowRegister((prev) => !prev)}
                style={styles.linkButton}
            >
                <Text style={styles.linkText}>
                    {showRegister
                        ? 'Already have an account? Login'
                        : "Don't have an account? Register!"}
                </Text>
            </TouchableOpacity>

            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        fontFamily: 'Avenir',
        flex: 1,
        backgroundColor: '#ffffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkButton: {
        marginTop: 20,
    },
    linkText: {
        color: '#007AFF',
        fontWeight: '600',
        marginBottom: 30,
    },
});