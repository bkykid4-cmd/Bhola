
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Configuration derived from the provided google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyAYoOYmTKP15EFefIhrp8eC7cLDeiAzNgk",
  authDomain: "student-pocket-money-2083b.firebaseapp.com",
  projectId: "student-pocket-money-2083b",
  storageBucket: "student-pocket-money-2083b.firebasestorage.app",
  messagingSenderId: "723662011136",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  // Use device language for auth flow (reCAPTCHA/SMS)
  firebase.auth().useDeviceLanguage();
}

// Export services
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
export default firebase;
