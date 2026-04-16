import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { BottomSheet } from "react-native-btr";
import { useTheme } from "../../src/theme/ThemeContext";

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

  const { theme, styles } = useTheme();

  const toggleMenu = () => setIsVisible((v) => !v);

  const navigateToScreen = (screenName: MenuRoute) => {
    onNavigate(screenName);
    setIsVisible(false);
  };

  return (
    <View>
      {/* Floating button */}
      <TouchableOpacity
        onPress={toggleMenu}
        style={styles.hamburgerButton}
        activeOpacity={0.8}
      >
        <Icon name="menu" size={28} color={theme.colors.white} />
      </TouchableOpacity>

      {/* Bottom sheet menu */}
      <BottomSheet
        visible={isVisible}
        onBackButtonPress={toggleMenu}
        onBackdropPress={toggleMenu}
      >
        <View style={[styles.hamburgerMenu, { backgroundColor: theme.colors.white }]}>
          <TouchableOpacity onPress={() => navigateToScreen("Home")}>
            <Text style={[styles.hamburgerMenuItem, { color: theme.colors.text }]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigateToScreen("FoodDiary")}>
            <Text style={[styles.hamburgerMenuItem, { color: theme.colors.text }]}>
              Food Diary
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigateToScreen("FoodSearch")}>
            <Text style={[styles.hamburgerMenuItem, { color: theme.colors.text }]}>
              Food Search
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigateToScreen("MealBuilder")}>
            <Text style={[styles.hamburgerMenuItem, { color: theme.colors.text }]}>
              Meal Builder
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigateToScreen("Profile")}>
            <Text style={[styles.hamburgerMenuItem, { color: theme.colors.text }]}>
              Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigateToScreen("Medications")}>
            <Text style={[styles.hamburgerMenuItem, { color: theme.colors.text }]}>
              Medications
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigateToScreen("Logout")}>
            <Text style={[styles.hamburgerMenuItem, { color: theme.colors.danger }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

export default HamburgerMenuButton;