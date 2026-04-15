import React from "react"
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native"
import { globalStyles } from "../src/styles/globalStyles"

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
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={globalStyles.modalOverlay}>
                <View style={globalStyles.modalBox}>
                    <Text style={globalStyles.modalTitle}>{title}</Text>

                    {type === "personal" ? (
                        <>
                            <TextInput
                                style={globalStyles.modalInput}
                                placeholder="Height (cm)"
                                value={personalHeight}
                                onChangeText={onChangeHeight}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={globalStyles.modalInput}
                                placeholder="Weight (kg)"
                                value={personalWeight}
                                onChangeText={onChangeWeight}
                                keyboardType="numeric"
                            />
                        </>
                    ) : (
                        <TextInput
                            style={globalStyles.modalInput}
                            placeholder="Write here..."
                            value={modalValue}
                            onChangeText={onChangeValue}
                        />
                    )}

                    <View style={globalStyles.modalButtons}>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={globalStyles.modalCancel}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onSave}>
                            <Text style={globalStyles.modalSave}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}
