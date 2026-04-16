import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { useTheme } from "../src/theme/ThemeContext" 

type PersonalInfoSectionProps = {
    height: string | null
    weight: string | null
    onEdit: () => void
}

export default function PersonalInfoSection({ height, weight, onEdit }: PersonalInfoSectionProps) {
    const { theme, styles } = useTheme() 

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <TouchableOpacity style={styles.smallButton} onPress={onEdit}>
                    <MaterialIcons name="edit" size={22} color={theme.colors.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.rowBetween}>
                <View style={styles.column}>
                    <Text>Height (cm):</Text>
                    {height && <Text style={styles.listItem}>• {height} cm</Text>}
                </View>

                <View style={styles.column}>
                    <Text>Weight (kg):</Text>
                    {weight && <Text style={styles.listItem}>• {weight} kg</Text>}
                </View>
            </View>
        </View>
    )
}