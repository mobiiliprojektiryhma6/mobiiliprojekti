import React, { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, Alert, TextInput, Modal } from "react-native"

import { globalStyles } from "../src/styles/globalStyles"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"

import {
  getAuth,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth"

import {
  getFirestore,
  doc,
  deleteDoc,
  getDoc,
  updateDoc
} from "firebase/firestore"

import { useTheme } from "../src/theme/ThemeContext"

export default function AccountSettingsScreen() {
  const auth = getAuth()
  const user = auth.currentUser
  const db = getFirestore()

  const { theme, setThemeMode } = useTheme()

  const [themeMode, setThemeModeLocal] = useState<"light" | "dark">("light")

  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState<"username" | "password" | "delete" | null>(null)

  const [newUsername, setNewUsername] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmUsername, setConfirmUsername] = useState("")
  const [deletePassword, setDeletePassword] = useState("")

  // Load theme from Firestore
  useEffect(() => {
    if (!user) return

    const loadTheme = async () => {
      const snap = await getDoc(doc(db, "users", user.uid))
      if (snap.exists() && snap.data().themeMode) {
        const savedMode = snap.data().themeMode as "light" | "dark"
        setThemeModeLocal(savedMode)
        setThemeMode(savedMode)
      }
    }

    loadTheme()
  }, [])

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

  // Toggle theme
  const handleToggleTheme = async () => {
    const newMode = themeMode === "light" ? "dark" : "light"

    try {
      await updateDoc(doc(db, "users", user!.uid), {
        themeMode: newMode,
      })

      setThemeModeLocal(newMode)
      setThemeMode(newMode)

      Alert.alert("Theme Updated", `Switched to ${newMode} mode`)
    } catch (err) {
      Alert.alert("Error", "Could not update theme")
    }
  }

  // Username change
  const handleChangeUsername = async () => {
    if (!newUsername.trim()) {
      Alert.alert("Error", "Username cannot be empty")
      return
    }

    try {
      await updateProfile(user!, { displayName: newUsername })
      Alert.alert("Success", "Username updated")
      closeModal()
    } catch {
      Alert.alert("Error", "Could not update username")
    }
  }

  // Password change
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
    } catch {
      Alert.alert("Error", "Incorrect password or update failed")
    }
  }

  // Delete account
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

      await deleteDoc(doc(db, "users", user!.uid))
      await user!.delete()

      Alert.alert("Account Deleted", "Your account and all data have been removed.")
    } catch {
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
          <MaterialIcons name="person" size={24} color={theme.colors.primary} />
          <Text style={[globalStyles.rowText, { color: theme.colors.text }]}>Change Username</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.row} onPress={() => openModal("password")}>
          <MaterialIcons name="lock" size={24} color={theme.colors.primary} />
          <Text style={[globalStyles.rowText, { color: theme.colors.text }]}>Change Password</Text>
        </TouchableOpacity>

        {/* THEME TOGGLE */}
        <TouchableOpacity style={globalStyles.row} onPress={handleToggleTheme}>
          <MaterialIcons
            name={themeMode === "light" ? "dark-mode" : "light-mode"}
            size={24}
            color={theme.colors.primary}
          />
          <Text style={[globalStyles.rowText, { color: theme.colors.text }]}>
            {themeMode === "light" ? "Enable Dark Mode" : "Enable Light Mode"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* DELETE ACCOUNT */}
      <View style={globalStyles.dangerSection}>
        <TouchableOpacity style={globalStyles.row} onPress={() => openModal("delete")}>
          <MaterialIcons name="delete" size={24} color={theme.colors.danger} />
          <Text style={[globalStyles.rowText, { color: theme.colors.danger }]}>
            Delete Account
          </Text>
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
                  Enter your new username.
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
                  Enter your current password.
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
                  style={[globalStyles.saveBtn, { backgroundColor: theme.colors.danger }]}
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