import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    agencyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pricePerKg: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    totalValue: {
        type: Number,
        required: true
    },
    originalPricePerKg: {
        type: Number,
        required: true
    },
    acceptOriginalPrice: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    rejectionReason: String,
    acceptedAt: Date,
    rejectedAt: Date
}, {
    timestamps: true
});

export default mongoose.model('Request', requestSchema);