import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AuthStatus from '../components/AuthStatus';
import Logout from '../components/Logout';

export default function Homescreen() {
    return (
        <View style={styles.container}>
            <Text>💊💊 Welcome to Diabetes App! 💊💊</Text>
            <Text> YOU'RE LOGGED IN! 😈 </Text>
            <AuthStatus />
            <Logout />
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
});

