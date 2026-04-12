import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { BottomSheet } from "react-native-btr";

type MenuRoute =
    | "Home"
    | "FoodDiary"
    | "FoodSearch"
    | "MealBuilder"
    | "Profile"
    | "Medications"
    | "FavoriteMeals"
    | "Logout";

type HamburgerMenuButtonProps = {
    onNavigate: (screenName: MenuRoute) => void;
};

const HamburgerMenuButton = ({ onNavigate }: HamburgerMenuButtonProps) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleMenu = () => setIsVisible((v) => !v);

    const navigateToScreen = (screenName: MenuRoute) => {
        onNavigate(screenName);
        setIsVisible(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={toggleMenu} style={styles.button} activeOpacity={0.8}>
                <Icon name="menu" size={28} color="#fff" />
            </TouchableOpacity>

            <BottomSheet visible={isVisible} onBackButtonPress={toggleMenu} onBackdropPress={toggleMenu}>
                <View style={styles.menu}>
                    <TouchableOpacity onPress={() => navigateToScreen("Home")}><Text style={styles.menuItem}>Home</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateToScreen("FoodDiary")}><Text style={styles.menuItem}>Food Diary</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateToScreen("FoodSearch")}><Text style={styles.menuItem}>Food Search</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateToScreen("MealBuilder")}><Text style={styles.menuItem}>Meal Builder</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateToScreen("Profile")}><Text style={styles.menuItem}>Profile</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateToScreen("Medications")}><Text style={styles.menuItem}>Medications</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateToScreen("Logout")}><Text style={styles.menuItem}>Logout</Text></TouchableOpacity>
                </View>
            </BottomSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
    button: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#007AFF",
        alignItems: "center",
        justifyContent: "center",
        elevation: 8,
        zIndex: 10,
    },
    menu: {
        backgroundColor: "#fff",
        padding: 20,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    menuItem: {
        fontSize: 18,
        paddingVertical: 10,
    },
});

export default HamburgerMenuButton;
