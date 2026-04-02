import React, { useState, useEffect, useMemo } from "react"
import { View, Text, StyleSheet, Linking, TouchableOpacity, TextInput, Image, Alert, Modal, ScrollView } from "react-native"
import { useCameraPermissions } from 'expo-camera'
import * as ImagePicker from "expo-image-picker"
import { useAuth } from "../src/hooks/useAuth"
import { db } from "../firebase/config"
import { doc, getDoc, setDoc } from "firebase/firestore"
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { calculateRecommendedCarbTarget } from "../src/utils/carbTarget"

export default function ProfileScreen() {

    const [height, setHeight] = useState<string | null>(null)
    const [weight, setWeight] = useState<string | null>(null)
    const [diseases, setDiseases] = useState<string[]>([])
    const [allergies, setAllergies] = useState<string[]>([])
    const [medicine, setMedicine] = useState<string[]>([])
    const [profileImage, setProfileImage] = useState<string | null>(null)
    const [, requestPermission] = useCameraPermissions()
    const [modalVisible, setModalVisible] = useState(false)
    const [modalTitle, setModalTitle] = useState("")
    const [modalValue, setModalValue] = useState("")
    const [modalType, setModalType] = useState<"height" | "weight" | "disease" | "allergy" | "medicine" | "dailyCarbTarget" | null>(null)
    const [useManualCarbTarget, setUseManualCarbTarget] = useState(false)
    const [dailyCarbTarget, setDailyCarbTarget] = useState<string | null>(null)

    const { user } = useAuth()

    const recommendedTarget = useMemo(() => {
        const result = calculateRecommendedCarbTarget(weight, height)
        return result
    }, [weight, height])

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
                setUseManualCarbTarget(data.useManualCarbTarget || false)
                setDailyCarbTarget(data.dailyCarbTarget ? String(data.dailyCarbTarget) : null)
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
            alert("Salli kuvien käyttö asetuksista.")
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
import React from "react"
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Linking } from "react-native"

import ProfileHeader from "../components/ProfileHeader"
import PersonalInfoSection from "../components/PersonalInfoSection"
import HealthSection from "../components/HealthSection"
import EditModal from "../components/EditModal"

import { useProfileData } from "../src/hooks/useProfileData"


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

    const removeDisease = async (index: number) => { // Poistetaan sairaus jos se on tarpeen
        const updated = diseases.filter((_, i) => i !== index)
        setDiseases(updated)
        await saveToFirestore({ diseases: updated })
    }

    const removeAllergy = async (index: number) => { // Poistetaan allergia jos se on tarpeen
        const updated = allergies.filter((_, i) => i !== index)
        setAllergies(updated)
        await saveToFirestore({ allergies: updated })
    }

    const removeMedicine = async (index: number) => { // Poistetaan lääkitys jos se on tarpeen
        const updated = medicine.filter((_, i) => i !== index)
        setMedicine(updated)
        await saveToFirestore({ medicine: updated })
    }

    const chooseImageOption = () => { // Annetaan Alerti joka antaa käyttäjälle vaihtoehdon kuvagalleria tai kamera
        Alert.alert(
            "Valitse vaihtoehto",
            "",
            [
                { text: "Ota kuva", onPress: takePhoto },
                { text: "Valitse kirjastosta", onPress: pickFromLibrary },
                { text: "Peruuta", style: "cancel" }
            ]
        )
    }

    const openModal = (type: "height" | "weight" | "disease" | "allergy" | "medicine" | "dailyCarbTarget", title: string) => { // Modalin avaaminen, asetetaan modalin mahdolliset tyypit ja otsikko sen mukaan
        setModalType(type)
        setModalTitle(title)
        setModalValue("")
        setModalVisible(true)
    }

    const setCarbTargetMode = async (useManual: boolean) => {
        setUseManualCarbTarget(useManual)
        await saveToFirestore({ useManualCarbTarget: useManual })
    }

    const saveModalValue = async () => { // tallenetaan modalissa annettu arvo, tarkistetaan että se ei ole tyhjä, ja päivitetään Firestoreen
        if (!modalValue.trim()) return

        let update: any = {}

        if (modalType === "height") {
            setHeight(modalValue)
            update.height = modalValue
        }
        if (modalType === "weight") {
            setWeight(modalValue)
            update.weight = modalValue
        }
        if (modalType === "dailyCarbTarget") {
            const parsedTarget = Number(modalValue.replace(",", "."))

            if (!Number.isFinite(parsedTarget) || parsedTarget <= 0) {
                alert("Daily carb target must be a positive number.")
                return
            }

            const rounded = Math.round(parsedTarget)
            setDailyCarbTarget(String(rounded))
            update.dailyCarbTarget = rounded
        }
        if (modalType === "disease") {
            const updated = [...diseases, modalValue]
            setDiseases(updated)
            update.diseases = updated
        }
        if (modalType === "allergy") {
            const updated = [...allergies, modalValue]
            setAllergies(updated)
            update.allergies = updated
        }
        if (modalType === "medicine") {
            const updated = [...medicine, modalValue]
            setMedicine(updated)
            update.medicine = updated
        }
export default function ProfileScreen() {

    const {
        user,
        height,
        weight,
        diseases,
        allergies,
        medicine,
        profileImage,

        personalHeight,
        personalWeight,
        modalValue,

        modalVisible,
        modalTitle,
        modalType,

        setPersonalHeight,
        setPersonalWeight,
        setModalValue,
        setModalVisible,

        openModal,
        saveModalValue,
        chooseImageOption,

        removeDisease,
        removeAllergy,
        removeMedicine,
    } = useProfileData()

    const openLink = (url: string) => Linking.openURL(url)

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Edit Modal for Personal Information, Diseases, Allergies and Medication */}
                <EditModal
                    visible={modalVisible}
                    type={modalType}
                    title={modalTitle}
                    personalHeight={personalHeight}
                    personalWeight={personalWeight}
                    modalValue={modalValue}
                    onChangeHeight={setPersonalHeight}
                    onChangeWeight={setPersonalWeight}
                    onChangeValue={setModalValue}
                    onSave={saveModalValue}
                    onClose={() => setModalVisible(false)}
                />
                <ProfileHeader
                    user={user}
                    profileImage={profileImage}
                    onChooseImage={chooseImageOption}
                />

                <PersonalInfoSection
                    height={height}
                    weight={weight}
                    onEdit={() => openModal("personal", "Edit Personal Information")}
                />

                {/* Health Sections for Diseases, Medication and Allergies */}
                <HealthSection
                    title="Diseases"
                    items={diseases}
                    onAdd={() => openModal("disease", "Add Disease")}
                    onDelete={removeDisease}
                />

                <HealthSection
                    title="Medication"
                    items={medicine}
                    onAdd={() => openModal("medicine", "Add Medication")}
                    onDelete={removeMedicine}
                />

                <HealthSection
                    title="Allergies"
                    items={allergies}
                    onAdd={() => openModal("allergy", "Add Allergy")}
                    onDelete={removeAllergy}
                />


                            <View style={styles.modalButtons}>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Text style={styles.modalCancel}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={saveModalValue}>
                                    <Text style={styles.modalSave}>Add</Text>
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

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information:</Text>

                    <View style={styles.rowBetween}>

                        {/* Pituuden lisäys ja muokkaus */}
                        <View style={styles.column}>
                            <Text>Height (cm):</Text>
                            {height ? (
                                <>
                                    <Text style={styles.listItem}>• {height} cm</Text>
                                    <TouchableOpacity
                                        style={styles.smallButton}
                                        onPress={() => openModal("height", "Muokkaa pituutta")}
                                    >
                                        <MaterialIcons name="edit" size={22} color="#fff" />
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <TouchableOpacity
                                    style={styles.smallButton}
                                    onPress={() => openModal("height", "Lisää pituus")}
                                >
                                    <MaterialIcons name="add" size={28} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Painon lisäys ja muokkaus */}
                        <View style={styles.column}>
                            <Text>Weight (kg):</Text>
                            {weight ? (
                                <>
                                    <Text style={styles.listItem}>• {weight} kg</Text>
                                    <TouchableOpacity
                                        style={styles.smallButton}
                                        onPress={() => openModal("weight", "Muokkaa painoa")}
                                    >
                                        <MaterialIcons name="edit" size={22} color="#fff" />
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <TouchableOpacity
                                    style={styles.smallButton}
                                    onPress={() => openModal("weight", "Lisää paino")}
                                >
                                    <MaterialIcons name="add" size={28} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>

                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Daily Carb Target:</Text>

                    <View style={styles.targetModeRow}>
                        <TouchableOpacity
                            style={[styles.modeButton, !useManualCarbTarget && styles.modeButtonActive]}
                            onPress={() => setCarbTargetMode(false)}
                        >
                            <Text style={[styles.modeButtonText, !useManualCarbTarget && styles.modeButtonTextActive]}>
                                Recommended
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modeButton, useManualCarbTarget && styles.modeButtonActive]}
                            onPress={() => setCarbTargetMode(true)}
                        >
                            <Text style={[styles.modeButtonText, useManualCarbTarget && styles.modeButtonTextActive]}>
                                Custom
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {!useManualCarbTarget && recommendedTarget.target !== null && (
                        <Text style={styles.listItem}>• Recommended: {recommendedTarget.target} g/day</Text>
                    )}

                    {!useManualCarbTarget && recommendedTarget.target === null && (
                        <Text style={styles.warningText}>{recommendedTarget.reason}</Text>
                    )}

                    {useManualCarbTarget && dailyCarbTarget && (
                        <Text style={styles.listItem}>• Custom target: {dailyCarbTarget} g/day</Text>
                    )}

                    {useManualCarbTarget && !dailyCarbTarget && (
                        <Text style={styles.warningText}>Add your custom carb target to use manual mode.</Text>
                    )}

                    <TouchableOpacity
                        style={styles.smallButton}
                        onPress={() => openModal("dailyCarbTarget", dailyCarbTarget ? "Edit daily carb target" : "Add daily carb target")}
                    >
                        <MaterialIcons name={dailyCarbTarget ? "edit" : "add"} size={dailyCarbTarget ? 22 : 28} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Sairauksien lisäys ja poisto */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Diseases:</Text>

                    <TouchableOpacity
                        style={styles.smallButton}
                        onPress={() => openModal("disease", "Lisää sairaus")}
                    >
                        <MaterialIcons name="add" size={28} color="#fff" />
                    </TouchableOpacity>

                    {diseases.map((item, index) => (
                        <View key={index} style={styles.listRow}>
                            <Text style={styles.listItem}>• {item}</Text>

                            <TouchableOpacity onPress={() => removeDisease(index)}>
                                <MaterialIcons name="delete" size={24} color="#d11a2a" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Lääkityksen lisäys ja poisto */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Medication:</Text>

                    <TouchableOpacity
                        style={styles.smallButton}
                        onPress={() => openModal("medicine", "Lisää lääkitys")}
                    >
                        <MaterialIcons name="add" size={28} color="#fff" />
                    </TouchableOpacity>

                    {medicine.map((item, index) => (
                        <View key={index} style={styles.listRow}>
                            <Text style={styles.listItem}>• {item}</Text>

                            <TouchableOpacity onPress={() => removeMedicine(index)}>
                                <MaterialIcons name="delete" size={24} color="#d11a2a" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Allergioiden lisäys ja poisto */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Allergies:</Text>

                    <TouchableOpacity
                        style={styles.smallButton}
                        onPress={() => openModal("allergy", "Lisää allergia")}
                    >
                        <MaterialIcons name="add" size={28} color="#fff" />
                    </TouchableOpacity>

                    {allergies.map((item, index) => (
                        <View key={index} style={styles.listRow}>
                            <Text style={styles.listItem}>• {item}</Text>

                            <TouchableOpacity onPress={() => removeAllergy(index)}>
                                <MaterialIcons name="delete" size={24} color="#d11a2a" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Linkit diabetesaiheisiin luotettaviin lähteisiin */}
                <Text style={styles.linksTitle}>Links:</Text>

                <View style={styles.rowCenterAbsolute}>
                    <TouchableOpacity onPress={() => openLink("https://www.diabetes.fi/")}>
                        <Text style={styles.linkButton}>Diabetesliitto</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => openLink("https://www.kanta.fi/omakanta")}>
                        <Text style={styles.linkButton}>omaKanta</Text>
                    </TouchableOpacity>
            </ScrollView>
            {/* Links to Diabetes Resources */}
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

    scrollContent: {
        paddingTop: 180,
        paddingBottom: 40,
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
    targetModeRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 8,
        marginBottom: 8,
    },
    modeButton: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#009FE3",
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
    },
    modeButtonActive: {
        backgroundColor: "#009FE3",
    },
    modeButtonText: {
        color: "#009FE3",
        fontWeight: "700",
    },
    modeButtonTextActive: {
        color: "#FFFFFF",
    },
    warningText: {
        marginTop: 4,
        fontSize: 14,
        color: "#B00020",
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
    }
})
})
