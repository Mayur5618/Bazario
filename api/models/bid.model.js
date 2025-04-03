import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    bidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['active', 'won', 'lost', 'cancelled'],
        default: 'active'
    },
    bidTime: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to ensure unique bid per product and bidder at a specific time
bidSchema.index({ product: 1, bidder: 1, bidTime: 1 });

// Index for quick bid history retrieval
bidSchema.index({ product: 1, bidTime: -1 });

const Bid = mongoose.model('Bid', bidSchema);

export default Bid; 