import Review from '../models/review.model.js';
import Order from '../models/order.model.js';
import { uploadToFirebase, deleteFromFirebase } from '../utilities/firebase.js';

export const createReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment, images, orderId } = req.body;
        const userId = req.user._id;

        // Match your order route's status check
        const validOrderStatuses = ['delivered', 'completed', 'Delivered', 'Completed'];

        // Check if the order exists and is completed/delivered
        const order = await Order.findOne({
            _id: orderId,
            buyer: userId,
            'items.product': productId,
            status: { $in: validOrderStatuses }
        });

        if (!order) {
            console.log('Order validation failed:', {
                orderFound: !!order,
                orderId,
                userId,
                productId
            });
            return res.status(403).json({
                success: false,
                message: 'You can only review products from completed or delivered orders'
            });
        }

        // Check if user has already reviewed
        const existingReview = await Review.findOne({
            product: productId,
            buyer: userId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        // Upload images if present
        let imageUrls = [];
        if (Array.isArray(images) && images.length > 0) {
            try {
                const uploadPromises = images.map(async (base64String) => {
                    if (base64String && typeof base64String === 'string') {
                        return await uploadToFirebase(base64String);
                    }
                    return null;
                });

                imageUrls = (await Promise.all(uploadPromises)).filter(url => url !== null);
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload images',
                    error: uploadError.message
                });
            }
        }

        // Create the review
        const reviewData = {
            product: productId,
            buyer: userId,
            order: orderId,
            rating,
            comment,
            images: imageUrls
        };

        const newReview = await Review.create(reviewData);

        // Populate buyer details
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
        const { reviewId } = req.params;
        const userId = req.user._id;

        const review = await Review.findById(reviewId);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user has already liked
        const likeIndex = review.likes.indexOf(userId);
        
        if (likeIndex === -1) {
            // Add like
            review.likes.push(userId);
        } else {
            // Remove like
            review.likes.splice(likeIndex, 1);
        }

        review.likesCount = review.likes.length;
        await review.save();

        res.status(200).json({
            success: true,
            message: likeIndex === -1 ? 'Review liked' : 'Review unliked',
            likesCount: review.likes.length,
            isLiked: likeIndex === -1
        });

    } catch (error) {
        console.error('Toggle like error:', error);
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
        const { productId } = req.params;

        const reviews = await Review.find({ product: productId })
            .populate('buyer', 'firstname lastname')
            .sort({ createdAt: -1 }); // Most recent first

        // Calculate review statistics
        const totalReviews = reviews.length;
        let averageRating = 0;
        const ratingCounts = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        };

        if (totalReviews > 0) {
            const totalRating = reviews.reduce((sum, review) => {
                ratingCounts[review.rating]++;
                return sum + review.rating;
            }, 0);
            averageRating = (totalRating / totalReviews).toFixed(1);
        }

        res.status(200).json({
            success: true,
            reviews,
            stats: {
                totalReviews,
                averageRating,
                ratingCounts
            }
        });

    } catch (error) {
        console.error('Get product reviews error:', error);
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

        // Find the review and check ownership
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
                message: 'You can only delete your own reviews'
            });
        }

        // Delete images from storage if they exist
        if (review.images && review.images.length > 0) {
            try {
                const deletePromises = review.images.map(imageUrl => 
                    deleteFromFirebase(imageUrl)
                );
                await Promise.all(deletePromises);
            } catch (error) {
                console.error('Error deleting images:', error);
            }
        }

        // Delete the review
        await Review.findByIdAndDelete(reviewId);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting review',
            error: error.message
        });
    }
};

export const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment, images } = req.body;
        const userId = req.user._id;

        // Find the review and check ownership
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
                message: 'You can only update your own reviews'
            });
        }

        // Handle image updates if needed
        let imageUrls = review.images; // Keep existing images by default
        if (Array.isArray(images)) {
            // Upload new images if provided
            try {
                const uploadPromises = images.map(async (base64String) => {
                    if (base64String && typeof base64String === 'string' && base64String.startsWith('data:')) {
                        return await uploadToFirebase(base64String);
                    }
                    return base64String; // Keep existing image URLs
                });

                imageUrls = (await Promise.all(uploadPromises)).filter(url => url !== null);
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload images',
                    error: uploadError.message
                });
            }
        }

        // Update the review
        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            {
                rating,
                comment,
                images: imageUrls
            },
            { new: true }
        ).populate('buyer', 'firstname lastname');

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            review: updatedReview
        });

    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating review',
            error: error.message
        });
    }
};

export const checkUserReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        // Match your order route's status check
        const validOrderStatuses = ['delivered', 'completed', 'Delivered', 'Completed'];

        const completedOrder = await Order.findOne({
            buyer: userId,
            'items.product': productId,
            status: { $in: validOrderStatuses }
        });

        console.log('Review eligibility check:', {
            userId,
            productId,
            hasCompletedOrder: !!completedOrder,
            orderStatus: completedOrder?.status,
            orderId: completedOrder?._id
        });

        // Check if user has already reviewed
        const existingReview = await Review.findOne({
            product: productId,
            buyer: userId
        });

        res.status(200).json({
            success: true,
            canReview: !!completedOrder && !existingReview,
            hasReviewed: !!existingReview,
            orderId: completedOrder?._id || null,
            orderStatus: completedOrder?.status
        });

    } catch (error) {
        console.error('Check user review error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking review eligibility',
            error: error.message
        });
    }
};