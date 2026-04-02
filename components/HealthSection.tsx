import React, { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { exp } from "firebase/firestore/pipelines"

type HealthSectionProps = {
    title: string
    items: string[]
    onAdd: () => void
    onDelete: (index: number) => void
}

export default function HealthSection({ title, items, onAdd, onDelete }: HealthSectionProps) {
    const [open, setOpen] = useState(false)
    return (
        <View style={styles.section}>
            {/* Header */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.smallButton, { marginRight: 12 }]}
                        onPress={onAdd}
                    >
                        <MaterialIcons name="add" size={22} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setOpen(!open)}>
                        <MaterialIcons
                            name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                            size={28}
                            color="#009FE3"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* List */}
            {open && (
                <>
                    {items.map((item, index) => (
                        <View key={index} style={styles.listRow}>
                            <Text style={styles.listItem}>• {item}</Text>

                            <TouchableOpacity onPress={() => onDelete(index)}>
                                <MaterialIcons name="delete" size={24} color="#d11a2a" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    section: {
        marginTop: 20,
        width: "80%",
        paddingBottom: 10,
        marginBottom: 10,
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
    actions: {
        flexDirection: "row",
        alignItems: "center",
    },
    smallButton: {
        backgroundColor: "#009FE3",
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    listRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 6,
    },
    listItem: {
        fontSize: 16,
    },
})