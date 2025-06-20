import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import {
  createReview,
  getReviews,
  getSellerReviews,
  replyToReview,
  updateReview,
  checkUserReview,
  getProductReviews
} from '../controllers/review.controller.js';

const router = express.Router();

router.use(protect);

// Product review routes
router.get('/products/:productId', getProductReviews);
router.post('/products/:productId', restrictTo('customer'), createReview);
router.get('/check/:productId', checkUserReview);

// Review update and reply routes
router.put('/:reviewId', restrictTo('customer'), updateReview);
router.post('/:reviewId/reply', restrictTo('seller'), replyToReview);

// General review routes
router.route('/')
  .get(getReviews)
  .post(restrictTo('customer'), createReview);

router.get('/seller', restrictTo('seller'), getSellerReviews);

export default router; 