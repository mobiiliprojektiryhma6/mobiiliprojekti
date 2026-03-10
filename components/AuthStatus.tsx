import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../src/hooks/useAuth';
 
const AuthStatus: React.FC = () => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
        <View>
            <Text>Loading...</Text>
        </View>
        );
    }

    return (
     <View>
        <Text>
            {user ? `Logged in as ${user.displayName}` : 'Not logged in'}
        </Text>
    </View>
    );

};


export default AuthStatus;