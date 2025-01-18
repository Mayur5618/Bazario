import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import { addReplyToReview, createReview, deleteReview, getProductReviews, getProductReviewsPaginated, getReviewById, toggleLike, updateReview, voteReview } from '../controllers/review.controller.js';


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


export default router;