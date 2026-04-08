import React, { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { exp } from "firebase/firestore/pipelines"
import { globalStyles } from "../src/styles/globalStyles"

type HealthSectionProps = {
    title: string
    items: string[]
    onAdd: () => void
    onDelete: (index: number) => void
}

export default function HealthSection({ title, items, onAdd, onDelete }: HealthSectionProps) {
    const [open, setOpen] = useState(false)
    return (
        <View style={globalStyles.section}>
            <View style={globalStyles.sectionHeader}>
                <Text style={globalStyles.sectionTitle}>{title}</Text>

                <View style={globalStyles.actions}>
                    <TouchableOpacity
                        style={[globalStyles.smallButton, { marginRight: 12 }]}
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

            {open && items.map((item, index) => (
                <View key={index} style={globalStyles.listRow}>
                    <Text style={globalStyles.listItem}>• {item}</Text>
                    <TouchableOpacity onPress={() => onDelete(index)}>
                        <MaterialIcons name="delete" size={24} color="#d11a2a" />
                    </TouchableOpacity>
                </View>
            ))}
        </View>

    )
}