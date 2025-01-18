import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import { addReplyToReview, checkUserReview, createReview, deleteReview, getProductReviews, getProductReviewsPaginated, getReviewById, toggleLike, updateReview, voteReview } from '../controllers/review.controller.js';


const router = express.Router();


// Review routes
router.post('/products/:productId/reviews', protect, createReview);
router.get('/products/:productId/reviews', getProductReviews);
router.post('/reviews/:reviewId/reply', protect, addReplyToReview);
router.post('/reviews/:reviewId/vote', protect, voteReview);

router.get('/products/:productId/reviews/paginated', getProductReviewsPaginated);
router.get('/reviews/:reviewId', getReviewById);
router.post('/reviews/:reviewId/like', protect, toggleLike);
router.delete('/:reviewId', protect, deleteReview);
router.patch('/:reviewId', protect,updateReview);
router.get('/user/product/:productId', protect, checkUserReview);

// Update review
router.put('/:reviewId', protect, updateReview);

// Delete review
router.delete('/:reviewId', protect, deleteReview);

// Toggle like
router.post('/:reviewId/like', protect, toggleLike);

// Get reviews for a product (public route - no auth needed)
router.get('/products/:productId', getProductReviews);

export default router;