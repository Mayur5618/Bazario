import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "first-6d6e4.firebaseapp.com",
  projectId: "first-6d6e4",
  storageBucket:"first-6d6e4.appspot.com",
  messagingSenderId: "61967086299",
  appId: "1:61967086299:web:8de0c156d70deb34b912fe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app); 


