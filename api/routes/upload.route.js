import express from 'express';
import { uploadToFirebase } from '../utilities/firebase.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for agency registration
router.post('/firebase', async (req, res) => {
    try {
        const { file, path } = req.body;
        
        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file provided'
            });
        }

        // Add data:image/jpeg;base64, prefix if not present
        const base64String = file.startsWith('data:') 
            ? file 
            : `data:image/jpeg;base64,${file}`;
        
        try {
            // Upload to Firebase
            const downloadURL = await uploadToFirebase(base64String);
            
            res.status(200).json({
                success: true,
                url: downloadURL
            });
        } catch (uploadError) {
            console.error('Firebase upload error:', uploadError);
            res.status(500).json({
                success: false,
                message: 'Error uploading to Firebase: ' + uploadError.message
            });
        }
    } catch (error) {
        console.error('Route error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error processing upload request'
        });
    }
});

// Protected route for other uploads
router.post('/firebase/protected', protect, async (req, res) => {
    try {
        const { file, path } = req.body;
        
        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file provided'
            });
        }

        // Add data:image/jpeg;base64, prefix if not present
        const base64String = file.startsWith('data:') 
            ? file 
            : `data:image/jpeg;base64,${file}`;
        
        try {
            // Upload to Firebase
            const downloadURL = await uploadToFirebase(base64String);
            
            res.status(200).json({
                success: true,
                url: downloadURL
            });
        } catch (uploadError) {
            console.error('Firebase upload error:', uploadError);
            res.status(500).json({
                success: false,
                message: 'Error uploading to Firebase: ' + uploadError.message
            });
        }
    } catch (error) {
        console.error('Route error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error processing upload request'
        });
    }
});

export default router; 