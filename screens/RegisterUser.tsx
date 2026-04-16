import React from 'react';
import { View, Text } from 'react-native';
import Register from '../components/Register';
import { useTheme } from "../src/theme/ThemeContext";

export default function CreateAccountScreen() {
    const { theme, styles } = useTheme();

    return (
        <View style={styles.center}>
            <Text style={styles.header}>Create Account</Text>
            <Register />
        </View>
    );
}
