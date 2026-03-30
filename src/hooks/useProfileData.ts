import { useState, useEffect } from "react"
import { Alert } from "react-native"
import { db } from "../../firebase/config"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"
import * as ImagePicker from "expo-image-picker"
import { useCameraPermissions } from "expo-camera"
import { useAuth } from "./useAuth"

export function useProfileData() {
  const { user } = useAuth()

  // Personal info
  const [height, setHeight] = useState<string | null>(null)
  const [weight, setWeight] = useState<string | null>(null)
  const [personalHeight, setPersonalHeight] = useState("")
  const [personalWeight, setPersonalWeight] = useState("")

  // Health info
  const [diseases, setDiseases] = useState<string[]>([])
  const [allergies, setAllergies] = useState<string[]>([])
  const [medicine, setMedicine] = useState<string[]>([])

  // Profile image
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [, requestPermission] = useCameraPermissions()

  // Modal state
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const [modalValue, setModalValue] = useState("")
  const [modalType, setModalType] =
    useState<"personal" | "disease" | "allergy" | "medicine" | null>(null)

  // Load Firestore data
  useEffect(() => {
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

  // Save to Firestore
  const saveToFirestore = async (data: any) => {
    if (!user) return
    await setDoc(doc(db, "users", user.uid), data, { merge: true })
  }

  // Confirm password before deleting
  const confirmPassword = (callback: () => void) => {
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
        } catch {
          Alert.alert("Error", "Incorrect password. Please try again.")
        }
      },
      "secure-text"
    )
  }

  // Remove items
  const removeDisease = (index: number) =>
    confirmPassword(async () => {
      const updated = diseases.filter((_, i) => i !== index)
      setDiseases(updated)
      saveToFirestore({ diseases: updated })
    })

  const removeAllergy = (index: number) =>
    confirmPassword(async () => {
      const updated = allergies.filter((_, i) => i !== index)
      setAllergies(updated)
      saveToFirestore({ allergies: updated })
    })

  const removeMedicine = (index: number) =>
    confirmPassword(async () => {
      const updated = medicine.filter((_, i) => i !== index)
      setMedicine(updated)
      saveToFirestore({ medicine: updated })
    })

  // Image selection
  const pickFromLibrary = async () => {
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

  const takePhoto = async () => {
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

  const chooseImageOption = () => {
    Alert.alert("Choose Image Option", "", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickFromLibrary },
      { text: "Cancel", style: "cancel" },
    ])
  }

  // Modal handling
  const openModal = (
    type: "personal" | "disease" | "allergy" | "medicine",
    title: string
  ) => {
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

  const saveModalValue = async () => {
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
      if (!modalValue.trim()) return setModalVisible(false)
      const updated = [...diseases, modalValue.trim()]
      setDiseases(updated)
      update.diseases = updated
    }

    if (modalType === "allergy") {
      if (!modalValue.trim()) return setModalVisible(false)
      const updated = [...allergies, modalValue.trim()]
      setAllergies(updated)
      update.allergies = updated
    }

    if (modalType === "medicine") {
      if (!modalValue.trim()) return setModalVisible(false)
      const updated = [...medicine, modalValue.trim()]
      setMedicine(updated)
      update.medicine = updated
    }

    await saveToFirestore(update)
    setModalVisible(false)
  }

  return { user, height, weight, diseases, allergies, medicine, profileImage, personalHeight, personalWeight, modalValue, modalVisible, modalTitle, modalType,
    setPersonalHeight, setPersonalWeight, setModalValue, setModalVisible, openModal, saveModalValue, chooseImageOption, removeDisease, removeAllergy, removeMedicine,
  }
}