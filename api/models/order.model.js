import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    // Order ID (auto-generated unique identifier)
    orderId: {
        type: String,
        unique: true
    },

    // Buyer who placed the order
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Array of items in the order
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],

    // Order status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },

    // Payment details
    payment: {
        method: {
            type: String,
            enum: ['cod', 'online'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        },
        transactionId: {
            type: String
        }
    },

    // Shipping details
    shippingAddress: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },

    // Order totals
    subtotal: {
        type: Number,
        required: true
    },
    shippingCost: {
        type: Number,
        required: true,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },

    // Timestamps for order tracking
    orderDate: {
        type: Date,
        default: Date.now
    },
    confirmedAt: Date,
    processedAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date
}, {
    timestamps: true
});

// Generate unique order ID before saving
orderSchema.pre('save', async function(next) {
    if (!this.orderId) {
        // Generate order ID: ORD-YYYYMMDD-XXXX
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.orderId = `ORD-${year}${month}${day}-${random}`;
    }

    // Calculate totals
    if (this.isModified('items')) {
        this.subtotal = this.items.reduce((total, item) => total + item.subtotal, 0);
        this.total = this.subtotal + this.shippingCost;  // Removed tax calculation
    }

    // Update timestamps based on status change
    if (this.isModified('status')) {
        switch (this.status) {
            case 'confirmed':
                this.confirmedAt = Date.now();
                break;
            case 'processing':
                this.processedAt = Date.now();
                break;
            case 'shipped':
                this.shippedAt = Date.now();
                break;
            case 'delivered':
                this.deliveredAt = Date.now();
                break;
            case 'cancelled':
                this.cancelledAt = Date.now();
                break;
        }
    }

    next();
});

// Instance method to check if order can be cancelled
orderSchema.methods.canCancel = function() {
    return ['pending', 'confirmed'].includes(this.status);
};

orderSchema.methods.getCancellationMessage = function() {
    switch(this.status) {
        case 'processing':
            return 'Order is being processed by the seller';
        case 'shipped':
            return 'Order has been shipped';
        case 'delivered':
            return 'Order has been delivered';
        case 'cancelled':
            return 'Order is already cancelled';
        default:
            return 'Cannot cancel order at this stage';
    }
};

// Instance method to update status
orderSchema.methods.updateStatus = async function(newStatus) {
    this.status = newStatus;
    return await this.save();
};

const Order = mongoose.model('Order', orderSchema);

export default Order;