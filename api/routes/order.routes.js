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

// Buyer routes
router.post('/create',verifyToken, createOrder);
router.get('/my-orders',verifyToken, getMyOrders);
router.get('/details/:orderId',verifyToken, getOrderDetails);
router.put('/cancel/:orderId',verifyToken, cancelOrder);
// Get all orders with details for buyer
router.get('/my-orders-details',verifyToken, getBuyerOrdersWithDetails);

// Seller routes
router.get('/seller-orders',verifyToken, getSellerOrders);
router.put('/update-status/:orderId',verifyToken, updateOrderStatus);

export default router; 