import Review from '../models/review.model.js';
import Order from '../models/order.model.js';
import { uploadToFirebase, deleteFromFirebase } from '../utilities/firebase.js';
import Product from '../models/product.model.js';

export const createReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment, orderId, images } = req.body;
        const userId = req.user._id;

        console.log('Review creation attempt:', {
            productId,
            userId,
            orderId,
            rating,
            hasComment: !!comment,
            hasImages: !!images,
            imagesCount: images?.length
        });

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        // Check if the order exists and is completed/delivered
        const order = await Order.findOne({
            _id: orderId,
            buyer: userId,
            'items.product': productId,
            status: { 
                $regex: new RegExp('^(delivered|completed)$', 'i') 
            }
        });

        console.log('Found order:', order ? {
            id: order._id,
            status: order.status,
            buyer: order.buyer.toString(),
            userId: userId.toString(),
            hasProduct: order.items.some(item => item.product.toString() === productId)
        } : 'No order found');

        if (!order) {
            return res.status(400).json({
                success: false,
                message: 'You can only review products from completed or delivered orders'
            });
        }

        // Verify the order belongs to the user
        if (order.buyer.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'This order does not belong to you'
            });
        }

        // Check if user has already reviewed this product for this order
        const existingReview = await Review.findOne({
            product: productId,
            buyer: userId,
            order: orderId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product for this order'
            });
        }

        // Process and upload images if provided
        let imageUrls = [];
        if (images && Array.isArray(images)) {
            try {
                const uploadPromises = images.map(async (base64String) => {
                    if (base64String && typeof base64String === 'string' && base64String.startsWith('data:')) {
                        return await uploadToFirebase(base64String);
                    }
                    return null;
                });

                imageUrls = (await Promise.all(uploadPromises)).filter(url => url !== null);
                console.log('Uploaded image URLs:', imageUrls);
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
            rating: parseInt(rating),
            comment,
            images: imageUrls
        };

        console.log('Creating review with data:', {
            ...reviewData,
            imagesCount: imageUrls.length
        });

        const newReview = await Review.create(reviewData);
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
        const sellerId = req.user._id;

        // Validate comment
        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'जवाब लिखना ज़रूरी है'
            });
        }

        const review = await Review.findById(reviewId)
            .populate('product', 'seller');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'रिव्यू नहीं मिला'
            });
        }

        // Check if the seller owns the product being reviewed
        if (review.product.seller.toString() !== sellerId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'आप इस रिव्यू का जवाब नहीं दे सकते'
            });
        }

        // Add the reply
        review.replies.push({
            user: sellerId,
            comment: comment,
            userType: 'seller'
        });

        await review.save();

        // Populate the updated review with necessary fields
        const updatedReview = await Review.findById(reviewId)
            .populate('buyer', 'firstname lastname profileImage')
            .populate('product', 'name images')
            .populate('replies.user', 'firstname lastname shopName');

        res.status(200).json({
            success: true,
            message: 'जवाब सफलतापूर्वक जोड़ा गया',
            review: updatedReview
        });

    } catch (error) {
        console.error('Error in addReplyToReview:', error);
        res.status(500).json({
            success: false,
            message: 'जवाब देने में समस्या हुई',
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

export const toggleLike = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;

        // Find the review
        const review = await Review.findById(reviewId);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Initialize likes array if it doesn't exist
        if (!review.likes) {
            review.likes = [];
        }

        // Check if user has already liked this review
        const hasLiked = review.likes.includes(userId);

        if (hasLiked) {
            // User already liked, so unlike
            review.likes = review.likes.filter(id => id.toString() !== userId.toString());
            review.likesCount = review.likes.length;
            await review.save();

            return res.status(200).json({
                success: true,
                message: 'Review unliked successfully',
                isLiked: false,
                likesCount: review.likes.length,
                likes: review.likes
            });
        } else {
            // User hasn't liked, so add like
            review.likes.push(userId);
            review.likesCount = review.likes.length;
            await review.save();

            return res.status(200).json({
                success: true,
                message: 'Review liked successfully',
                isLiked: true,
                likesCount: review.likes.length,
                likes: review.likes
            });
        }
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
            .populate('buyer', 'firstname lastname profileImage')
            .populate('replies.user', 'firstname lastname profileImage shopName')
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

        console.log('Update review attempt:', {
            reviewId,
            userId,
            rating,
            hasComment: !!comment,
            hasImages: !!images
        });

        // Find the review and check ownership
        const review = await Review.findById(reviewId);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        console.log('Found review:', {
            reviewId: review._id,
            currentRating: review.rating,
            currentComment: review.comment,
            reviewOwner: review.buyer.toString(),
            requestUser: userId.toString()
        });

        if (review.buyer.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own reviews'
            });
        }

        // Validate the data
        if (rating === undefined || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Rating and comment are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Prepare update data
        const updateData = {
            rating: parseInt(rating),
            comment: comment.trim(),
            updatedAt: Date.now()
        };

        // Only update images if new ones are provided
        if (images) {
            updateData.images = images;
        }

        console.log('Updating review with data:', updateData);

        // Update the review using findOneAndUpdate for atomic operation
        const updatedReview = await Review.findOneAndUpdate(
            { _id: reviewId, buyer: userId },
            updateData,
            { 
                new: true,
                runValidators: true 
            }
        ).populate('buyer', 'firstname lastname');

        if (!updatedReview) {
            return res.status(404).json({
                success: false,
                message: 'Review not found or unauthorized'
            });
        }

        console.log('Review updated successfully:', {
            reviewId: updatedReview._id,
            newRating: updatedReview.rating,
            newComment: updatedReview.comment
        });

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

        console.log('Checking review eligibility:', {
            productId,
            userId
        });

        // First check if user has already reviewed this product
        const existingReview = await Review.findOne({
            product: productId,
            buyer: userId
        });

        console.log('Existing review check:', {
            hasReview: !!existingReview,
            reviewId: existingReview?._id
        });

        if (existingReview) {
            return res.status(200).json({
                success: true,
                canReview: false,
                hasReviewed: true,
                orderId: existingReview.order
            });
        }

        // Find all completed/delivered orders containing this product
        const orders = await Order.find({
            buyer: userId,
            'items.product': productId,
            status: { 
                $in: ['delivered', 'completed', 'Delivered', 'Completed']
            }
        }).sort({ createdAt: -1 }); // Get most recent order first

        console.log('Found orders:', {
            count: orders.length,
            orders: orders.map(order => ({
                orderId: order._id,
                status: order.status,
                items: order.items.map(item => ({
                    product: item.product.toString(),
                    matches: item.product.toString() === productId
                }))
            }))
        });

        // Get the most recent eligible order
        const eligibleOrder = orders[0];

        // Double check if the product exists in the order
        const productInOrder = eligibleOrder?.items.some(item => 
            item.product.toString() === productId
        );

        console.log('Order eligibility:', {
            hasEligibleOrder: !!eligibleOrder,
            orderStatus: eligibleOrder?.status,
            productInOrder,
            orderId: eligibleOrder?._id
        });

        if (!eligibleOrder || !productInOrder) {
            return res.status(200).json({
                success: true,
                canReview: false,
                hasReviewed: false,
                message: 'No eligible orders found for this product',
                orderId: null
            });
        }

        res.status(200).json({
            success: true,
            canReview: true,
            hasReviewed: false,
            orderId: eligibleOrder._id,
            orderStatus: eligibleOrder.status
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

// Get all reviews for seller's products with search and filters
export const getSellerReviews = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const { 
            search,         // Search by product name
            rating,         // Filter by rating (1-5)
            hasImages,      // Filter reviews with images
            page = 1,
            limit = 10 
        } = req.query;

        // Get seller's products
        const products = await Product.find({ seller: sellerId });
        const productIds = products.map(p => p._id);

        // Build query
        let query = { product: { $in: productIds } };

        // Add rating filter if provided and valid
        if (rating && !isNaN(parseInt(rating)) && parseInt(rating) >= 1 && parseInt(rating) <= 5) {
            query.rating = parseInt(rating);
        }

        // Add image filter if provided
        if (hasImages === 'true') {
            query.images = { $exists: true, $ne: [] };
        }

        // If search term provided, find products matching the name
        if (search) {
            const matchingProducts = await Product.find({
                seller: sellerId,
                name: { $regex: search, $options: 'i' }
            });
            query.product = { $in: matchingProducts.map(p => p._id) };
        }

        // Get total count for pagination
        const total = await Review.countDocuments(query);

        // Get reviews with pagination
        const reviews = await Review.find(query)
            .populate('product', 'name images')
            .populate('buyer', 'firstname lastname')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // Calculate rating statistics
        const stats = await Review.aggregate([
            { $match: { product: { $in: productIds } } },
            { 
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format stats
        const ratingStats = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };
        stats.forEach(stat => {
            ratingStats[stat._id] = stat.count;
        });

        res.status(200).json({
            success: true,
            reviews,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page: parseInt(page),
                limit: parseInt(limit)
            },
            stats: ratingStats
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews'
        });
    }
};