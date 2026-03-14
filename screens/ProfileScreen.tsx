import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, Linking, TouchableOpacity, TextInput, Keyboard, Image, Alert } from "react-native"
import { useCameraPermissions } from 'expo-camera'
import * as ImagePicker from "expo-image-picker"
import { useAuth } from "../src/hooks/useAuth"

export default function ProfileScreen() {

    const [weightInput, setWeightInput] = useState("")
    const [weights, setWeights] = useState<string[]>([])
    const [heightInput, setHeightInput] = useState("")
    const [heights, setHeights] = useState<string[]>([])
    const [diseaseInput, setDiseaseInput] = useState("")
    const [diseases, setDiseases] = useState<string[]>([])
    const [allergyInput, setAllergyInput] = useState("")
    const [allergies, setAllergies] = useState<string[]>([])
    const [profileImage, setProfileImage] = useState<string | null>(null)
    const [permission, requestPermission] = useCameraPermissions()

    const { user } = useAuth();

    const openLink = (url: string) => {
        Linking.openURL(url);
    }

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) {
        return <Text>Requesting camera permission...</Text>;
    }
    if (!permission.granted) {
        return <Text>No access to camera</Text>;
    }



    const addDisease = () => {
        if (diseaseInput.trim() !== "") {
            setDiseases([...diseases, diseaseInput]);
            setDiseaseInput("");
            Keyboard.dismiss();
        }
    }

    const addAllergy = () => {
        if (allergyInput.trim() !== "") {
            setAllergies([...allergies, allergyInput]);
            setAllergyInput("");
            Keyboard.dismiss();
        }
    }

    const addWeight = () => {
        if (weightInput.trim() !== "") {
            setWeights([...weights, weightInput]);
            setWeightInput("");
            Keyboard.dismiss();
        }
    }

    const addHeight = () => {
        if (heightInput.trim() !== "") {
            setHeights([...heights, heightInput]);
            setHeightInput("");
            Keyboard.dismiss();
        }
    }

    const pickFromLibrary = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            alert("Salli kuvien käyttö asetuksista.");
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    }

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            alert("Salli kameran käyttö asetuksista.");
            return
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        })

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
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


    return (
        <View style={styles.container}>

            <View style={styles.headerLeft}>
                <Text style={styles.profileName}>
                    {user?.displayName || "Profile Screen"}
                </Text>
                <Text style={styles.emailName}>
                    {user?.email || "N/A"}
                </Text>
            </View>

            <TouchableOpacity style={styles.profileImage} onPress={chooseImageOption}>
                {profileImage ? (
                    <Image
                        source={{ uri: profileImage }}
                        style={{ width: "100%", height: "100%", borderRadius: 30 }}
                    />
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
                            <TextInput
                                style={styles.input}
                                placeholder="Lisää pituus"
                                value={heightInput}
                                onChangeText={setHeightInput}
                                keyboardType="numeric"
                            />
                            <TouchableOpacity style={styles.smallButton} onPress={addHeight}>
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
                            <TextInput
                                style={styles.input}
                                placeholder="Lisää paino"
                                value={weightInput}
                                onChangeText={setWeightInput}
                                keyboardType="numeric"
                            />
                            <TouchableOpacity style={styles.smallButton} onPress={addWeight}>
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
                <Text style={styles.sectionTitle}>Perussairaudet:</Text>

                <View style={styles.rowCenter}>
                    <TextInput
                        style={styles.input}
                        placeholder="Lisää perussairaus"
                        value={diseaseInput}
                        onChangeText={setDiseaseInput}
                    />
                    <TouchableOpacity style={styles.smallButton} onPress={addDisease}>
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
                    <TextInput
                        style={styles.input}
                        placeholder="Lisää allergia"
                        value={allergyInput}
                        onChangeText={setAllergyInput}
                    />
                    <TouchableOpacity style={styles.smallButton} onPress={addAllergy}>
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

    input: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#fff",
    },

    smallButton: {
        marginLeft: 8,
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
})