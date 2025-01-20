import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../config/firebase.config.js";

// Upload file to Firebase Storage
export const uploadToFirebase = async (base64String) => {
    try {
        console.log('Starting Firebase upload process');
        
        // Validate input
        if (!base64String || typeof base64String !== 'string') {
            throw new Error('Invalid image data');
        }

        // Clean up base64 string
        let base64Data = base64String;
        if (base64String.includes('base64,')) {
            base64Data = base64String.split('base64,')[1];
        }

        if (!base64Data) {
            throw new Error('Invalid base64 string format');
        }

        console.log('Base64 data processed');

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const fileName = `profiles/${timestamp}_${randomString}.jpg`;
        console.log('Generated filename:', fileName);

        // Create reference
        const storageRef = ref(storage, fileName);
        console.log('Storage reference created');

        try {
            console.log('Starting upload to Firebase Storage...');
            const snapshot = await uploadString(storageRef, base64Data, 'base64', {
                contentType: 'image/jpeg'
            });
            console.log('Upload successful, getting download URL...');

            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log('Download URL obtained:', downloadURL);
            
            return downloadURL;
        } catch (uploadError) {
            console.error('Firebase upload error:', uploadError);
            throw new Error(uploadError.message || 'Failed to upload to Firebase');
        }
    } catch (error) {
        console.error("Firebase upload error:", {
            error,
            errorCode: error.code,
            errorMessage: error.message,
            errorDetails: error.serverResponse
        });
        throw error;
    }
};

// Delete file from Firebase Storage
export const deleteFromFirebase = async (fileUrl) => {
    try {
        if (!fileUrl) return true;

        const fileRef = ref(storage, fileUrl);
        await deleteObject(fileRef);
        return true;
    } catch (error) {
        console.error("Firebase delete error:", error);
        return false;
    }
}; 