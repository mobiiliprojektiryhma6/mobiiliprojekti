import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { BottomSheet } from "react-native-btr";
import { globalStyles } from "../../src/styles/globalStyles";

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
        <View>
            <TouchableOpacity onPress={toggleMenu} style={globalStyles.hamburgerButton} activeOpacity={0.8}>
                <Icon name="menu" size={28} color="#fff" />
            </TouchableOpacity>

            <BottomSheet visible={isVisible} onBackButtonPress={toggleMenu} onBackdropPress={toggleMenu}>
                <View style={globalStyles.hamburgerMenu}>
                    <TouchableOpacity onPress={() => navigateToScreen("Home")}><Text style={globalStyles.hamburgerMenuItem}>Home</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateToScreen("FoodDiary")}><Text style={globalStyles.hamburgerMenuItem}>Food Diary</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateToScreen("FoodSearch")}><Text style={globalStyles.hamburgerMenuItem}>Food Search</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateToScreen("MealBuilder")}><Text style={globalStyles.hamburgerMenuItem}>Meal Builder</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateToScreen("Profile")}><Text style={globalStyles.hamburgerMenuItem}>Profile</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateToScreen("Medications")}><Text style={globalStyles.hamburgerMenuItem}>Medications</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateToScreen("Logout")}><Text style={globalStyles.hamburgerMenuItem}>Logout</Text></TouchableOpacity>
                </View>
            </BottomSheet>
        </View>
    );
};

export default HamburgerMenuButton;
