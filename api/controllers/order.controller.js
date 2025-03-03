import Order from '../models/order.model.js';
import Cart from '../models/cart.model.js';


// Create new order from cart
// export const createOrder = async (req, res) => {
//     try {
//         const { shippingAddress, paymentMethod } = req.body;

//         // Get cart items
//         const cart = await Cart.findOne({ buyer: req.user._id })
//             .populate('items.product')
//             .populate('items.seller');

//         if (!cart || cart.items.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Cart is empty'
//             });
//         }

//         // Group cart items by seller
//         const itemsBySeller = {};
//         cart.items.forEach(item => {
//             const sellerId = item.seller._id.toString();
//             if (!itemsBySeller[sellerId]) {
//                 itemsBySeller[sellerId] = [];
//             }
//             itemsBySeller[sellerId].push({
//                 product: item.product._id,
//                 seller: item.seller._id,
//                 quantity: item.quantity,
//                 price: item.price,
//                 subtotal: item.subtotal
//             });
//         });

//         // Create separate orders for each seller
//         const orders = [];
//         for (const sellerId in itemsBySeller) {
//             const sellerItems = itemsBySeller[sellerId];
//             const subtotal = sellerItems.reduce((total, item) => total + item.subtotal, 0);
            
//             const order = await Order.create({
//                 buyer: req.user._id,
//                 items: sellerItems,
//                 payment: {
//                     method: paymentMethod
//                 },
//                 shippingAddress,
//                 subtotal: subtotal,
//                 shippingCost: 50, // Fixed shipping cost per seller
//                 total: subtotal + 50 // subtotal + shipping
//             });

//             // Populate order details
//             await order.populate([
//                 { path: 'buyer', select: 'firstname lastname' },
//                 { path: 'items.product', select: 'name images' },
//                 { path: 'items.seller', select: 'firstname lastname' }
//             ]);

//             orders.push(order);
//         }

//         // Clear cart after orders creation
//         await Cart.findByIdAndDelete(cart._id);

//         res.status(201).json({
//             success: true,
//             message: `Successfully created ${orders.length} orders`,
//             orders
//         });

//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// export const createOrder = async (req, res) => {
//     try {
//         const { shippingAddress, paymentMethod } = req.body;

//         // Get cart items with proper error handling
//         const cart = await Cart.findOne({ buyer: req.user._id })
//             .populate('items.product')
//             .populate('items.seller');

//         if (!cart || cart.items.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Cart is empty'
//             });
//         }

//         // Validate cart items
//         for (const item of cart.items) {
//             if (!item.product || !item.seller) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Invalid cart items'
//                 });
//             }
//         }

//         // Group cart items by seller with error handling
//         const itemsBySeller = {};
//         cart.items.forEach(item => {
//             if (item.seller && item.seller._id) {
//                 const sellerId = item.seller._id.toString();
//                 if (!itemsBySeller[sellerId]) {
//                     itemsBySeller[sellerId] = [];
//                 }
//                 itemsBySeller[sellerId].push({
//                     product: item.product._id,
//                     seller: item.seller._id,
//                     quantity: item.quantity,
//                     price: item.price,
//                     subtotal: item.price * item.quantity
//                 });
//             }
//         });

//         // Create separate orders for each seller
//         const orders = [];
//         for (const sellerId in itemsBySeller) {
//             const sellerItems = itemsBySeller[sellerId];
//             const subtotal = sellerItems.reduce((total, item) => total + item.subtotal, 0);
            
//             try {
//                 const order = await Order.create({
//                     buyer: req.user._id,
//                     items: sellerItems,
//                     payment: {
//                         method: paymentMethod,
//                         status: paymentMethod === 'cod' ? 'pending' : 'processing'
//                     },
//                     shippingAddress: {
//                         street: shippingAddress.street,
//                         city: shippingAddress.city,
//                         state: shippingAddress.state,
//                         pincode: shippingAddress.pincode,
//                         country: shippingAddress.country
//                     },
//                     subtotal: subtotal,
//                     shippingCost: 50, // Fixed shipping cost per seller
//                     total: subtotal + 50, // subtotal + shipping
//                     status: paymentMethod === 'cod' ? 'pending' : 'processing'
//                 });

//                 // Populate order details
//                 await order.populate([
//                     { path: 'buyer', select: 'firstname lastname email' },
//                     { path: 'items.product', select: 'name images price stock' },
//                     { path: 'items.seller', select: 'firstname lastname email' }
//                 ]);

//                 orders.push(order);

//                 // Update product stock
//                 for (const item of sellerItems) {
//                     await Product.findByIdAndUpdate(
//                         item.product,
//                         { $inc: { stock: -item.quantity } }
//                     );
//                 }
//             } catch (error) {
//                 console.error(`Error creating order for seller ${sellerId}:`, error);
//                 throw new Error(`Failed to create order for one of the sellers`);
//             }
//         }

//         // Clear cart after successful orders creation
//         await Cart.findByIdAndDelete(cart._id);

//         // Send success response
//         res.status(201).json({
//             success: true,
//             message: `Successfully created ${orders.length} orders`,
//             orders: orders
//         });

//     } catch (error) {
//         console.error('Order creation error:', error);
//         res.status(500).json({
//             success: false,
//             message: error.message || 'Failed to create orders',
//             error: process.env.NODE_ENV === 'development' ? error.stack : undefined
//         });
//     }
// };

import Product from '../models/product.model.js';

export const createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod } = req.body;
        const buyer = req.user._id;
        console.log('Creating order for buyer:', buyer);
        console.log('Shipping address:', shippingAddress);
        console.log('Payment method:', paymentMethod);
        // Get cart with populated items
        const cart = await Cart.findOne({ buyer })
            .populate('items.product')
            .populate('items.seller');
            console.log('Found cart:', cart);
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Group items by seller
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
                price: item.product.price,
                subtotal: item.quantity * item.product.price
            });
        });

        // Create orders for each seller
        const orders = [];
        for (const sellerId in itemsBySeller) {
            const sellerItems = itemsBySeller[sellerId];
            const subtotal = sellerItems.reduce((total, item) => total + item.subtotal, 0);
            const shippingCost = 0; // Fixed shipping cost

            try {
                // Create order
                const order = new Order({
                    buyer,
                    items: sellerItems,
                    shippingAddress: {
                        fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
                        email: shippingAddress.email,
                        phone: shippingAddress.phone,
                        street: shippingAddress.street,
                        city: shippingAddress.city,
                        state: shippingAddress.state,
                        pincode: shippingAddress.pincode,
                        country: shippingAddress.country
                    },
                    payment: {
                        method: paymentMethod,
                        status: paymentMethod === 'COD' ? 'pending' : 'processing'
                    },
                    subtotal,
                    shippingCost,
                    total: subtotal + shippingCost,
                    status: 'pending'
                });

                // Save order
                await order.save();

                // Update product stock
                for (const item of sellerItems) {
                    await Product.findByIdAndUpdate(
                        item.product,
                        { $inc: { stock: -item.quantity } }
                    );
                }

                // Populate order details
                await order.populate([
                    { path: 'buyer', select: 'firstname lastname email' },
                    { path: 'items.product', select: 'name images price' },
                    { path: 'items.seller', select: 'firstname lastname email' }
                ]);

                orders.push(order);
            } catch (error) {
                console.error('Error creating order:', error);
                // Rollback any created orders and stock updates
                for (const createdOrder of orders) {
                    await Order.findByIdAndDelete(createdOrder._id);
                    for (const item of createdOrder.items) {
                        await Product.findByIdAndUpdate(
                            item.product,
                            { $inc: { stock: item.quantity } }
                        );
                    }
                }
                throw new Error('Failed to create order');
            }
        }

        // Clear cart after successful order creation
        await Cart.findByIdAndDelete(cart._id);

        res.status(201).json({
            success: true,
            message: `Successfully created ${orders.length} orders`,
            orders
        });

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create order'
        });
    }
};

// Get all orders for a buyer- get also all order but with basic order list
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id })
            .populate('items.product', 'name images price')
            .populate('items.seller', 'firstname lastname')
            .sort({ 
                status: 1, // 1 means completed will be last
                createdAt: 1 // oldest first within same status
            });

        res.json({
            success: true,
            orders
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching orders'
        });
    }
};

// Get single order details - buyer and seller
export const getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findOne({ 
            _id: req.params.id
            // buyer: req.user._id 
        })
        .populate('items.product', 'name images price')
        .populate('items.seller', 'firstname lastname');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching order details'
        });
    }
};

// Cancel order
// export const cancelOrder = async (req, res) => {
//     try {
//         const order = await Order.findOne({ 
//             _id: req.params._id,
//             buyer: req.user._id 
//         }).populate('items.seller', 'firstname lastname mobileno');

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Order not found'
//             });
//         }

//         // Check if order can be cancelled
//         if (!order.canCancel()) {
//             // Get seller contact details
//             const sellerContacts = order.items.map(item => ({
//                 name: `${item.seller.firstname} ${item.seller.lastname}`,
//                 contact: item.seller.mobileno
//             }));

//             return res.status(400).json({
//                 success: false,
//                 message: 'Order cannot be cancelled automatically at this stage',
//                 reason: order.getCancellationMessage(),
//                 currentStatus: order.status,
//                 orderDetails: {
//                     orderId: order.orderId,
//                     orderDate: order.orderDate,
//                     total: order.total
//                 },
//                 cancellationOptions: {
//                     customerService: {
//                         phone: "1800-XXX-XXXX",
//                         email: "support@yourstore.com",
//                         workingHours: "9 AM - 6 PM",
//                         whatsapp: "+91-XXXXXXXXXX"
//                     },
//                     sellers: sellerContacts
//                 },
//                 nextSteps: [
//                     "Contact our customer service",
//                     "Reach out to the seller directly",
//                     "Request for return after delivery"
//                 ]
//             });
//         }

//         // If order can be cancelled
//         await order.updateStatus('cancelled');

//         // Send cancellation confirmation
//         res.json({
//             success: true,
//             message: 'Order cancelled successfully',
//             cancellationDetails: {
//                 orderId: order.orderId,
//                 cancelledAt: new Date(),
//                 refundStatus: order.payment.method === 'online' ? 'processing' : 'not-applicable',
//                 refundNote: order.payment.method === 'online' 
//                     ? 'Refund will be processed in 5-7 working days'
//                     : 'No refund needed for COD orders'
//             }
//         });

//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: error.message
//         });
//     }
// };
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ 
            _id: req.params.id,  // Changed from orderId to _id
            buyer: req.user._id 
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order can be cancelled (only pending or processing orders)
        if (order.status !== 'pending' && order.status !== 'processing') {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage',
                currentStatus: order.status
            });
        }

        // Update order status to cancelled
        order.status = 'cancelled';
        await order.save();

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get seller orders
// export const getSellerOrders = async (req, res) => {
//     try {
//         const orders = await Order.find({ 
//             'items.seller': req.user._id 
//         })
//         .populate('buyer', 'firstname lastname')
//         .populate('items.product', 'name images')
//         .sort('-createdAt');

//         res.json({
//             success: true,
//             orders
//         });

//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

export const getSellerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ 
            'items.seller': req.user._id 
        })
        .populate('buyer', 'firstname lastname')
        .populate('items.product', 'name images price')
        .sort('-createdAt');

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update order status (for sellers)
// export const updateOrderStatus = async (req, res) => {
//     try {
//         const { status } = req.body;
//         const order = await Order.findOne({ 
//             orderId: req.params.orderId,
//             'items.seller': req.user._id 
//         });

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Order not found'
//             });
//         }

//         await order.updateStatus(status);

//         res.json({
//             success: true,
//             message: 'Order status updated successfully',
//             order
//         });

//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.status = status;
        
        // Set delivery date when order is completed
        if (status === 'completed') {
            order.deliveryDate = new Date();
        }

        await order.save();

        res.json({
            success: true,
            message: 'Order status updated successfully',
            order
        });

    } catch (error) {
        console.error('Error in updateOrderStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status'
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

// Get customer order history
export const getCustomerOrderHistory = async (req, res) => {
    try {
        const customerId = req.params.id;
        const sellerId = req.user._id; // Get current seller's ID

        // Get all orders for this customer from current seller only
        const orders = await Order.find({ 
            buyer: customerId,
            'items.seller': sellerId // Filter by seller ID in items array
        })
        .populate('items.product')
        .sort({ createdAt: -1 });

        // Calculate statistics for orders from this seller only
        const totalOrders = orders.length;
        const successfulDeliveries = orders.filter(order => 
            order.status.toLowerCase() === 'delivered' || 
            order.status.toLowerCase() === 'completed'
        ).length;
        const totalSpent = orders.reduce((total, order) => total + order.total, 0);
        const firstOrderDate = orders.length > 0 ? orders[orders.length - 1].createdAt : null;

        // Get repeated products (only for current seller's products)
        const productPurchases = new Map();
        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.seller.toString() === sellerId.toString()) {
                    const productId = item.product._id.toString();
                    if (!productPurchases.has(productId)) {
                        productPurchases.set(productId, {
                            productId,
                            name: item.product.name,
                            image: item.product.images[0],
                            totalPurchased: 0,
                            lastPurchased: null,
                            status: order.status
                        });
                    }
                    const product = productPurchases.get(productId);
                    product.totalPurchased += item.quantity;
                    if (!product.lastPurchased || new Date(order.createdAt) > new Date(product.lastPurchased)) {
                        product.lastPurchased = order.createdAt;
                        product.status = order.status;
                    }
                }
            });
        });

        // Convert to array and filter products purchased more than once
        const repeatedProducts = Array.from(productPurchases.values())
            .filter(product => product.totalPurchased > 1)
            .sort((a, b) => new Date(b.lastPurchased) - new Date(a.lastPurchased));

        res.json({
            success: true,
            customerSummary: {
                totalOrders,
                successfulDeliveries,
                totalSpent,
                firstOrderDate,
                loyaltyStatus: totalOrders > 5 ? 'नियमित ग्राहक' : 'नया ग्राहक'
            },
            repeatedProducts,
            recentOrders: orders.slice(0, 5).map(order => ({
                orderId: order._id,
                date: order.createdAt,
                status: order.status,
                total: order.total,
                items: order.items.filter(item => item.seller.toString() === sellerId.toString())
            }))
        });

    } catch (error) {
        console.error('Error fetching customer history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customer history'
        });
    }
};