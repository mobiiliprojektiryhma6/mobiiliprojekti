import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';

type Props = {
  onOpenScanner: () => void;
};

export const FoodInput: React.FC<Props> = ({ onOpenScanner }) => {
  const [food, setFood] = React.useState('');

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="What are you eating/drinking?"
        value={food}
        onChangeText={setFood}
       />

       <TouchableOpacity onPress={onOpenScanner} style={styles.cameraButton}>
        <Text style={styles.cameraIcon}>📷</Text>
      </TouchableOpacity>
    </View>
   );
}


const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  cameraButton: {
    padding: 8,
  },
  cameraIcon: {
    fontSize: 24,
  },
});

