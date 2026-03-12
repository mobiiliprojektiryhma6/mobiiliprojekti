import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

let getReactNativePersistence: any;
try {
    getReactNativePersistence = require('firebase/auth/react-native')?.getReactNativePersistence;
} catch {
    try {
        getReactNativePersistence = require('firebase/auth')?.getReactNativePersistence;
    } catch {
        getReactNativePersistence = undefined;
    }
}


const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const authOptions: any = {};
if (getReactNativePersistence) {
    authOptions.persistence = getReactNativePersistence(AsyncStorage);
}
const auth = initializeAuth(app, authOptions);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export { signInWithEmailAndPassword } from 'firebase/auth';
