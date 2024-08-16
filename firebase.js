// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFireBase} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const db = getFireBase(app);

export {db}