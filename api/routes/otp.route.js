import express from 'express';
import { checkMobile, sendOTP, verifyOTP } from '../controllers/otp.controller.js';


const router = express.Router();

router.post('/check-mobile', checkMobile);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

export default router; 