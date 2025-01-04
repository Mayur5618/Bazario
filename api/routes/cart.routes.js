import express from 'express';
import { protect, verifyToken } from '../middleware/authMiddleware.js';
import {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart
} from '../controllers/cart.controller.js';

const router = express.Router();

router.post('/add', addToCart);
router.get('/getCartItems', verifyToken, getCart);
router.put('/update', verifyToken, updateCartItem);
router.delete('/remove/:productId', verifyToken, removeFromCart);

export default router; 