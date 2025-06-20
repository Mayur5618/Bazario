import express from 'express';
import { verifyToken, agency } from '../middleware/authMiddleware.js';
import { placeBid, getBidHistory, getMyBids, getHighestBidder, getActiveAuctions, getAgencyActiveBids, getActiveAuctionsProducts, getCategoryWiseAuctions } from '../controllers/bid.controller.js';

const router = express.Router();

// Place a bid (public route since agencyId is sent in request body)
router.post('/place', placeBid);

// Get bid history for a product (public)
router.get('/history/:productId', getBidHistory);

// Get my bids (only for agencies)
router.get('/my-bids', verifyToken, agency, getMyBids);

// Get highest bidder for a product (public)
router.get('/highest-bidder/:productId', getHighestBidder);

// Get active auctions count and details (public)
router.get('/active-auctions', getActiveAuctions);

router.get('/active-auctions/:agencyId', getActiveAuctionsProducts);

// Get agency's active bid products (public)
router.get('/agency-active-bids/:agencyId', getAgencyActiveBids);

// Get category-wise auctions for last month
router.get('/category-wise-auctions/:agencyId', getCategoryWiseAuctions);

export default router;