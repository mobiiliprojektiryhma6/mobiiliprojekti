import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, Linking, TouchableOpacity, TextInput, Keyboard, Image, Alert, Modal } from "react-native"
import { useCameraPermissions } from 'expo-camera'
import * as ImagePicker from "expo-image-picker"
import { useAuth } from "../src/hooks/useAuth"

export default function ProfileScreen() {

    const [weights, setWeights] = useState<string[]>([])
    const [heights, setHeights] = useState<string[]>([])
    const [diseases, setDiseases] = useState<string[]>([])
    const [allergies, setAllergies] = useState<string[]>([])
    const [profileImage, setProfileImage] = useState<string | null>(null)
    const [permission, requestPermission] = useCameraPermissions()
    const [modalVisible, setModalVisible] = useState(false)
    const [modalTitle, setModalTitle] = useState("")
    const [modalValue, setModalValue] = useState("")
    const [modalType, setModalType] = useState<"height" | "weight" | "disease" | "allergy" | null>(null)

    const { user } = useAuth()

    const openLink = (url: string) => Linking.openURL(url)

    useEffect(() => {
        if (!permission) requestPermission()
    }, [permission])

    if (!permission) return <Text>Requesting camera permission...</Text>
    if (!permission.granted) return <Text>No access to camera</Text>

    const pickFromLibrary = async () => {
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

        if (!result.canceled) setProfileImage(result.assets[0].uri)
    }

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync()
        if (!permission.granted) {
            alert("Salli kameran käyttö asetuksista.")
            return
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        })

        if (!result.canceled) setProfileImage(result.assets[0].uri)
    }

    const chooseImageOption = () => {
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

    const openModal = (type: "height" | "weight" | "disease" | "allergy", title: string) => {
        setModalType(type)
        setModalTitle(title)
        setModalValue("")
        setModalVisible(true)
    }

    const saveModalValue = () => {
        if (!modalValue.trim()) return

        if (modalType === "height") setHeights([...heights, modalValue])
        if (modalType === "weight") setWeights([...weights, modalValue])
        if (modalType === "disease") setDiseases([...diseases, modalValue])
        if (modalType === "allergy") setAllergies([...allergies, modalValue])

        setModalVisible(false)
    }

    return (
        <View style={styles.container}>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>{modalTitle}</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Kirjoita tieto"
                            value={modalValue}
                            onChangeText={setModalValue}
                            autoFocus
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalCancel}>Peruuta</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={saveModalValue}>
                                <Text style={styles.modalSave}>Lisää</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={styles.headerLeft}>
                <Text style={styles.profileName}>{user?.displayName || "Profile"}</Text>
                <Text style={styles.emailName}>{user?.email || "Email"}</Text>
            </View>

            <TouchableOpacity style={styles.profileImage} onPress={chooseImageOption}>
                {profileImage ? (
                    <Image source={{ uri: profileImage }} style={{ width: "100%", height: "100%", borderRadius: 30 }} />
                ) : (
                    <Text style={{ color: "#009FE3", fontSize: 32 }}>+</Text>
                )}
            </TouchableOpacity>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Perustiedot:</Text>

                <View style={styles.rowBetween}>

                    <View style={styles.column}>
                        <Text>Pituus (cm):</Text>
                        <View style={styles.rowCenter}>
                            <TouchableOpacity
                                style={styles.smallButton}
                                onPress={() => openModal("height", "Lisää pituus")}
                            >
                                <Text style={styles.smallButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        {heights.map((item, index) => (
                            <Text key={index} style={styles.listItem}>• {item} cm</Text>
                        ))}
                    </View>

                    <View style={styles.column}>
                        <Text>Paino (kg):</Text>
                        <View style={styles.rowCenter}>
                            <TouchableOpacity
                                style={styles.smallButton}
                                onPress={() => openModal("weight", "Lisää paino")}
                            >
                                <Text style={styles.smallButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        {weights.map((item, index) => (
                            <Text key={index} style={styles.listItem}>• {item} kg</Text>
                        ))}
                    </View>

                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sairaudet:</Text>

                <View style={styles.rowCenter}>
                    <TouchableOpacity
                        style={styles.smallButton}
                        onPress={() => openModal("disease", "Lisää sairaus")}
                    >
                        <Text style={styles.smallButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                {diseases.map((item, index) => (
                    <Text key={index} style={styles.listItem}>• {item}</Text>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Allergiat:</Text>

                <View style={styles.rowCenter}>
                    <TouchableOpacity
                        style={styles.smallButton}
                        onPress={() => openModal("allergy", "Lisää allergia")}
                    >
                        <Text style={styles.smallButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                {allergies.map((item, index) => (
                    <Text key={index} style={styles.listItem}>• {item}</Text>
                ))}
            </View>

            <Text style={styles.linksTitle}>Linkit:</Text>

            <View style={styles.rowCenterAbsolute}>
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
        right: 25,
        width: 120,
        height: 120,
        borderRadius: 30,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#009FE3",
        justifyContent: "center",
        alignItems: "center",
    },

    section: {
        marginTop: 20,
        width: "80%",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 6,
    },

    rowCenter: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
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
    },
    smallButtonText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
    },

    listItem: {
        marginTop: 4,
        fontSize: 16,
    },

    linksTitle: {
        position: "absolute",
        bottom: 80,
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 18,
        fontWeight: "bold",
    },
    rowCenterAbsolute: {
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
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
})