import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Register from '../components/Register';

export default function CreateAccountScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <Register />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20, 
    },
});