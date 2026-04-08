import React, { useState, useEffect, useMemo } from "react"
import { View, Text, TouchableOpacity, TextInput, Alert, Modal, ScrollView, Linking } from "react-native"
import { useCameraPermissions } from "expo-camera"
import * as ImagePicker from "expo-image-picker"
import { useAuth } from "../src/hooks/useAuth"
import { db } from "../firebase/config"
import { doc, getDoc, setDoc, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { calculateRecommendedCarbTarget } from "../src/utils/carbTarget"
import HealthSection from "../components/HealthSection"
import ProfileHeader from "../components/ProfileHeader"
import PersonalInfoSection from "../components/PersonalInfoSection"
import { globalStyles } from "../src/styles/globalStyles"
import { useTheme } from "../src/theme/ThemeContext"

type MedicationEntry = { id: string; name: string }

export default function ProfileScreen() {
    const [height, setHeight] = useState<string | null>(null)
    const [weight, setWeight] = useState<string | null>(null)
    const [diseases, setDiseases] = useState<string[]>([])
    const [allergies, setAllergies] = useState<string[]>([])
    const [medications, setMedications] = useState<MedicationEntry[]>([])
    const [profileImage, setProfileImage] = useState<string | null>(null)

    const [, requestPermission] = useCameraPermissions()
    const [modalVisible, setModalVisible] = useState(false)
    const [modalTitle, setModalTitle] = useState("")
    const [modalValue, setModalValue] = useState("")
    const [modalType, setModalType] = useState<
        "height" | "weight" | "disease" | "allergy" | "medicine" | "dailyCarbTarget" | null
    >(null)

    const [useManualCarbTarget, setUseManualCarbTarget] = useState(false)
    const [dailyCarbTarget, setDailyCarbTarget] = useState<string | null>(null)

    const theme = useTheme()
    const { user } = useAuth()

    const recommendedTarget = useMemo(
        () => calculateRecommendedCarbTarget(weight, height),
        [weight, height]
    )

    const openLink = (url: string) => Linking.openURL(url)

    useEffect(() => {
        const loadData = async () => {
            if (!user) return
            const snap = await getDoc(doc(db, "users", user.uid))
            if (snap.exists()) {
                const data = snap.data()
                setHeight(data.height || null)
                setWeight(data.weight || null)
                setDiseases(data.diseases || [])
                setAllergies(data.allergies || [])
                setProfileImage(data.profileImage || null)
                setUseManualCarbTarget(data.useManualCarbTarget || false)
                setDailyCarbTarget(data.dailyCarbTarget ? String(data.dailyCarbTarget) : null)
            }
        }
        loadData()
    }, [user])

    useEffect(() => {
        const loadMedications = async () => {
            if (!user) return
            try {
                const snap = await getDocs(collection(db, "users", user.uid, "medications"))
                const items: MedicationEntry[] = snap.docs.map((d) => ({
                    id: d.id,
                    name: (d.data() as any).name || "Unnamed",
                }))
                setMedications(items)
            } catch (e) {
                console.error("Failed to load medications:", e)
            }
        }
        loadMedications()
    }, [user])

    const saveToFirestore = async (data: any) => {
        if (!user) return
        await setDoc(doc(db, "users", user.uid), data, { merge: true })
    }

    const pickFromLibrary = async () => { // Kuvan valinta gallerian kautta, tarkistetaan samalla kuvagallerian käyttöoikeudet
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!permission.granted) return alert("Salli kuvien käyttö asetuksista.")

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
        if (status !== "granted") return alert("Salli kameran käyttö asetuksista.")

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

    const chooseImageOption = () => {
        Alert.alert("Valitse vaihtoehto", "", [
            { text: "Ota kuva", onPress: takePhoto },
            { text: "Valitse kirjastosta", onPress: pickFromLibrary },
            { text: "Peruuta", style: "cancel" },
        ])
    }

    const removeDisease = async (index: number) => {
        const updated = diseases.filter((_, i) => i !== index)
        setDiseases(updated)
        saveToFirestore({ diseases: updated })
    }

    const removeAllergy = async (index: number) => {
        const updated = allergies.filter((_, i) => i !== index)
        setAllergies(updated)
        saveToFirestore({ allergies: updated })
    }

    const addMedicationFromProfile = async (name: string) => {
        if (!user) return
        try {
            const ref = await addDoc(collection(db, "users", user.uid, "medications"), {
                name: name.trim(),
                dose: "",
                usage: "",
                notes: "",
                times: [],
            })
            setMedications((prev) => [...prev, { id: ref.id, name: name.trim() }])
        } catch (e) {
            console.error("Failed to add medication:", e)
            Alert.alert("Error", "Could not add medication.")
        }
    }

    const removeMedication = async (id: string) => {
        if (!user) return
        await deleteDoc(doc(db, "users", user.uid, "medications", id))
        setMedications((prev) => prev.filter((m) => m.id !== id))
        try {
            await deleteDoc(doc(db, "users", user.uid, "medications", id))
            setMedications((prev) => prev.filter((m) => m.id !== id))
        } catch (e) {
            console.error("Failed to remove medication:", e)
            Alert.alert("Error", "Could not remove medication.")
        }
    }

    const openModal = (type: any, title: string) => {
        setModalType(type)
        setModalTitle(title)
        setModalValue("")
        setModalVisible(true)
    }

    const setCarbTargetMode = async (useManual: boolean) => {
        setUseManualCarbTarget(useManual)
        saveToFirestore({ useManualCarbTarget: useManual })
    }

    const saveModalValue = async () => {
        if (!modalValue.trim()) return

        let update: any = {}

        if (modalType === "height") update.height = modalValue
        if (modalType === "weight") update.weight = modalValue
        if (modalType === "disease") update.diseases = [...diseases, modalValue]
        if (modalType === "allergy") update.allergies = [...allergies, modalValue]

        if (modalType === "dailyCarbTarget") {
            const parsed = Number(modalValue.replace(",", "."))
            if (!Number.isFinite(parsed) || parsed <= 0)
                return alert("Daily carb target must be a positive number.")

            update.dailyCarbTarget = Math.round(parsed)
            setDailyCarbTarget(String(update.dailyCarbTarget))
        }

        if (modalType === "medicine") {
            // Kirjoitetaan subcollectioniin
            await addMedicationFromProfile(modalValue)
            return setModalVisible(false)
        }

        await saveToFirestore(update)
        setModalVisible(false)
    }

    return (
        <View style={[globalStyles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={globalStyles.screenWithHeader}>

                <ProfileHeader
                    user={user}
                    profileImage={profileImage}
                    onChooseImage={chooseImageOption}
                />

                <PersonalInfoSection
                    height={height}
                    weight={weight}
                    onEdit={() => openModal("height", "Edit height")}
                />

                {/* DAILY CARB TARGET */}
                <View style={globalStyles.section}>
                    <Text style={globalStyles.sectionTitle}>Daily Carb Target:</Text>

                    <View style={globalStyles.targetModeRow}>
                        <TouchableOpacity
                            style={[
                                globalStyles.modeButton,
                                !useManualCarbTarget && globalStyles.modeButtonActive,
                            ]}
                            onPress={() => setCarbTargetMode(false)}
                        >
                            <Text
                                style={[
                                    globalStyles.modeButtonText,
                                    !useManualCarbTarget && globalStyles.modeButtonTextActive,
                                ]}
                            >
                                Recommended
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                globalStyles.modeButton,
                                useManualCarbTarget && globalStyles.modeButtonActive,
                            ]}
                            onPress={() => setCarbTargetMode(true)}
                        >
                            <Text
                                style={[
                                    globalStyles.modeButtonText,
                                    useManualCarbTarget && globalStyles.modeButtonTextActive,
                                ]}
                            >
                                Custom
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {!useManualCarbTarget && recommendedTarget.target !== null && (
                        <Text style={globalStyles.listItem}>
                            • Recommended: {recommendedTarget.target} g/day
                        </Text>
                    )}

                    {!useManualCarbTarget && recommendedTarget.target === null && (
                        <Text style={globalStyles.warningText}>{recommendedTarget.reason}</Text>
                    )}

                    {useManualCarbTarget && dailyCarbTarget && (
                        <Text style={globalStyles.listItem}>
                            • Custom target: {dailyCarbTarget} g/day
                        </Text>
                    )}

                    {useManualCarbTarget && !dailyCarbTarget && (
                        <Text style={globalStyles.warningText}>
                            Add your custom carb target to use manual mode.
                        </Text>
                    )}

                    <TouchableOpacity
                        style={globalStyles.smallButton}
                        onPress={() =>
                            openModal(
                                "dailyCarbTarget",
                                dailyCarbTarget ? "Edit daily carb target" : "Add daily carb target"
                            )
                        }
                    >
                        <MaterialIcons
                            name={dailyCarbTarget ? "edit" : "add"}
                            size={dailyCarbTarget ? 22 : 28}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>

                <HealthSection
                    title="Diseases"
                    items={diseases}
                    onAdd={() => openModal("disease", "Add disease")}
                    onDelete={removeDisease}
                />

                <HealthSection
                    title="Medication"
                    items={medications.map((m) => m.name)}
                    onAdd={() => openModal("medicine", "Add medication")}
                    onDelete={(index) => removeMedication(medications[index].id)}
                />

                <HealthSection
                    title="Allergies"
                    items={allergies}
                    onAdd={() => openModal("allergy", "Add allergy")}
                    onDelete={removeAllergy}
                />

                <Text style={globalStyles.sectionTitle}>Links:</Text>
                <View style={globalStyles.rowCenter}>
                    <TouchableOpacity onPress={() => openLink("https://www.diabetes.fi/")}>
                        <Text style={globalStyles.linkButton}>Diabetesliitto</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => openLink("https://www.kanta.fi/omakanta")}>
                        <Text style={globalStyles.linkButton}>omaKanta</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => openLink("https://www.terveyskyla.fi/diabetestalo")}>
                        <Text style={globalStyles.linkButton}>Diabetes Talo</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={globalStyles.modalOverlay}>
                    <View style={globalStyles.modalBox}>
                        <Text style={globalStyles.modalTitle}>{modalTitle}</Text>

                        <TextInput
                            style={globalStyles.modalInput}
                            placeholder="Write here..."
                            value={modalValue}
                            onChangeText={setModalValue}
                            autoFocus
                        />

                        <View style={globalStyles.modalButtons}>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={globalStyles.modalCancel}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={saveModalValue}>
                                <Text style={globalStyles.modalSave}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}