import React from "react"
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"

type ProfileHeaderProps = {
    user: any
    profileImage: string | null
    onChooseImage: () => void
}

export default function ProfileHeader({ user, profileImage, onChooseImage }: ProfileHeaderProps) {
    return (
        <>
            <View style={styles.headerLeft}>
                <Text style={styles.profileName}>{user?.displayName || "Profile"}</Text>
                <Text style={styles.emailName}>{user?.email || "Email"}</Text>
            </View>

            {/*Profile Image - Adding and Editing */}
            <TouchableOpacity style={styles.profileImage} onPress={onChooseImage}>
                {profileImage ? (
                    <Image
                        source={{ uri: profileImage }}
                        style={{ width: "100%", height: "100%", borderRadius: 30 }}
                    />
                ) : (
                    <MaterialIcons name="add" size={40} color="#009FE3" />
                )}
            </TouchableOpacity>
        </>
    )
}

const styles = StyleSheet.create({
    headerLeft: {
        position: "absolute",
        top: 80,
        left: 40,
    },
    profileName: {
        fontSize: 24,
        left: 6,
        fontWeight: "bold",
    },
    emailName: {
        fontSize: 16,
        color: "#555",
        marginTop: 4,
    },
    profileImage: {
        position: "absolute",
        top: 40,
        right: 10,
        width: 120,
        height: 120,
        borderRadius: 32,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#009FE3",
        justifyContent: "center",
        alignItems: "center",
    },
})
