import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {getStorage} from 'firebase/storage'
// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCyZhS4-IV1Ph49sMFz1txMlJSpvlGRYmM",
  authDomain: "chatify-alfarabi.firebaseapp.com",
  projectId: "chatify-alfarabi",
  storageBucket: "chatify-alfarabi.appspot.com",
  messagingSenderId: "920265112504",
  appId: "1:920265112504:web:e421254519a864f3bfad4d"
};
// initialize firebase
initializeApp(firebaseConfig);
export const auth = getAuth();
export const database = getFirestore();
export const storage = getStorage();