import React from 'react';
import { Button, Text } from 'react-native';
import { useAuth } from '../src/hooks/useAuth';

const Logout: React.FC = () => {
const { logout } = useAuth();
const handleLogout = async () => {
        try {
            await logout();
            console.log("✅ User signed out! 👋");

        } catch (error) {
            console.error("🚫 Error signing out: ", error);
        }
    };

    return (
        <Button title="Logout" onPress={() => void handleLogout()} />
    );
};

export default Logout;