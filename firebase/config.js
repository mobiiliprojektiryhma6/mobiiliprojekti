import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {

  apiKey: "AIzaSyB4WwV_2TaMt1gWX3oMaoxemhcTNTMIFVQ",
  authDomain: "diabetesapp-b95c3.firebaseapp.com",
  projectId: "diabetesapp-b95c3",
  storageBucket: "diabetesapp-b95c3.firebasestorage.app",
  messagingSenderId: "528870293046",
  appId: "1:528870293046:web:284b4ecef4400ce6072297"
  
};



const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);
const storage = getStorage(app);

export {
  auth,
  db,
  storage,
  signInWithEmailAndPassword
}