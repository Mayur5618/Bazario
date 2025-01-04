import express from 'express';
import { signup, signin, updatePlatformTypes, sendOtp, verifyOtp, verifyUser, logout, checkAuth, signOut } from'../controllers/user.controller.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.patch('/platform-types', protect, updatePlatformTypes);
router.post('/send-otp', sendOtp); // Route for sending OTP
router.post('/verify-otp', verifyOtp); // Route for verifying OTP
router.get('/verify', verifyUser);
router.post('/logout', logout);
router.get('/check-auth', checkAuth);
router.post('/sign-out', signOut);

export default router;