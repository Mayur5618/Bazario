import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import {
  createReview,
  getReviews,
  getSellerReviews,
  replyToReview
} from '../controllers/review.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getReviews)
  .post(restrictTo('customer'), createReview);

router.get('/seller', restrictTo('seller'), getSellerReviews);

router.post('/:reviewId/reply', restrictTo('seller'), replyToReview);

export default router; 