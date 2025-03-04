// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { FIREBASE_API_KEY } from "@env";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASA7dX7_7dX3ie7CH7mVP0xXEOlbXSZQ8",
  authDomain: "financial-planner-4176.firebaseapp.com",
  projectId: "financial-planner-4176",
  storageBucket: "financial-planner-4176.firebasestorage.app",
  messagingSenderId: "1013456442754",
  appId: "1:1013456442754:web:10d4c214db9ec4bb176b9b",
  measurementId: "G-F09MN7S630",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
