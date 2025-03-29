import express from 'express';
import { getBuyerCity } from '../controllers/product.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get buyer's city
router.get('/city',protect, getBuyerCity);

export default router; 