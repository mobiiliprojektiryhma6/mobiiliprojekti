import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BarCodeScannerResult } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';


export const BarcodeScannerScreen = ()=> {
    const navigation = useNavigation<any>();
    const [scanned, setScanned] = React.useState(false);

    const [permission, requestPermission] = useCameraPermissions();
    
    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) {
        return <Text>Requesting camera permission...</Text>;
    }
    if (!permission.granted) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
                }}
                onBarcodeScanned={(result) => {
                    if (scanned) return;
                    setScanned(true);
                    console.log("Scanned barcode:", result.data);
                    navigation.navigate("Home");
                }}
            />
        </View>
    );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  camera: {
    flex: 1,
  },
  permissionText: {
    color: 'gray',
  }
});

