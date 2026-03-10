import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import Login from './components/Login';
import './firebase/config';
import AuthStatus from './components/AuthStatus';
import Logout from './components/Logout';
import { useAuth } from './src/hooks/useAuth';


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
    return (
      <View style={styles.container}>
        <Login />
        <StatusBar style="auto" />
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <Text>💊💊 Welcome to Diabetes App! 💊💊</Text>
      <Text> YOU'RE LOGGED IN! 😈 </Text>
      <AuthStatus />
      <Logout />
      <StatusBar style="auto" />
    </View>
  );
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