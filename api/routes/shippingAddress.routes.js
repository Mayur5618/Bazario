import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getShippingAddresses,
  addShippingAddress,
  deleteShippingAddress
} from '../controllers/shippingAddress.controller.js';

const router = express.Router();

router.use(protect);  // Protect all shipping address routes

// Updated routes to match frontend requests
router.get('/shipping-addresses', getShippingAddresses);
router.post('/shipping-addresses', addShippingAddress);
router.delete('/shipping-addresses/:addressId', deleteShippingAddress);

export default router; 