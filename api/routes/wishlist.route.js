import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { wishlistController } from '../controllers/wishlist.controller.js';  

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Add product to wishlist
router.post('/add', wishlistController.addToWishlist);

// Remove product from wishlist
router.delete('/remove/:productId', wishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/clear', wishlistController.clearWishlist);

export default router; 