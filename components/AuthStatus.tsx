import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../src/hooks/useAuth';

const AuthStatus: React.FC = () => {
    const { email, loading } = useAuth();

    console.log('AuthStatus email:', email);

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
                {email ? `Logged in as ${email}` : 'Not logged in'}
            </Text>
        </View>
    );

};


export default AuthStatus;