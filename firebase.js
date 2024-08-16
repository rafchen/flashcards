// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTOiyRnmKlaRgFz82tpr3fc6V6-lERdmA",
  authDomain: "flashcard-10da3.firebaseapp.com",
  projectId: "flashcard-10da3",
  storageBucket: "flashcard-10da3.appspot.com",
  messagingSenderId: "362817137153",
  appId: "1:362817137153:web:17cdf7c90aae2192bc6e00",
  measurementId: "G-SJJKRXHFNQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Conditionally initialize Firebase Analytics
let analytics;
if (typeof window !== 'undefined') {
  // Check if analytics is supported before initializing
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { db, analytics };
