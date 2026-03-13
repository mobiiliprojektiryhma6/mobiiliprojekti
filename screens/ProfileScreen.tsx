import { exp } from "firebase/firestore/pipelines";
import React from "react";
import { View, Text, StyleSheet, Linking, TouchableOpacity } from "react-native";
import AuthStatus from "../components/AuthStatus";

export default function ProfileScreen(
) {

    const openLink = (url: string) => {
        Linking.openURL(url);
    }

    return (
        <View style={styles.container}>
            <Text> Profile Screen </Text>

            <AuthStatus />

            <Text> Tärkeitä linkkejä </Text>

            <View style={styles.row}>
                <TouchableOpacity onPress={() => openLink("https://www.diabetes.fi/")}>
                    <Text style={styles.button}>Diabetesliitto </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => openLink("https://www.kanta.fi/omakanta")}>
                    <Text style={styles.button}>omaKanta </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => openLink("https://www.terveyskyla.fi/diabetestalo")}>
                    <Text style={styles.button}>Diabetes Talo </Text>
                </TouchableOpacity>
            </View>
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
    row: {
        flexDirection: "row",
        marginTop: 20,
    },
    button: {
        backgroundColor: "#009FE3",
        padding: 12,
        borderRadius: 8,
        marginTop: 20,
        marginHorizontal: 6,
        color: "#FFFFFF",
    },
})