import React, { useState } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { useTheme } from "../src/theme/ThemeContext" 

type HealthSectionProps = {
    title: string
    items: any[]
    onAdd: () => void
    onDelete: (index: number) => void
}

export default function HealthSection({ title, items, onAdd, onDelete }: HealthSectionProps) {
    const [open, setOpen] = useState(false)
    const { theme, styles } = useTheme()

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.smallButton, { marginRight: 12 }]}
                        onPress={onAdd}
                    >
                        <MaterialIcons name="add" size={22} color={theme.colors.white} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setOpen(!open)}>
                        <MaterialIcons
                            name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                            size={28}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {open && items.map((item, index) => (
                <View key={item.id ?? index} style={styles.listRow}>
                    <Text style={styles.listItem}>
                        • {item.name ?? item}
                    </Text>

                    <TouchableOpacity onPress={() => onDelete(index)}>
                        <MaterialIcons name="delete" size={24} color={theme.colors.danger} />
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    )
}