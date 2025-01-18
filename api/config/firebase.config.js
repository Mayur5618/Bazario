    import { initializeApp } from "firebase/app";
    import { getStorage } from "firebase/storage";
    
    const firebaseConfig = {
        apiKey: "AIzaSyDpzBfd14AS4QbNT4HajutNEVZqth4W9u4",
        authDomain: "bazario-71632.firebaseapp.com",
        projectId: "bazario-71632",
        storageBucket: "bazario-71632.firebasestorage.app",
        messagingSenderId: "144362762032",
        appId: "1:144362762032:web:0498f2066b97af9a14e2f5",
        measurementId: "G-62Y7S71037"
      };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    export const storage = getStorage(app); 


