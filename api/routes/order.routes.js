import express from 'express';
import { protect, verifyToken } from '../middleware/authMiddleware.js';
import {
    createOrder,
    getMyOrders,
    getOrderDetails,
    cancelOrder,
    getSellerOrders,
    updateOrderStatus,
    getBuyerOrdersWithDetails
} from '../controllers/order.controller.js';

const router = express.Router();

router.use(protect);

// Buyer routes
router.post('/create', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderDetails);
router.put('/cancel/:id', cancelOrder);
// Get all orders with details for buyer
router.get('/my-orders-details', getBuyerOrdersWithDetails);

// Seller routes
router.get('/seller-orders', getSellerOrders);
router.put('/update-status/:id', updateOrderStatus);

export default router; 