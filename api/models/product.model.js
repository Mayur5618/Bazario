import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    
    description: { 
        type: String, 
        required: true 
    },
    
    price: { 
        type: Number, 
        required: true 
    },
    
    category: { 
        type: String, 
        required: true 
    },
    
    stock: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    
    platformType: {
        type: [String],  // Changed to array of strings
        required: true,
        enum: ['b2b', 'b2c'],
        validate: {
            validator: function(v) {
                return v.length > 0 && v.length <= 2;
            },
            message: 'At least one platform type must be selected'
        }
    },

    seller: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    
    images: [{ 
        type: String 
    }],

    // B2B specific fields
    minOrderQuantity: {
        type: Number,
        required: function() {
            return this.platformType.includes('b2b');
        },
        min: 1
    },
    maxOrderQuantity: {
        type: Number,
        validate: {
            validator: function(v) {
                if (!v) return true; // Allow null/undefined
                return v > this.minOrderQuantity;
            },
            message: 'Maximum order quantity must be greater than minimum order quantity'
        }
    },

    // B2C specific fields
    unitSize: {
        type: Number,
        required: function() {
            return this.platformType.includes('b2c');
        },
        min: 0
    },
    unitType: {
        type: String,
        enum: ['kg', 'g', 'piece','thali','pack'],
        required: function() {
            return this.platformType.includes('b2c');
        }
    },

    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    
    rating: {
        type: Number,
        default: 0
    },
    
    numReviews: {
        type: Number,
        default: 0
    },

    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});

// Add compound index for name and seller
productSchema.index({ name: 1, seller: 1 }, { 
    unique: true,
    collation: { locale: 'en', strength: 2 } // Case-insensitive
});

// Updated index to handle array of platform types
productSchema.index({ 
    name: 1, 
    seller: 1, 
    'platformType': 1 
}, { 
    unique: true,
    collation: { locale: 'en', strength: 2 }
});

const Product = mongoose.model('Product', productSchema);

export default Product;