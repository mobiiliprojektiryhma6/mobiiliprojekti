import React from "react"
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { globalStyles } from "../src/styles/globalStyles"

type ProfileHeaderProps = {
    user: any
    profileImage: string | null
    onChooseImage: () => void
}

export default function ProfileHeader({ user, profileImage, onChooseImage }: ProfileHeaderProps) {
    return (
        <>
            <View style={globalStyles.headerLeft}>
                <Text style={globalStyles.profileName}>{user?.displayName || "Profile"}</Text>
                <Text style={globalStyles.emailName}>{user?.email || "Email"}</Text>
            </View>

            <TouchableOpacity style={globalStyles.profileImage} onPress={onChooseImage}>
                {profileImage ? (
                    <Image source={{ uri: profileImage }} style={{ width: "100%", height: "100%", borderRadius: 30 }} />
                ) : (
                    <MaterialIcons name="add" size={40} color="#009FE3" />
                )}
            </TouchableOpacity>

        </>
    )
}