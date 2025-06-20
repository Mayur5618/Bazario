import mongoose from "mongoose";

// Reply Schema for nested comments
const replySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 500
    },
    userType: {
        type: String,
        enum: ['buyer', 'seller'],
        required: true
    }
}, {
    timestamps: true
});

const reviewSchema = new mongoose.Schema({
    // Product being reviewed
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    // Buyer who wrote the review
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Order reference to verify purchase
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },

    // Review content
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 500
    },

    // Optional review images
    images: [{
        type: String,
        validate: {
            validator: function(v) {
                // Basic URL validation
                return /^https?:\/\/.*/.test(v);
            },
            message: 'Invalid image URL'
        }
    }],

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    likesCount: {
        type: Number,
        default: 0
    },

    // Replies/Comments on the review
    replies: [replySchema],

    // Helpful votes
    helpfulVotes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        helpful: Boolean
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure one review per order per buyer
reviewSchema.index({ order: 1, buyer: 1 }, { unique: true });

// Update product rating after review save
reviewSchema.post('save', async function() {
    const Review = this.constructor;
    const Product = mongoose.model('Product');

    try {
        const stats = await Review.aggregate([
            {
                $match: { product: this.product }
            },
            {
                $group: {
                    _id: '$product',
                    avgRating: { $avg: '$rating' },
                    numReviews: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            await Product.findByIdAndUpdate(this.product, {
                rating: stats[0].avgRating,
                numReviews: stats[0].numReviews
            });
        }
    } catch (error) {
        console.error('Error updating product rating:', error);
    }
});

// Add a method to handle likes
reviewSchema.methods.toggleLike = async function(userId) {
    const isLiked = this.likes.some(like => like.toString() === userId.toString());
    
    if (isLiked) {
        // Remove like
        this.likes = this.likes.filter(like => like.toString() !== userId.toString());
    } else {
        // Add like
        this.likes.push(userId);
    }
    
    this.likesCount = this.likes.length;
    await this.save();
    return !isLiked; // returns true if liked, false if unliked
};

// Add index for faster search
reviewSchema.index({ product: 1, rating: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;