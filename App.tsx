import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import Login from './components/Login';
import './firebase/config';
import AuthStatus from './components/AuthStatus';
import Logout from './components/Logout';
import { useAuth } from './src/hooks/useAuth';


export default function App() {
  const { user, loading } = useAuth();


  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }
  
  if (!user) {
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
    backgroundColor: '#ffffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
