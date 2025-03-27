import express from 'express';
import { 
    getDashboardStats, 
    getPendingOrders, 
    getSellerProducts,
    getReviewStats,
    getLatestReviews,
    searchProductReviews 
} from '../controllers/seller.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Dashboard
router.get('/dashboard-stats', verifyToken, getDashboardStats);

// Products
router.get('/products', verifyToken, getSellerProducts);

// Orders
router.get('/pending-orders', verifyToken, getPendingOrders);

// Reviews
router.get('/reviews/stats', verifyToken, getReviewStats);
router.get('/reviews/latest', verifyToken, getLatestReviews);
router.get('/reviews/search', verifyToken, searchProductReviews);

export default router;