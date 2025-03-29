import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getBuyerCity } from '../controllers/buyer.controller.js';

const router = express.Router();

// Get buyer's city - Protected route
router.get('/city', verifyToken, getBuyerCity);

export default router; 