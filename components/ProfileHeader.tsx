import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "../src/theme/ThemeContext";

type ProfileHeaderProps = {
    user: any
    profileImage: string | null
    onChooseImage: () => void
}

export default function ProfileHeader({ user, profileImage, onChooseImage }: ProfileHeaderProps) {
    const { theme, styles } = useTheme();
    return (
        <>
            <View style={styles.headerLeft}>
                <Text style={[styles.profileName, { color: theme.colors.text }]}>
                    {user?.displayName || "Profile"}
                </Text>

                <Text style={[styles.emailName, { color: theme.colors.textSecondary }]}>
                    {user?.email || "Email"}
                </Text>
            </View>

            <TouchableOpacity style={styles.profileImage} onPress={onChooseImage}>
                {profileImage ? (
                    <Image
                        source={{ uri: profileImage }}
                        style={{ width: "100%", height: "100%", borderRadius: 30 }}
                    />
                ) : (
                    <MaterialIcons name="add" size={40} color={theme.colors.primary} />
                )}
            </TouchableOpacity>
        </>
    );
}
