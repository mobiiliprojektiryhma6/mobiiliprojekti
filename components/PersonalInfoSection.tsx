import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { globalStyles } from "../src/styles/globalStyles"

type PersonalInfoSectionProps = {
    height: string | null
    weight: string | null
    onEdit: () => void
}

export default function PersonalInfoSection({ height, weight, onEdit }: PersonalInfoSectionProps) {
    return (
        <View style={globalStyles.section}>
            <View style={globalStyles.sectionHeader}>
                <Text style={globalStyles.sectionTitle}>Personal Information</Text>

                <TouchableOpacity style={globalStyles.smallButton} onPress={onEdit}>
                    <MaterialIcons name="edit" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={globalStyles.rowBetween}>
                <View style={globalStyles.column}>
                    <Text>Height (cm):</Text>
                    {height && <Text style={globalStyles.listItem}>• {height} cm</Text>}
                </View>

                <View style={globalStyles.column}>
                    <Text>Weight (kg):</Text>
                    {weight && <Text style={globalStyles.listItem}>• {weight} kg</Text>}
                </View>
            </View>
        </View>
    )

}