import Order from '../models/order.model.js';
import Cart from '../models/cart.model.js';

// Create new order from cart
export const createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod } = req.body;

        // Get cart items
        const cart = await Cart.findOne({ buyer: req.user._id })
            .populate('items.product')
            .populate('items.seller');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Group cart items by seller
        const itemsBySeller = {};
        cart.items.forEach(item => {
            const sellerId = item.seller._id.toString();
            if (!itemsBySeller[sellerId]) {
                itemsBySeller[sellerId] = [];
            }
            itemsBySeller[sellerId].push({
                product: item.product._id,
                seller: item.seller._id,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal
            });
        });

        // Create separate orders for each seller
        const orders = [];
        for (const sellerId in itemsBySeller) {
            const sellerItems = itemsBySeller[sellerId];
            const subtotal = sellerItems.reduce((total, item) => total + item.subtotal, 0);
            
            const order = await Order.create({
                buyer: req.user._id,
                items: sellerItems,
                payment: {
                    method: paymentMethod
                },
                shippingAddress,
                subtotal: subtotal,
                shippingCost: 50, // Fixed shipping cost per seller
                total: subtotal + 50 // subtotal + shipping
            });

            // Populate order details
            await order.populate([
                { path: 'buyer', select: 'firstname lastname' },
                { path: 'items.product', select: 'name images' },
                { path: 'items.seller', select: 'firstname lastname' }
            ]);

            orders.push(order);
        }

        // Clear cart after orders creation
        await Cart.findByIdAndDelete(cart._id);

        res.status(201).json({
            success: true,
            message: `Successfully created ${orders.length} orders`,
            orders
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all orders for a buyer- get also all order but with basic order list
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id })
            .populate('items.product', 'name images')
            .populate('items.seller', 'firstname lastname')
            .sort('-createdAt');

        res.json({
            success: true,
            orders
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get single order details - buyer and seller
export const getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findOne({ 
            orderId: req.params.orderId,
            buyer: req.user._id 
        })
        .populate('items.product', 'name images')
        .populate('items.seller', 'firstname lastname');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            order
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Cancel order
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ 
            orderId: req.params.orderId,
            buyer: req.user._id 
        }).populate('items.seller', 'firstname lastname mobileno');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order can be cancelled
        if (!order.canCancel()) {
            // Get seller contact details
            const sellerContacts = order.items.map(item => ({
                name: `${item.seller.firstname} ${item.seller.lastname}`,
                contact: item.seller.mobileno
            }));

            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled automatically at this stage',
                reason: order.getCancellationMessage(),
                currentStatus: order.status,
                orderDetails: {
                    orderId: order.orderId,
                    orderDate: order.orderDate,
                    total: order.total
                },
                cancellationOptions: {
                    customerService: {
                        phone: "1800-XXX-XXXX",
                        email: "support@yourstore.com",
                        workingHours: "9 AM - 6 PM",
                        whatsapp: "+91-XXXXXXXXXX"
                    },
                    sellers: sellerContacts
                },
                nextSteps: [
                    "Contact our customer service",
                    "Reach out to the seller directly",
                    "Request for return after delivery"
                ]
            });
        }

        // If order can be cancelled
        await order.updateStatus('cancelled');

        // Send cancellation confirmation
        res.json({
            success: true,
            message: 'Order cancelled successfully',
            cancellationDetails: {
                orderId: order.orderId,
                cancelledAt: new Date(),
                refundStatus: order.payment.method === 'online' ? 'processing' : 'not-applicable',
                refundNote: order.payment.method === 'online' 
                    ? 'Refund will be processed in 5-7 working days'
                    : 'No refund needed for COD orders'
            }
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get seller orders
export const getSellerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ 
            'items.seller': req.user._id 
        })
        .populate('buyer', 'firstname lastname')
        .populate('items.product', 'name images')
        .sort('-createdAt');

        res.json({
            success: true,
            orders
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update order status (for sellers)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findOne({ 
            orderId: req.params.orderId,
            'items.seller': req.user._id 
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        await order.updateStatus(status);

        res.json({
            success: true,
            message: 'Order status updated successfully',
            order
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all orders with full details for a buyer
export const getBuyerOrdersWithDetails = async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id })
            .populate('items.product', 'name images price') // Product details
            .populate('items.seller', 'firstname lastname mobileno') // Seller details
            .sort('-createdAt'); // Latest orders first

        // If no orders found
        if (orders.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No orders found",
                orders: []
            });
        }

        // Format the response
        const formattedOrders = orders.map(order => ({
            orderId: order.orderId,
            orderDate: order.orderDate,
            status: order.status,
            items: order.items.map(item => ({
                product: {
                    name: item.product.name,
                    images: item.product.images,
                    price: item.product.price
                },
                seller: {
                    name: `${item.seller.firstname} ${item.seller.lastname}`,
                    contact: item.seller.mobileno
                },
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal
            })),
            payment: {
                method: order.payment.method,
                status: order.payment.status,
                transactionId: order.payment.transactionId
            },
            shippingAddress: {
                street: order.shippingAddress.street,
                city: order.shippingAddress.city,
                state: order.shippingAddress.state,
                pincode: order.shippingAddress.pincode,
                country: order.shippingAddress.country
            },
            subtotal: order.subtotal,
            shippingCost: order.shippingCost,
            total: order.total,
            statusTimeline: {
                ordered: order.orderDate,
                confirmed: order.confirmedAt,
                processing: order.processedAt,
                shipped: order.shippedAt,
                delivered: order.deliveredAt,
                cancelled: order.cancelledAt
            }
        }));

        res.json({
            success: true,
            count: orders.length,
            orders: formattedOrders
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};