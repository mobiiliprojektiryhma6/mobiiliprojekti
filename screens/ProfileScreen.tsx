import React from "react"
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Linking } from "react-native"

import ProfileHeader from "../components/ProfileHeader"
import PersonalInfoSection from "../components/PersonalInfoSection"
import HealthSection from "../components/HealthSection"
import EditModal from "../components/EditModal"

import { useProfileData } from "../src/hooks/useProfileData"


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
})
