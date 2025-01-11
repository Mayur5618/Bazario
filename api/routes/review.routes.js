import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import { addReplyToReview, createReview, getProductReviews, getProductReviewsPaginated, getReviewById, toggleLike, voteReview } from '../controllers/review.controller.js';


const router = express.Router();

// Configure multer for image upload
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
});

// Review routes
router.post('/products/:productId/reviews', protect, upload.array('images', 5), createReview);
router.get('/products/:productId/reviews', getProductReviews);
router.post('/reviews/:reviewId/reply', protect, addReplyToReview);
router.post('/reviews/:reviewId/vote', protect, voteReview);

router.get('/products/:productId/reviews/paginated', getProductReviewsPaginated);
router.get('/reviews/:reviewId', getReviewById);
router.post('/reviews/:reviewId/like', protect, toggleLike);


export default router;