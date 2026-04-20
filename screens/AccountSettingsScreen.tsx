import React, { useState } from "react"
import { View, Text, TouchableOpacity, Alert, TextInput, Modal, } from "react-native"

import { globalStyles } from "../src/styles/globalStyles"

import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { getAuth, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential, } from "firebase/auth"
import { getFirestore, doc, deleteDoc } from "firebase/firestore"
import { useTheme } from "../src/theme/ThemeContext"

export default function AccountSettingsScreen() {
    const auth = getAuth()
    const user = auth.currentUser
    const db = getFirestore()

    const [modalVisible, setModalVisible] = useState(false)
    const [modalType, setModalType] = useState<"username" | "password" | "delete" | null>(null)

    const [newUsername, setNewUsername] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")

    const [confirmUsername, setConfirmUsername] = useState("")
    const [deletePassword, setDeletePassword] = useState("")

    const openModal = (type: "username" | "password" | "delete") => {
        setModalType(type)
        setModalVisible(true)
    }

    const closeModal = () => {
        setModalVisible(false)
        setNewUsername("")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmUsername("")
        setDeletePassword("")
    }

    const theme = useTheme()

    // Vaihda käyttäjänimi
    const handleChangeUsername = async () => {
        if (!newUsername.trim()) {
            Alert.alert("Error", "Username cannot be empty")
            return
        }

        try {
            await updateProfile(user!, { displayName: newUsername })
            Alert.alert("Success", "Username updated")
            closeModal()
        } catch (err) {
            Alert.alert("Error", "Could not update username")
        }
    }

    // Vaihda salasana
    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            Alert.alert("Error", "Please fill all fields")
            return
        }

        try {
            const credential = EmailAuthProvider.credential(user!.email!, currentPassword)
            await reauthenticateWithCredential(user!, credential)

            await updatePassword(user!, newPassword)

            Alert.alert("Success", "Password updated")
            closeModal()
        } catch (err) {
            Alert.alert("Error", "Incorrect password or update failed")
        }
    }

    // Tilin poistaminen + Firestore-datan poisto
    const handleDeleteAccount = async () => {
        if (!confirmUsername.trim() || !deletePassword.trim()) {
            Alert.alert("Error", "Please fill all fields")
            return
        }

        if (confirmUsername !== user?.displayName) {
            Alert.alert("Error", "Username does not match your account")
            return
        }

        try {
            const credential = EmailAuthProvider.credential(user!.email!, deletePassword)
            await reauthenticateWithCredential(user!, credential)

            // Poista Firestore-data
            await deleteDoc(doc(db, "users", user!.uid))

            // Poista Firebase Auth -tili
            await user!.delete()

            Alert.alert("Account Deleted", "Your account and all data have been removed.")
        } catch (err) {
            Alert.alert("Error", "Incorrect password or deletion failed")
        }
    }

    return (
        <View style={[globalStyles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={[globalStyles.header, { color: theme.colors.text }]}>
                Account Settings
            </Text>

            <View style={globalStyles.section}>
                <TouchableOpacity style={globalStyles.row} onPress={() => openModal("username")}>
                    <MaterialIcons name="person" size={24} color="#009FE3" />
                    <Text style={globalStyles.rowText}>Change Username</Text>
                </TouchableOpacity>

                <TouchableOpacity style={globalStyles.row} onPress={() => openModal("password")}>
                    <MaterialIcons name="lock" size={24} color="#009FE3" />
                    <Text style={globalStyles.rowText}>Change Password</Text>
                </TouchableOpacity>
            </View>

            {/* PUNAINEN DELETE ACCOUNT -BOKSI */}
            <View style={globalStyles.dangerSection}>
                <TouchableOpacity style={globalStyles.row} onPress={() => openModal("delete")}>
                    <MaterialIcons name="delete" size={24} color="#d9534f" />
                    <Text style={[globalStyles.rowText, { color: "#d9534f" }]}>Delete Account</Text>
                </TouchableOpacity>
            </View>

            {/* MODAL */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={globalStyles.modalOverlay}>
                    <View style={globalStyles.modalBox}>

                        {/* USERNAME MODAL */}
                        {modalType === "username" && (
                            <>
                                <Text style={globalStyles.modalTitle}>Change Username</Text>
                                <Text style={globalStyles.modalDescription}>
                                    Enter your new username. This name will appear on your profile.
                                </Text>

                                <TextInput
                                    placeholder="New username"
                                    style={globalStyles.input}
                                    value={newUsername}
                                    onChangeText={setNewUsername}
                                />

                                <TouchableOpacity style={globalStyles.saveBtn} onPress={handleChangeUsername}>
                                    <Text style={globalStyles.saveText}>Save</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* PASSWORD MODAL */}
                        {modalType === "password" && (
                            <>
                                <Text style={globalStyles.modalTitle}>Change Password</Text>
                                <Text style={globalStyles.modalDescription}>
                                    Enter your current password to verify your identity.
                                </Text>
                                <Text style={globalStyles.modalDescription}>
                                    Then choose a new password.
                                </Text>

                                <TextInput
                                    placeholder="Current password"
                                    secureTextEntry
                                    style={globalStyles.input}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                />

                                <TextInput
                                    placeholder="New password"
                                    secureTextEntry
                                    style={globalStyles.input}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />

                                <TouchableOpacity style={globalStyles.saveBtn} onPress={handleChangePassword}>
                                    <Text style={globalStyles.saveText}>Save</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* DELETE ACCOUNT MODAL */}
                        {modalType === "delete" && (
                            <>
                                <Text style={globalStyles.modalTitle}>Delete Account</Text>
                                <Text style={globalStyles.modalDescription}>
                                    To confirm deletion, type your username exactly as it appears.
                                </Text>
                                <Text style={globalStyles.modalDescription}>
                                    You must also enter your password to verify your identity.
                                </Text>

                                <TextInput
                                    placeholder="Confirm username"
                                    style={globalStyles.input}
                                    value={confirmUsername}
                                    onChangeText={setConfirmUsername}
                                />

                                <TextInput
                                    placeholder="Password"
                                    secureTextEntry
                                    style={globalStyles.input}
                                    value={deletePassword}
                                    onChangeText={setDeletePassword}
                                />

                                <TouchableOpacity
                                    style={[globalStyles.saveBtn, { backgroundColor: "#d9534f" }]}
                                    onPress={handleDeleteAccount}
                                >
                                    <Text style={globalStyles.saveText}>Delete Account</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        <TouchableOpacity style={globalStyles.cancelBtn} onPress={closeModal}>
                            <Text style={globalStyles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>

        </View>
    )
}