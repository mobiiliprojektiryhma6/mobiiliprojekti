import React from "react"
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native"
import { useTheme } from "../src/theme/ThemeContext"

type EditModalProps = {
    visible: boolean
    type: "personal" | "disease" | "allergy" | "medicine" | "dailyCarbTarget" | null
    title: string
    personalHeight: string
    personalWeight: string
    modalValue: string
    onChangeHeight: (value: string) => void
    onChangeWeight: (value: string) => void
    onChangeValue: (value: string) => void
    onSave: () => void
    onClose: () => void
}

export default function EditModal({
    visible,
    type,
    title,
    personalHeight,
    personalWeight,
    modalValue,
    onChangeHeight,
    onChangeWeight,
    onChangeValue,
    onSave,
    onClose,
}: EditModalProps) {

    const { theme, styles } = useTheme()

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>{title}</Text>

                    {type === "personal" ? (
                        <>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Height (cm)"
                                value={personalHeight}
                                onChangeText={onChangeHeight}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Weight (kg)"
                                value={personalWeight}
                                onChangeText={onChangeWeight}
                                keyboardType="numeric"
                            />
                        </>
                    ) : (
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Write here..."
                            value={modalValue}
                            onChangeText={onChangeValue}
                        />
                    )}

                    <View style={styles.modalButtons}>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.modalCancel}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onSave}>
                            <Text style={styles.modalSave}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}