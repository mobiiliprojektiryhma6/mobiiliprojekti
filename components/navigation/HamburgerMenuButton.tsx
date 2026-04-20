import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { BottomSheet } from "react-native-btr";
import { useHamburgerMenuButton } from "../../src/hooks/useHamburgerMenuButton";
import type { HamburgerMenuButtonProps } from "../../types/HamburgerMenuButtonTypes";
import { globalStyles } from "../../src/styles/globalStyles";

const HamburgerMenuButton = ({ onNavigate }: HamburgerMenuButtonProps) => {
    const { isVisible, navigateToScreen, toggleMenu } = useHamburgerMenuButton({ onNavigate });

    return (
        <View>
            <TouchableOpacity onPress={toggleMenu} style={globalStyles.hamburgerButton} activeOpacity={0.8}>
                <Icon name="menu" size={28} color="#fff" />
            </TouchableOpacity>

            <BottomSheet visible={isVisible} onBackButtonPress={toggleMenu} onBackdropPress={toggleMenu}>
                <View style={globalStyles.hamburgerMenu}>
                    <TouchableOpacity onPress={() => navigateToScreen("Home")}>
                        <Text style={globalStyles.hamburgerMenuItem}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateToScreen("FoodDiary")}>
                        <Text style={globalStyles.hamburgerMenuItem}>Food Diary</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateToScreen("FoodSearch")}>
                        <Text style={globalStyles.hamburgerMenuItem}>Food Search</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateToScreen("MealBuilder")}>
                        <Text style={globalStyles.hamburgerMenuItem}>Meal Builder</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateToScreen("Medications")}>
                        <Text style={globalStyles.hamburgerMenuItem}>Medications</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateToScreen("Logout")}>
                        <Text style={globalStyles.hamburgerMenuItem}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheet>
        </View>
    );
};

export default HamburgerMenuButton;
