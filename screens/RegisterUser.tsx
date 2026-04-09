import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Register from '../components/Register';
import { globalStyles } from "../src/styles/globalStyles"

export default function CreateAccountScreen() {
    return (
        <View style={globalStyles.center}>
            <Text style={globalStyles.header}>Create Account</Text>
            <Register />
        </View>
    );
}