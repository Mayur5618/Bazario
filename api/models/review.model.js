import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    // Product reference
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    // Buyer who wrote the review
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Buyer',
        required: true
    },

    // Seller who sold the product
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },

    // Order reference
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

    // Optional images
    images: [{
        type: String
    }],

    // Review status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'reported'],
        default: 'pending'
    },

    // Platform type
    platformType: {
        type: String,
        enum: ['b2b', 'b2c'],
        required: true
    },

    // Seller's response
    sellerResponse: {
        comment: String,
        respondedAt: Date
    },

    // Helpful votes
    helpfulVotes: [{
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Buyer'
        },
        helpful: Boolean,
        votedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Moderation
    moderation: {
        moderatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        moderatedAt: Date,
        reason: String
    },

    // Review verification
    verified: {
        type: Boolean,
        default: false
    },

    // For B2B specific reviews
    businessReview: {
        deliveryRating: {
            type: Number,
            min: 1,
            max: 5
        },
        qualityRating: {
            type: Number,
            min: 1,
            max: 5
        },
        communicationRating: {
            type: Number,
            min: 1,
            max: 5
        },
        valueForMoneyRating: {
            type: Number,
            min: 1,
            max: 5
        }
    }

}, {
    timestamps: true
});

// Compound index to ensure one review per order per buyer
reviewSchema.index({ order: 1, buyer: 1 }, { unique: true });

// Method to calculate average ratings for B2B reviews
reviewSchema.methods.calculateB2BAverage = function() {
    if (this.platformType === 'b2b' && this.businessReview) {
        const { deliveryRating, qualityRating, communicationRating, valueForMoneyRating } = this.businessReview;
        const sum = deliveryRating + qualityRating + communicationRating + valueForMoneyRating;
        return sum / 4;
    }
    return this.rating;
};

// Update product rating after review save
reviewSchema.post('save', async function() {
    const Review = this.constructor;
    const Product = mongoose.model('Product');

    try {
        // Calculate new average rating
        const stats = await Review.aggregate([
            {
                $match: { product: this.product, status: 'approved' }
            },
            {
                $group: {
                    _id: '$product',
                    avgRating: { $avg: '$rating' },
                    numReviews: { $sum: 1 }
                }
            }
        ]);

        // Update product
        if (stats.length > 0) {
            await Product.findByIdAndUpdate(this.product, {
                rating: stats[0].avgRating,
                numReviews: stats[0].numReviews
            });
        } else {
            await Product.findByIdAndUpdate(this.product, {
                rating: 0,
                numReviews: 0
            });
        }
    } catch (error) {
        console.error('Error updating product rating:', error);
    }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;