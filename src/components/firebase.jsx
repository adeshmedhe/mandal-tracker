// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBEdfS2JQ1tT_P1ekpy41TcewiJDCBXLMU",
  authDomain: "dayawanmandal-12165.firebaseapp.com",
  projectId: "dayawanmandal-12165",
  storageBucket: "dayawanmandal-12165.firebasestorage.app",
  messagingSenderId: "1010254455758",
  appId: "1:1010254455758:web:1ef98ddc33c7983531019f",
  measurementId: "G-KL70LYWCQ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore(app);
export default app;
