import React, { useState, useEffect, useMemo } from "react"
import { View, Text, TouchableOpacity, ScrollView, Linking, Alert } from "react-native"
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
import EditModal from "../components/EditModal"
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

    // Modal state
    const [modalVisible, setModalVisible] = useState(false)
    const [modalType, setModalType] = useState<"personal" | "disease" | "allergy" | "medicine" | "dailyCarbTarget" | null>(null)
    const [modalTitle, setModalTitle] = useState("")
    const [modalValue, setModalValue] = useState("")

    // Personal info temp values
    const [tempHeight, setTempHeight] = useState("")
    const [tempWeight, setTempWeight] = useState("")

    const [useManualCarbTarget, setUseManualCarbTarget] = useState(false)
    const [dailyCarbTarget, setDailyCarbTarget] = useState<string | null>(null)

    const theme = useTheme()
    const { user } = useAuth()

    const recommendedTarget = useMemo(
        () => calculateRecommendedCarbTarget(weight, height),
        [weight, height]
    )

    const openLink = (url: string) => Linking.openURL(url)

    // Load user data
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

    // Load medications
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

    // OPEN PERSONAL INFO MODAL
    const openPersonalInfoModal = () => {
        setModalType("personal")
        setModalTitle("Edit Personal Information")
        setTempHeight(height ?? "")
        setTempWeight(weight ?? "")
        setModalVisible(true)
    }

    // OPEN GENERIC MODAL
    const openGenericModal = (type: any, title: string) => {
        setModalType(type)
        setModalTitle(title)
        setModalValue("")
        setModalVisible(true)
    }

    // SAVE MODAL VALUE
    const saveModalValue = async () => {
        if (modalType === "personal") {
            const h = tempHeight.trim()
            const w = tempWeight.trim()

            setHeight(h)
            setWeight(w)

            await saveToFirestore({ height: h, weight: w })
            setModalVisible(false)
            return
        }

        if (!modalValue.trim()) return

        let update: any = {}

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
            await addMedicationFromProfile(modalValue)
            setModalVisible(false)
            return
        }

        await saveToFirestore(update)
        setModalVisible(false)
    }

    const addMedicationFromProfile = async (name: string) => {
        if (!user) return
        const ref = await addDoc(collection(db, "users", user.uid, "medications"), {
            name: name.trim(),
            dose: "",
            usage: "",
            notes: "",
            times: [],
        })
        setMedications((prev) => [...prev, { id: ref.id, name: name.trim() }])
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

    const removeMedication = async (id: string) => {
        if (!user) return
        await deleteDoc(doc(db, "users", user.uid, "medications", id))
        setMedications((prev) => prev.filter((m) => m.id !== id))
    }

    return (
        <View style={[globalStyles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={globalStyles.screenWithHeader}>

                {/*Username, Email, Profile Picture*/}
                <ProfileHeader
                    user={user}
                    profileImage={profileImage}
                    onChooseImage={chooseImageOption}
                />

                {/*Weight and Height*/}
                <PersonalInfoSection
                    height={height}
                    weight={weight}
                    onEdit={openPersonalInfoModal}
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
                            onPress={() => setUseManualCarbTarget(false)}
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
                            onPress={() => setUseManualCarbTarget(true)}
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
                            openGenericModal(
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

                {/*Health Info: Diseases, Medications and Allergies*/}
                <HealthSection
                    title="Diseases"
                    items={diseases}
                    onAdd={() => openGenericModal("disease", "Add disease")}
                    onDelete={removeDisease}
                />

                <HealthSection
                    title="Medication"
                    items={medications}
                    onAdd={() => openGenericModal("medicine", "Add medication")}
                    onDelete={(index) => removeMedication(medications[index].id)}
                />

                <HealthSection
                    title="Allergies"
                    items={allergies}
                    onAdd={() => openGenericModal("allergy", "Add allergy")}
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

            {/* Modal */}
            <EditModal
                visible={modalVisible}
                type={modalType}
                title={modalTitle}
                personalHeight={tempHeight}
                personalWeight={tempWeight}
                modalValue={modalValue}
                onChangeHeight={setTempHeight}
                onChangeWeight={setTempWeight}
                onChangeValue={setModalValue}
                onSave={saveModalValue}
                onClose={() => setModalVisible(false)}
            />
        </View>
    )
}