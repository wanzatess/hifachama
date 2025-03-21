// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlzRXHPZWhjccrxnUbtP-fCoEItJ2aQ9U",
  authDomain: "hifachama.firebaseapp.com",
  projectId: "hifachama",
  storageBucket: "hifachama.firebasestorage.app",
  messagingSenderId: "369742533063",
  appId: "1:369742533063:web:13e6d93d7ea6e6c78dc9e2",
  measurementId: "G-J3BLYG7MTR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
