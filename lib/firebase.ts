import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_o0yNzgE7nAdjsBxBASKo5r1-M_DYuxQ",
  authDomain: "yobrwiki.firebaseapp.com",
  projectId: "yobrwiki",
  storageBucket: "yobrwiki.firebasestorage.app",
  messagingSenderId: "1085154849383",
  appId: "1:1085154849383:web:61178835e2bff1260e1ac2",
  measurementId: "G-Z8PZP4CZ1X",
};

// Only initialize Firebase if it hasn't been initialized already
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

// Export initialized services
export { db, auth, app };
