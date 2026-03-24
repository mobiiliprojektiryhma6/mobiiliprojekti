import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, Linking, TouchableOpacity, TextInput, Image, Alert, Modal, ScrollView } from "react-native"
import { useCameraPermissions } from 'expo-camera'
import * as ImagePicker from "expo-image-picker"
import { useAuth } from "../src/hooks/useAuth"
import { db } from "../firebase/config"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function ProfileScreen() {

    const [height, setHeight] = useState<string | null>(null)
    const [weight, setWeight] = useState<string | null>(null)
    const [personalHeight, setPersonalHeight] = useState("")
    const [personalWeight, setPersonalWeight] = useState("")
    const [diseases, setDiseases] = useState<string[]>([])
    const [allergies, setAllergies] = useState<string[]>([])
    const [medicine, setMedicine] = useState<string[]>([])
    const [showDiseases, setShowDiseases] = useState(false);
    const [showMedicine, setShowMedicine] = useState(false);
    const [showAllergies, setShowAllergies] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null)
    const [permission, requestPermission] = useCameraPermissions()
    const [modalVisible, setModalVisible] = useState(false)
    const [modalTitle, setModalTitle] = useState("")
    const [modalValue, setModalValue] = useState("")
    const [modalType, setModalType] = useState<"personal" | "disease" | "allergy" | "medicine" | null>(null)

    const { user } = useAuth()

    const openLink = (url: string) => Linking.openURL(url)

    useEffect(() => { // Haetaan käyttäjään liittyvät tiedot Firestoresta, jos niitä on
        const loadData = async () => {
            if (!user) return

            const ref = doc(db, "users", user.uid)
            const snap = await getDoc(ref)

            if (snap.exists()) {
                const data = snap.data()
                setHeight(data.height || null)
                setWeight(data.weight || null)
                setDiseases(data.diseases || [])
                setAllergies(data.allergies || [])
                setMedicine(data.medicine || [])
                setProfileImage(data.profileImage || null)
            }
        }

        loadData()
    }, [user])

    const saveToFirestore = async (data: any) => {
        if (!user) return
        await setDoc(doc(db, "users", user.uid), data, { merge: true })
    }

    const pickFromLibrary = async () => { // Kuvan valinta gallerian kautta, tarkistetaan samalla kuvagallerian käyttöoikeudet
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!permission.granted) {
            alert("Please allow image access in settings.")
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        })

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri)
            saveToFirestore({ profileImage: result.assets[0].uri })
        }
    }

    const takePhoto = async () => { // Kuvan otto, tarkistetaan samalla kameran käyttöoikeudet
        const { status } = await requestPermission()

        if (status !== "granted") {
            alert("Please allow camera access in settings.")
            return
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        })

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri)
            saveToFirestore({ profileImage: result.assets[0].uri })
        }
    }

    const confirmPassword = (callback: () => void) => { // Varmistetaan käyttäjältä salasana ennen kuin hän saa muuttaa tietojaan
        Alert.prompt(
            "Confirm Password",
            "Please enter your password to continue",
            async (password) => {
                if (!password) {
                    Alert.alert("Error", "Password cannot be empty")
                    return
                }

                try {
                    const credential = EmailAuthProvider.credential(user!.email!, password)
                    await reauthenticateWithCredential(user!, credential)
                    callback()
                }

                catch (error) {
                    Alert.alert("Error", "Incorrect password. Please try again.")
                }
            },
            "secure-text"
        )
    }

    const removeDisease = async (index: number) => { // Poistetaan sairaus jos se on tarpeen
        confirmPassword(async () => {
            const updated = diseases.filter((_, i) => i !== index)
            setDiseases(updated)
            await saveToFirestore({ diseases: updated })
        })
    }

    const removeAllergy = async (index: number) => { // Poistetaan allergia jos se on tarpeen
        confirmPassword(async () => {
            const updated = allergies.filter((_, i) => i !== index)
            setAllergies(updated)
            await saveToFirestore({ allergies: updated })
        })
    }

    const removeMedicine = async (index: number) => { // Poistetaan lääkitys jos se on tarpeen
        confirmPassword(async () => {
            const updated = medicine.filter((_, i) => i !== index)
            setMedicine(updated)
            await saveToFirestore({ medicine: updated })
        })
    }

    const chooseImageOption = () => { // Annetaan Alerti joka antaa käyttäjälle vaihtoehdon kuvagalleria tai kamera
        Alert.alert(
            "Choose Image Option",
            "",
            [
                { text: "Take Photo", onPress: takePhoto },
                { text: "Choose from Library", onPress: pickFromLibrary },
                { text: "Cancel", style: "cancel" }
            ]
        )
    }

    const openModal = (type: "personal" | "disease" | "allergy" | "medicine", title: string) => { // Modalin avaaminen, asetetaan modalin mahdolliset tyypit ja otsikko sen mukaan
        setModalType(type)
        setModalTitle(title)

        if (type === "personal") {
            setPersonalHeight(height || "")
            setPersonalWeight(weight || "")
        } else {
            setModalValue("")
        }

        setModalVisible(true)
    }

    const saveModalValue = async () => { // tallenetaan modalissa annettu arvo, tarkistetaan että se ei ole tyhjä, ja päivitetään Firestoreen
        let update: any = {}

        if (modalType === "personal") {
            const newHeight = personalHeight.trim() || null
            const newWeight = personalWeight.trim() || null

            setHeight(newHeight)
            setWeight(newWeight)

            update.height = newHeight
            update.weight = newWeight
        }

        if (modalType === "disease") {
            if (!modalValue.trim()) {
                setModalVisible(false)
                return
            }
            const updated = [...diseases, modalValue.trim()]
            setDiseases(updated)
            update.diseases = updated
        }

        if (modalType === "allergy") {
            if (!modalValue.trim()) {
                setModalVisible(false)
                return
            }
            const updated = [...allergies, modalValue.trim()]
            setAllergies(updated)
            update.allergies = updated
        }

        if (modalType === "medicine") {
            if (!modalValue.trim()) {
                setModalVisible(false)
                return
            }
            const updated = [...medicine, modalValue.trim()]
            setMedicine(updated)
            update.medicine = updated
        }

        await saveToFirestore(update)
        setModalVisible(false)
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Modal // Modalin käyttö
                    visible={modalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalBox}>
                            <Text style={styles.modalTitle}>{modalTitle}</Text>

                            {modalType === "personal" ? (
                                <>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Height (cm)"
                                        value={personalHeight}
                                        onChangeText={setPersonalHeight}
                                        keyboardType="numeric"
                                    />
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Weight (kg)"
                                        value={personalWeight}
                                        onChangeText={setPersonalWeight}
                                        keyboardType="numeric"
                                    />
                                </>
                            ) : (
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Write here..."
                                    value={modalValue}
                                    onChangeText={setModalValue}
                                />
                            )}

                            <View style={styles.modalButtons}>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Text style={styles.modalCancel}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={saveModalValue}>
                                    <Text style={styles.modalSave}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <View style={styles.headerLeft}>
                    <Text style={styles.profileName}>{user?.displayName || "Profile"}</Text>
                    <Text style={styles.emailName}>{user?.email || "Email"}</Text>
                </View>
                {/*Profiilikuvan valinta ja vaihto*/}
                <TouchableOpacity style={styles.profileImage} onPress={chooseImageOption}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={{ width: "100%", height: "100%", borderRadius: 30 }} />
                    ) : (
                        <MaterialIcons name="add" size={40} color="#009FE3" />
                    )}
                </TouchableOpacity>


                {/* Personal Information */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <TouchableOpacity
                            style={styles.smallButton}
                            onPress={() => openModal("personal", "Edit Personal Information")}
                        >
                            <MaterialIcons name="edit" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.rowBetween}>
                        <View style={styles.column}>
                            <Text>Height (cm):</Text>
                            {height && (
                                <Text style={styles.listItem}>• {height} cm</Text>
                            )}
                        </View>

                        <View style={styles.column}>
                            <Text>Weight (kg):</Text>
                            {weight && (
                                <Text style={styles.listItem}>• {weight} kg</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Sairauksien lisäys ja poisto */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Diseases</Text>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TouchableOpacity
                            style={[styles.smallButton, , { marginRight: 35 }]}
                            onPress={() => openModal("disease", "Add Disease")}
                        >
                            <MaterialIcons name="add" size={22} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowDiseases(prev => !prev)}>
                            <MaterialIcons
                                name={showDiseases ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                                size={28}
                                color="#009FE3"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {showDiseases && (
                    <>
                        {diseases.map((item, index) => (
                            <View key={index} style={styles.listRow}>
                                <Text style={styles.listItem}>• {item}</Text>

                                <TouchableOpacity onPress={() => removeDisease(index)}>
                                    <MaterialIcons name="delete" size={24} color="#d11a2a" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </>
                )}


                {/* Lääkityksen lisäys ja poisto */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Medication</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TouchableOpacity
                            style={[styles.smallButton, , { marginRight: 35 }]}
                            onPress={() => openModal("medicine", "Add Medication")}
                        >
                            <MaterialIcons name="add" size={22} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowMedicine(prev => !prev)}>
                            <MaterialIcons
                                name={showMedicine ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                                size={28}
                                color="#009FE3"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                {showMedicine && (
                    <>
                        {medicine.map((item, index) => (
                            <View key={index} style={styles.listRow}>
                                <Text style={styles.listItem}>• {item}</Text>

                                <TouchableOpacity onPress={() => removeMedicine(index)}>
                                    <MaterialIcons name="delete" size={24} color="#d11a2a" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </>
                )}


                {/* Allergioiden lisäys ja poisto */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Allergies</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TouchableOpacity
                            style={[styles.smallButton, , { marginRight: 35 }]}
                            onPress={() => openModal("allergy", "Add Allergy")}
                        >
                            <MaterialIcons name="add" size={22} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowAllergies(prev => !prev)}>
                            <MaterialIcons
                                name={showAllergies ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                                size={28}
                                color="#009FE3"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                {showAllergies && (
                    <>
                        {allergies.map((item, index) => (
                            <View key={index} style={styles.listRow}>
                                <Text style={styles.listItem}>• {item}</Text>

                                <TouchableOpacity onPress={() => removeAllergy(index)}>
                                    <MaterialIcons name="delete" size={24} color="#d11a2a" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </>
                )}

            </ScrollView>
            {/* Linkit diabetesaiheisiin luotettaviin lähteisiin */}
            <View style={styles.bottomBar}>
                <TouchableOpacity onPress={() => openLink("https://www.diabetes.fi/")}>
                    <Text style={styles.linkButton}>Diabetesliitto</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => openLink("https://www.kanta.fi/omakanta")}>
                    <Text style={styles.linkButton}>omaKanta</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => openLink("https://www.terveyskyla.fi/diabetestalo")}>
                    <Text style={styles.linkButton}>Diabetes Talo</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E5F7FD",
    },

    headerLeft: {
        position: "absolute",
        top: 80,
        left: 60,
    },
    profileName: {
        fontSize: 24,
        fontWeight: "bold",
    },
    emailName: {
        fontSize: 16,
        color: "#555",
        marginTop: 4,
    },

    profileImage: {
        position: "absolute",
        top: 40,
        right: 20,
        width: 120,
        height: 120,
        borderRadius: 32,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#009FE3",
        justifyContent: "center",
        alignItems: "center",
    },

    section: {
        marginTop: 20,
        width: "80%",
        paddingBottom: 10,
        marginBottom: 20,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    column: {
        width: "48%",
    },

    smallButton: {
        backgroundColor: "#009FE3",
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 6,
    },
    listItem: {
        marginTop: 4,
        fontSize: 16,
    },
    bottomBar: {
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        backgroundColor: "#E5F7FD",
        paddingVertical: 12,
        flexDirection: "row",
        justifyContent: "center",
        borderTopWidth: 1,
        borderColor: "#ccc",
        borderRadius: 12,
        marginHorizontal: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    linkButton: {
        backgroundColor: "#009FE3",
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 6,
        color: "#FFFFFF",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        width: "80%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 12,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    modalCancel: {
        fontSize: 16,
        color: "#888",
    },
    modalSave: {
        fontSize: 16,
        color: "#009FE3",
        fontWeight: "bold",
    },
    listRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 4,
    },
    scrollContent: {
        paddingTop: 180,
        paddingBottom: 40,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
})