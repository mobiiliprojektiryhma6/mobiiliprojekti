import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import Login from './components/Login';
import './firebase/config';

export default function App() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  if (!loggedIn) {
    return (
      <View style={styles.container}>
        <Login setLoggedIn={setLoggedIn} />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>💊💊 Welcome to Diabetes App! 💊💊</Text>
      <Text> YOU'RE LOGGED IN! 😈 </Text>
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
