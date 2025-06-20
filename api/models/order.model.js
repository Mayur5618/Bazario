import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
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
            enum: ['COD', 'online'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'completed', 'Delivered'], // Include both cases
            default: 'pending'
        },
        // transactionId: {
        //     type: String
        // }
    },

    // Shipping details
    shippingAddress: {
        fullName: String,
        email: String,
        phone: String,
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

    // Billing address (if different from shipping)
    billingAddress: {
        fullName: String,
        email: String,
        phone: String,
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: String,
        sameAsShipping: {
            type: Boolean,
            default: true
        }
    },

    // Additional order details
    estimatedDeliveryDate: {
        type: Date
    },
    deliveryInstructions: String,
    orderNotes: String,
    giftWrapping: {
        required: {
            type: Boolean,
            default: false
        },
        message: String
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
    cancelledAt: Date,
    cancellationReason: {
        type: String,
        required: function() {
            return this.status === 'cancelled';
        }
    },
    deliveryDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Generate formatted Order ID
orderSchema.pre('save', async function(next) {
    if (!this.orderId) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // Get count of orders for today to generate sequence
        const todayStart = new Date(date.setHours(0, 0, 0, 0));
        const todayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const count = await this.constructor.countDocuments({
            createdAt: {
                $gte: todayStart,
                $lte: todayEnd
            }
        });

        // Generate sequence number
        const sequence = String(count + 1).padStart(4, '0');
        
        // Format: ORD-YYYYMMDD-SEQUENCE
        this.orderId = `ORD-${year}${month}${day}-${sequence}`;
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