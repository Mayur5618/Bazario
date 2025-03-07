import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//     apiKey: "AIzaSyDpzBfd14AS4QbNT4HajutNEVZqth4W9u4",
//     authDomain: "bazario-71632.firebaseapp.com",
//     projectId: "bazario-71632",
//     storageBucket: "bazario-71632.firebasestorage.app",
//     messagingSenderId: "144362762032",
//     appId: "1:144362762032:web:0498f2066b97af9a14e2f5",
//     measurementId: "G-62Y7S71037"
//   };

const firebaseConfig = {
  apiKey:"AIzaSyDMCugcBGIu5aVNLQxx4YWXLb-9z0ol0tY",
  authDomain: "first-6d6e4.firebaseapp.com",
  projectId: "first-6d6e4",
  storageBucket: "first-6d6e4.appspot.com",
  messagingSenderId: "61967086299",
  appId: "1:61967086299:web:8de0c156d70deb34b912fe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app); 


