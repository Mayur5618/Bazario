import express from 'express';
import { protect, verifyToken } from '../middleware/authMiddleware.js';
import {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart
} from '../controllers/cart.controller.js';

const router = express.Router();

router.use(protect);

router.post('/add', addToCart);
router.get('/getCartItems', getCart);
router.put('/update/:productId', updateCartItem);
router.delete('/remove/:productId', removeFromCart);

export default router; 