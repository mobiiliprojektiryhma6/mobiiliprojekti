import React, { useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
    Modal,
} from "react-native"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import {
    getAuth,
    updateProfile,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
} from "firebase/auth"
import { getFirestore, doc, deleteDoc } from "firebase/firestore"

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
        <View style={styles.container}>
            <Text style={styles.header}>Account Settings</Text>

            <View style={styles.section}>
                <TouchableOpacity style={styles.row} onPress={() => openModal("username")}>
                    <MaterialIcons name="person" size={24} color="#009FE3" />
                    <Text style={styles.rowText}>Change Username</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.row} onPress={() => openModal("password")}>
                    <MaterialIcons name="lock" size={24} color="#009FE3" />
                    <Text style={styles.rowText}>Change Password</Text>
                </TouchableOpacity>
            </View>

            {/* PUNAINEN DELETE ACCOUNT -BOKSI */}
            <View style={styles.dangerSection}>
                <TouchableOpacity style={styles.row} onPress={() => openModal("delete")}>
                    <MaterialIcons name="delete" size={24} color="#d9534f" />
                    <Text style={[styles.rowText, { color: "#d9534f" }]}>Delete Account</Text>
                </TouchableOpacity>
            </View>

            {/* MODAL */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>

                        {/* USERNAME MODAL */}
                        {modalType === "username" && (
                            <>
                                <Text style={styles.modalTitle}>Change Username</Text>
                                <Text style={styles.modalDescription}>
                                    Enter your new username. This name will appear on your profile.
                                </Text>

                                <TextInput
                                    placeholder="New username"
                                    style={styles.input}
                                    value={newUsername}
                                    onChangeText={setNewUsername}
                                />

                                <TouchableOpacity style={styles.saveBtn} onPress={handleChangeUsername}>
                                    <Text style={styles.saveText}>Save</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* PASSWORD MODAL */}
                        {modalType === "password" && (
                            <>
                                <Text style={styles.modalTitle}>Change Password</Text>
                                <Text style={styles.modalDescription}>
                                    Enter your current password to verify your identity.
                                </Text>
                                <Text style={styles.modalDescription}>
                                    Then choose a new password.
                                </Text>

                                <TextInput
                                    placeholder="Current password"
                                    secureTextEntry
                                    style={styles.input}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                />

                                <TextInput
                                    placeholder="New password"
                                    secureTextEntry
                                    style={styles.input}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />

                                <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword}>
                                    <Text style={styles.saveText}>Save</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* DELETE ACCOUNT MODAL */}
                        {modalType === "delete" && (
                            <>
                                <Text style={styles.modalTitle}>Delete Account</Text>
                                <Text style={styles.modalDescription}>
                                    To confirm deletion, type your username exactly as it appears.
                                </Text>
                                <Text style={styles.modalDescription}>
                                    You must also enter your password to verify your identity.
                                </Text>

                                <TextInput
                                    placeholder="Confirm username"
                                    style={styles.input}
                                    value={confirmUsername}
                                    onChangeText={setConfirmUsername}
                                />

                                <TextInput
                                    placeholder="Password"
                                    secureTextEntry
                                    style={styles.input}
                                    value={deletePassword}
                                    onChangeText={setDeletePassword}
                                />

                                <TouchableOpacity
                                    style={[styles.saveBtn, { backgroundColor: "#d9534f" }]}
                                    onPress={handleDeleteAccount}
                                >
                                    <Text style={styles.saveText}>Delete Account</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E5F7FD",
        padding: 20,
    },
    header: {
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 20,
    },
    section: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 10,
        marginBottom: 20,
        elevation: 2,
    },
    dangerSection: {
        borderWidth: 2,
        borderColor: "#d9534f",
        borderRadius: 12,
        paddingVertical: 10,
        marginBottom: 20,
        backgroundColor: "#fff5f5",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    rowText: {
        fontSize: 18,
        marginLeft: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        width: "85%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 12,
    },
    modalDescription: {
        fontSize: 14,
        color: "#555",
        marginBottom: 10,
    },
    input: {
        backgroundColor: "#f2f2f2",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    saveBtn: {
        backgroundColor: "#009FE3",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 4,
    },
    saveText: {
        color: "#fff",
        fontSize: 16,
    },
    cancelBtn: {
        marginTop: 10,
        alignItems: "center",
    },
    cancelText: {
        color: "#555",
        fontSize: 16,
    },
})
