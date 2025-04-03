import express from 'express';
import { signup, signin, updatePlatformTypes, sendOtp, verifyOtp, verifyUser, logout, checkAuth, signOut, checkMobileExists, updateProfile, getSellerData, uploadProfileImage, getProfile, sellerSignup, getAgencyDetails } from'../controllers/user.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import Seller from '../models/seller.model.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/seller-signup', sellerSignup);
router.post('/signin', signin);
router.patch('/platform-types', protect, updatePlatformTypes);
router.post('/send-otp', sendOtp); // Route for sending OTP
router.post('/verify-otp', verifyOtp); // Route for verifying OTP
router.get('/verify', verifyUser);
router.post('/logout', logout);
router.get('/check-auth', checkAuth);
router.post('/sign-out', signOut);
router.post('/check-mobile', checkMobileExists);
router.put('/profile', protect, updateProfile);
router.post('/upload-profile-image', protect, uploadProfileImage); // New route for uploading profile image
router.get('/profile', protect, getProfile); // New route to get user profile

router.get('/sellers/:id', getSellerData);

// Update seller profile
router.put('/sellers/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find and update seller
    const seller = await Seller.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      seller
    });
  } catch (error) {
    console.error('Error updating seller profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
});

// Firebase upload route
router.post('/upload/firebase', protect, async (req, res) => {
  try {
    const { file } = req.body;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const downloadURL = await uploadToFirebase(file);
    
    res.status(200).json({
      success: true,
      url: downloadURL
    });
  } catch (error) {
    console.error('Firebase upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading to Firebase'
    });
  }
});

// Get agency details by ID
router.get('/agency/:agencyId', getAgencyDetails);

export default router;