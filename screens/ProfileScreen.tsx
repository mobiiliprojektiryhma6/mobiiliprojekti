import React from "react";
import { View, Text, StyleSheet, Linking, TouchableOpacity, TextInput } from "react-native";
import { useAuth } from "../src/hooks/useAuth";

export default function ProfileScreen() {

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
                <Text style={{ color: "#009FE3", fontSize: 32 }}>+</Text>
            </View>

            <View style={styles.userInfo}>
                <Text>Email: {user?.email || "N/A"}</Text>
            </View>

            <View style={styles.userInfo}>
                <Text>Perussairaudet:</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Lisää perussairaudet"
                />
            </View>

            <View style={styles.userInfo}>
                <Text>Allergiat:</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Lisää allergiat"
                />
            </View>

            <Text style={styles.userInfo}>Linkit:</Text>

            <View style={styles.row}>
                <TouchableOpacity onPress={() => openLink("https://www.diabetes.fi/")}>
                    <Text style={styles.button}>Diabetesliitto</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => openLink("https://www.kanta.fi/omakanta")}>
                    <Text style={styles.button}>omaKanta</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => openLink("https://www.terveyskyla.fi/diabetestalo")}>
                    <Text style={styles.button}>Diabetes Talo</Text>
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
        top: 80,
        left: 25,
        fontSize: 24,
        fontWeight: "bold",
    },
    profileImage: {
        position: "absolute",
        top: 40,
        right: 25,
        width: 120,
        height: 120,
        borderRadius: 30,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#009FE3",
        justifyContent: "center",
        alignItems: "center",
    },
    userInfo: {
        marginTop: 20,
        fontSize: 18,
        width: "80%",
    },
    textInput: {
        marginTop: 6,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#fff",
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