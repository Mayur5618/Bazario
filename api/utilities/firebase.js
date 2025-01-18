import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../config/firebase.config.js";

// Upload file to Firebase Storage
export const uploadToFirebase = async (base64String) => {
    try {
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

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const fileName = `reviews/${timestamp}_${randomString}.jpg`;

        // Create reference
        const storageRef = ref(storage, fileName);

        try {
            // Upload image
            const snapshot = await uploadString(storageRef, base64Data, 'base64', {
                contentType: 'image/jpeg'
            });

            // Get download URL
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;

        } catch (uploadError) {
            console.error('Detailed upload error:', uploadError);
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