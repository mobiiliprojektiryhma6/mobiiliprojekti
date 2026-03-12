import { exp } from "firebase/firestore/pipelines";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import AuthStatus from "../components/AuthStatus";

export default function ProfileScreen() { 
    return (
        <View style={styles.container}>
            <Text> Profile Screen </Text>

            <AuthStatus />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E5F7FD"
    },
    title: {
        fontSize: 24,
        fontWeight: "bold"
    }
})