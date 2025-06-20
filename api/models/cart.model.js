import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    // Buyer reference
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Buyer'
    },

    // Cart items
    items: [{
        // Product reference
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        },

        // Seller reference
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },

        // Quantity
        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        // Unit details
        unitSize: {
            type: Number,
            required: true
        },
        unitType: {
            type: String,
            enum: ['kg', 'g','l','ml', 'piece','thali','pack','dozen','box','packet'],
            required: true
        },

        // Price at the time of adding to cart
        price: {
            type: Number,
            required: true,
            min: 0
        },

        // Subtotal for this item
        subtotal: {
            type: Number,
            required: true,
            min: 0
        }
    }],

    // Cart totals
    subtotal: {
        type: Number,
        required: true,
        default: 0
    },

    total: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
    // Calculate item subtotals
    this.items.forEach(item => {
        item.subtotal = item.price * item.quantity;
    });

    // Calculate cart subtotal
    this.subtotal = this.items.reduce((total, item) => total + item.subtotal, 0);

    // Calculate total (can add tax/shipping later if needed)
    this.total = this.subtotal;

    next();
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart; 