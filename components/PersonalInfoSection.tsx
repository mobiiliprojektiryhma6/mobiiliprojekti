import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"

type PersonalInfoSectionProps = {
    height: string | null
    weight: string | null
    onEdit: () => void
}

export default function PersonalInfoSection({ height, weight, onEdit }: PersonalInfoSectionProps) {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <TouchableOpacity style={styles.smallButton} onPress={onEdit}>
                    <MaterialIcons name="edit" size={22} color="#fff" />
                </TouchableOpacity>
            </View>
            {/* Personal Information - Adding and Editing */}
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
const styles = StyleSheet.create({
    section: {
        marginTop: 20,
        width: "80%",
        paddingBottom: 10,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    smallButton: {
        backgroundColor: "#009FE3",
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    column: {
        width: "48%",
    },
    listItem: {
        marginTop: 4,
        fontSize: 16,
    },
})