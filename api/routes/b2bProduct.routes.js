import express from 'express';
import { 
    createB2BProduct, 
    getActiveB2BAuctions, 
    getSellerB2BProducts, 
    updateB2BProduct, 
    cancelB2BAuction,
    getWonAuctions
} from '../controllers/b2bProduct.controller.js';
import { verifyToken as isAuthenticated, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create new B2B product with auction
router.post(
    '/create',
    isAuthenticated,
    checkRole(['seller']),
    createB2BProduct
);

// Get all active B2B auctions
router.get('/active-auctions', getActiveB2BAuctions);

// Get seller's B2B products
router.get(
    '/seller-products',
    isAuthenticated,
    checkRole(['seller']),
    getSellerB2BProducts
);

// Update B2B product
router.put(
    '/:productId',
    isAuthenticated,
    checkRole(['seller']),
    updateB2BProduct
);

// Cancel B2B auction
router.post(
    '/:productId/cancel',
    isAuthenticated,
    checkRole(['seller']),
    cancelB2BAuction
);

// Get won auctions for an agency
router.get('/won-auctions/:agencyId', getWonAuctions);

export default router; 