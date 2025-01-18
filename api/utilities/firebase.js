import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../config/firebase.config.js";

// Upload file to Firebase Storage
export const uploadToFirebase = async (base64String) => {
    try {
        const timestamp = Date.now();
        const fileName = `reviews/${timestamp}_${Math.random().toString(36).substring(7)}`;
        const storageRef = ref(storage, fileName);
        
        // Remove the data:image/jpeg;base64, prefix
        const base64WithoutPrefix = base64String.split(',')[1];
        
        const snapshot = await uploadString(storageRef, base64WithoutPrefix, 'base64');
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return downloadURL;
    } catch (error) {
        console.error("Firebase upload error:", error);
        throw error;
    }
};

// Delete file from Firebase Storage
export const deleteFromFirebase = async (fileUrl) => {
    try {
        const fileRef = ref(storage, fileUrl);
        await deleteObject(fileRef);
        return true;
    } catch (error) {
        console.error("Firebase delete error:", error);
        return false;
    }
}; 