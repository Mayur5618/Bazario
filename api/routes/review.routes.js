import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import { addReplyToReview, checkUserReview, createReview, deleteReview, getProductReviews, getProductReviewsPaginated, getReviewById, toggleLike, updateReview, voteReview } from '../controllers/review.controller.js';


const router = express.Router();


// Review routes
router.post('/products/:productId', protect, createReview);
router.get('/products/:productId', getProductReviews);

// Reply route
router.post('/:reviewId/reply', protect, addReplyToReview);

// Other review interactions
router.post('/:reviewId/vote', protect, voteReview);
router.post('/:reviewId/like', protect, toggleLike);
router.get('/:reviewId', getReviewById);
router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);

// Check user review eligibility
router.get('/check/:productId', protect, checkUserReview);

// Get paginated reviews
router.get('/products/:productId/paginated', getProductReviewsPaginated);

export default router;