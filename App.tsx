import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import './firebase/config';
import { useAuth } from './src/hooks/useAuth';
import Loginscreen from './screens/Loginscreen';
import Homescreen from './screens/Homescreen';

export default function App() {
  const { email, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!email) {
    return <Loginscreen />;
  }

  return <Homescreen />;
}

const styles = StyleSheet.create({
  container: {
    fontFamily: 'Avenir',
    flex: 1,
    backgroundColor: '#ffffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
