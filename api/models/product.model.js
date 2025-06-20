import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String
    },
    price: { 
        type: Number, 
        required: true,
        min: 0 
    },
    category: { 
        type: String, 
        required: true 
    },
    subcategory: {
        type: String,
        required: true
    },
    stock: { 
        type: Number, 
        required: true,
        min: 0 
    },
    images: [{ 
        type: String,
        required: true 
    }],
    tags: [{ 
        type: String 
    }],
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'seller',
        required: true
    },
    platformType: {
        type: [String],
        enum: ['b2b', 'b2c'],
        required: true,
        validate: {
            validator: function(v) {
                return v.length > 0;
            },
            message: 'At least one platform type must be selected'
        }
    },
    // B2C specific fields
    unitSize: {
        type: Number,
        required: function() {
            return this.platformType.includes('b2c');
        }
    },
    unitType: {
        type: String,
        enum: ['kg', 'g', 'piece', 'thali', 'pack'],
        required: function() {
            return this.platformType.includes('b2c');
        }
    },
    // B2B specific fields
    auctionEndDate: {
        type: Date,
        required: function() {
            return this.platformType.includes('b2b');
        },
        select: function() {
            return this.platformType.includes('b2b');
        }
    },
    minPrice: {
        type: Number,
        required: function() {
            return this.platformType.includes('b2b');
        },
        select: function() {
            return this.platformType.includes('b2b');
        }
    },
    maxPrice: {
        type: Number,
        required: function() {
            return this.platformType.includes('b2b');
        },
        select: function() {
            return this.platformType.includes('b2b');
        }
    },
    unitPrice: {
        type: Number,
        required: function() {
            return this.platformType.includes('b2b');
        },
        select: function() {
            return this.platformType.includes('b2b');
        }
    },
    negotiationEnabled: {
        type: Boolean,
        select: function() {
            return this.platformType.includes('b2b');
        }
    },
    currentHighestBid: {
        type: Number,
        select: function() {
            return this.platformType.includes('b2b');
        }
    },
    currentHighestBidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'agency',
        select: function() {
            return this.platformType.includes('b2b');
        }
    },
    auctionStatus: {
        type: String,
        enum: ['active', 'ended', 'cancelled'],
        select: function() {
            return this.platformType.includes('b2b');
        }
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    youtubeLink: {
        type: String,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(v);
            },
            message: 'Invalid YouTube URL'
        }
    },
    // Location fields for city-based filtering
    availableLocations: [{
        type: String,
        required: true
    }],
    // Default location (seller's primary city)
    primaryLocation: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Add compound index for name and seller
productSchema.index({ name: 1, seller: 1 }, { 
    unique: true,
    collation: { locale: 'en', strength: 2 } // Case-insensitive
});

// Index for platform types
productSchema.index({ 
    name: 1, 
    seller: 1, 
    'platformType': 1 
}, { 
    unique: true,
    collation: { locale: 'en', strength: 2 }
});

// Pre-save middleware to update auction status
productSchema.pre('save', function(next) {
    // Only check auction status for B2B products
    if (this.platformType.includes('b2b') && this.auctionEndDate) {
        const now = new Date();
        const endDate = new Date(this.auctionEndDate);
        
        // If auction end date has passed and status is still active
        if (endDate <= now && this.auctionStatus === 'active') {
            this.auctionStatus = 'ended';
            
            // If there's a highest bidder, record them as winner
            if (this.currentHighestBidder && this.currentHighestBid > 0) {
                console.log('Auction ended with winner:', {
                    bidder: this.currentHighestBidder,
                    amount: this.currentHighestBid
                });
            } else {
                console.log('Auction ended without any bids');
            }
        }
    }
    next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;