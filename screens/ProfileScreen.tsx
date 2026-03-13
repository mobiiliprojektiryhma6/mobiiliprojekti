import React from "react";
import { View, Text, StyleSheet, Linking, TouchableOpacity } from "react-native";
import { useAuth } from "../src/hooks/useAuth";

export default function ProfileScreen(
) {

    const { user } = useAuth();

    const openLink = (url: string) => {
        Linking.openURL(url);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.profileName}>
                {user?.displayName ? `${user.displayName}'s Profile` : "Profile Screen"}
            </Text>

            <View style={styles.profileImage}>
            </View>


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
    profileName: {
        position: "absolute",
        top: 40,
        left: 20,
        fontSize: 24,
        fontWeight: "bold",
    },

    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20,
    },
    row: {
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
    },

    button: {
        backgroundColor: "#009FE3",
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 6,
        color: "#FFFFFF",
    },
})