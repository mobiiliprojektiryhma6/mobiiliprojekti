import React from "react"
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native"

type EditModalProps = {
    visible: boolean
    type: "personal" | "disease" | "allergy" | "medicine" | null
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

export default function EditModal({ visible, type, title, personalHeight, personalWeight, modalValue, onChangeHeight, onChangeWeight, onChangeValue, onSave, onClose, }: EditModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.box}>
                    <Text style={styles.title}>{title}</Text>

                    {type === "personal" ? (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="Height (cm)"
                                value={personalHeight}
                                onChangeText={onChangeHeight}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Weight (kg)"
                                value={personalWeight}
                                onChangeText={onChangeWeight}
                                keyboardType="numeric"
                            />
                        </>
                    ) : (
                        <TextInput
                            style={styles.input}
                            placeholder="Write here..."
                            value={modalValue}
                            onChangeText={onChangeValue}
                        />
                    )}

                    <View style={styles.buttons}>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.cancel}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onSave}>
                            <Text style={styles.save}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    box: {
        width: "80%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cancel: {
        fontSize: 16,
        color: "#888",
    },
    save: {
        fontSize: 16,
        color: "#009FE3",
        fontWeight: "bold",
    },
})
