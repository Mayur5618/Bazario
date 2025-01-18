import Review from '../models/review.model.js';
import Order from '../models/order.model.js';
import { uploadToFirebase, deleteFromFirebase } from '../utilities/firebase.js';

export const createReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment, images } = req.body; // images will be base64 strings
        const userId = req.user._id;

        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Rating and comment are required'
            });
        }

        // Upload images to Firebase
        let imageUrls = [];
        if (images?.length) {
            const uploadPromises = images.map(base64String => uploadToFirebase(base64String));
            imageUrls = await Promise.all(uploadPromises);
        }

        const newReview = await Review.create({
            product: productId,
            buyer: userId,
            rating,
            comment,
            images: imageUrls
        });

        const populatedReview = await Review.findById(newReview._id)
            .populate('buyer', 'firstname lastname');

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            review: populatedReview
        });

    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating review',
            error: error.message
        });
    }
};

export const addReplyToReview = async (req, res) => {
    try {
        const { comment } = req.body;
        const { reviewId } = req.params;
        const userId = req.user._id;
        const userType = req.user.userType; // 'buyer' or 'seller'

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        review.replies.push({
            user: userId,
            comment,
            userType
        });

        await review.save();

        const updatedReview = await Review.findById(reviewId)
            .populate('buyer', 'firstname lastname')
            .populate('replies.user', 'firstname lastname');

        res.status(200).json({
            success: true,
            review: updatedReview
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding reply',
            error: error.message
        });
    }
};

// Vote on review helpfulness
export const voteReview = async (req, res) => {
    try {
        const { helpful } = req.body;
        const { reviewId } = req.params;
        const userId = req.user._id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Remove existing vote if any
        review.helpfulVotes = review.helpfulVotes.filter(
            vote => vote.user.toString() !== userId.toString()
        );

        // Add new vote
        review.helpfulVotes.push({
            user: userId,
            helpful
        });

        await review.save();

        res.status(200).json({
            success: true,
            message: 'Vote recorded successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error recording vote',
            error: error.message
        });
    }
};

// Add this to your existing review controller
export const toggleLike = async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const userId = req.user._id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        const isLiked = await review.toggleLike(userId);

        res.json({
            success: true,
            message: isLiked ? 'Review liked' : 'Review unliked',
            likesCount: review.likesCount,
            isLiked
        });

    } catch (error) {
        console.error('Like toggle error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling like',
            error: error.message
        });
    }
};

// Get reviews for a product
export const getProductReviews = async (req, res) => {
    try {
        const productId = req.params.productId;

        const reviews = await Review.find({ product: productId })
            .populate('buyer', 'firstname lastname')
            .populate('replies.user', 'firstname lastname')
            .populate('likes.user', 'firstname lastname')
            .sort({ createdAt: -1 }); // Latest reviews first

        // Calculate some stats
        const stats = {
            totalReviews: reviews.length,
            averageRating: reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length || 0,
            ratingBreakdown: {
                5: reviews.filter(r => r.rating === 5).length,
                4: reviews.filter(r => r.rating === 4).length,
                3: reviews.filter(r => r.rating === 3).length,
                2: reviews.filter(r => r.rating === 2).length,
                1: reviews.filter(r => r.rating === 1).length
            }
        };

        res.json({
            success: true,
            reviews,
            stats,
            totalCount: reviews.length
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews',
            error: error.message
        });
    }
};

// Get reviews with pagination
export const getProductReviewsPaginated = async (req, res) => {
    try {
        const productId = req.params.productId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order || 'desc';
        const filterRating = parseInt(req.query.rating) || 0;

        // Build filter object
        const filter = { product: productId };
        if (filterRating > 0) {
            filter.rating = filterRating;
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = order === 'desc' ? -1 : 1;

        const reviews = await Review.find(filter)
            .populate('buyer', 'firstname lastname')
            .populate('replies.user', 'firstname lastname')
            .populate('likes.user', 'firstname lastname')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);

        // Get total count for pagination
        const totalCount = await Review.countDocuments(filter);

        // Calculate stats for all reviews
        const allReviews = await Review.find({ product: productId });
        const stats = {
            totalReviews: allReviews.length,
            averageRating: allReviews.reduce((acc, review) => acc + review.rating, 0) / allReviews.length || 0,
            ratingBreakdown: {
                5: allReviews.filter(r => r.rating === 5).length,
                4: allReviews.filter(r => r.rating === 4).length,
                3: allReviews.filter(r => r.rating === 3).length,
                2: allReviews.filter(r => r.rating === 2).length,
                1: allReviews.filter(r => r.rating === 1).length
            }
        };

        res.json({
            success: true,
            reviews,
            stats,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalReviews: totalCount,
                hasMore: page * limit < totalCount
            }
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews',
            error: error.message
        });
    }
};

// Get review by ID
export const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId)
            .populate('buyer', 'firstname lastname')
            .populate('replies.user', 'firstname lastname')
            .populate('likes.user', 'firstname lastname');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            review
        });

    } catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching review',
            error: error.message
        });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if the user owns the review
        if (review.buyer.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own reviews'
            });
        }

        // Use deleteOne() instead of remove()
        await Review.deleteOne({ _id: reviewId });

        return res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Delete review error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting review',
            error: error.message
        });
    }
};

export const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment, deletedImages, images } = req.body; // images will be base64 strings
        const userId = req.user._id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        if (review.buyer.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to update this review'
            });
        }

        let imageUrls = [...review.images];

        // Delete images if any
        if (deletedImages?.length) {
            for (const imageUrl of deletedImages) {
                await deleteFromFirebase(imageUrl);
                imageUrls = imageUrls.filter(url => url !== imageUrl);
            }
        }

        // Upload new images
        if (images?.length) {
            const uploadPromises = images.map(base64String => uploadToFirebase(base64String));
            const newImageUrls = await Promise.all(uploadPromises);
            imageUrls = [...imageUrls, ...newImageUrls];
        }

        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            {
                $set: {
                    rating: rating || review.rating,
                    comment: comment || review.comment,
                    images: imageUrls,
                    updatedAt: Date.now()
                }
            },
            { new: true }
        ).populate('buyer', 'firstname lastname');

        res.json({
            success: true,
            message: 'Review updated successfully',
            review: updatedReview
        });

    } catch (error) {
        console.error('Review update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating review',
            error: error.message
        });
    }
};