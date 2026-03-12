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
    backgroundColor: '#E5F7FD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  topBar: {
    width: '100%',
    height: 60,
    backgroundColor: '#009FE3',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 15,
  },

  topBarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  button: {
    backgroundColor: '#009FE3',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
