import Order from '../models/order.model.js';
import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';


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

export const createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod } = req.body;
        const buyer = req.user._id;
        
        console.log('Creating order with data:', {
            buyer,
            shippingAddress,
            paymentMethod
        });

        // Validate required fields
        if (!shippingAddress || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Shipping address and payment method are required'
            });
        }

        // Get cart with populated items
        const cart = await Cart.findOne({ buyer })
            .populate('items.product')
            .populate('items.seller');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Group items by seller
        const itemsBySeller = {};
        cart.items.forEach(item => {
            if (!item.seller || !item.seller._id) {
                throw new Error('Invalid seller information in cart');
            }
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
                // Format shipping address based on platform
                const formattedAddress = {
                    fullName: shippingAddress.firstName 
                        ? `${shippingAddress.firstName} ${shippingAddress.lastName}`
                        : shippingAddress.fullName,
                    email: shippingAddress.email,
                    phone: shippingAddress.phone,
                    street: shippingAddress.street,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    pincode: shippingAddress.pincode,
                    country: shippingAddress.country || 'India'
                };

                // Create order
                const order = new Order({
                    buyer,
                    items: sellerItems,
                    shippingAddress: formattedAddress,
                    payment: {
                        method: paymentMethod.toUpperCase(),
                        status: paymentMethod.toUpperCase() === 'COD' ? 'pending' : 'processing'
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
                throw new Error('Failed to create order: ' + error.message);
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
        const { reason, cancellationReason } = req.body;
        const finalReason = reason || cancellationReason;

        if (!finalReason) {
            return res.status(400).json({
                success: false,
                message: 'Cancellation reason is required'
            });
        }

        const order = await Order.findOne({ 
            _id: req.params.id,
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
        order.cancellationReason = finalReason;
        order.cancelledAt = new Date();
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

// Get seller order statistics
export const getSellerOrderStats = async (req, res) => {
    try {
        const sellerId = req.user._id;
        
        // Get current month's start and end dates
        const currentDate = new Date();
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        // Get last month's start and end dates
        const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

        // Get orders for current month
        const currentMonthOrders = await Order.find({
            'items.seller': sellerId,
            status: { $in: ['pending', 'completed', 'delivered'] },
            createdAt: { 
                $gte: monthStart,
                $lte: monthEnd
            }
        });

        // Get orders for last month
        const lastMonthOrders = await Order.find({
            'items.seller': sellerId,
            status: { $in: ['pending', 'completed', 'delivered'] },
            createdAt: { 
                $gte: lastMonthStart,
                $lte: lastMonthEnd
            }
        });

        // Calculate weekly data for current month
        const currentMonthWeeklyData = [0, 0, 0, 0]; // 4 weeks
        currentMonthOrders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const weekNumber = Math.floor((orderDate.getDate() - 1) / 7);
            if (weekNumber < 4) {
                currentMonthWeeklyData[weekNumber]++;
            }
        });

        // Calculate weekly data for last month
        const lastMonthWeeklyData = [0, 0, 0, 0]; // 4 weeks
        lastMonthOrders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const weekNumber = Math.floor((orderDate.getDate() - 1) / 7);
            if (weekNumber < 4) {
                lastMonthWeeklyData[weekNumber]++;
            }
        });

        // Get orders for last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const orders = await Order.find({
            'items.seller': sellerId,
            status: { $in: ['pending', 'completed', 'delivered'] },
            createdAt: { $gte: sixMonthsAgo }
        });

        // Calculate statistics
        const stats = {
            totalOrders: orders.length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            completedOrders: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
            cancelledOrders: 0,
            totalRevenue: orders.reduce((total, order) => {
                const sellerItems = order.items.filter(item => 
                    item.seller.toString() === sellerId.toString()
                );
                return total + sellerItems.reduce((sum, item) => sum + item.subtotal, 0);
            }, 0),
            monthlyData: [],
            currentMonthWeeklyData,
            lastMonthWeeklyData
        };

        // Get monthly data for last 6 months
        for (let i = 0; i < 6; i++) {
            const monthStart = new Date();
            monthStart.setMonth(monthStart.getMonth() - i);
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);

            const monthEnd = new Date(monthStart);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            monthEnd.setDate(0);
            monthEnd.setHours(23, 59, 59, 999);

            const monthlyOrders = orders.filter(order => 
                order.createdAt >= monthStart && order.createdAt <= monthEnd
            );

            stats.monthlyData.unshift({
                month: monthStart.toLocaleString('default', { month: 'short' }),
                year: monthStart.getFullYear(),
                totalOrders: monthlyOrders.length,
                revenue: monthlyOrders.reduce((total, order) => {
                    const sellerItems = order.items.filter(item => 
                        item.seller.toString() === sellerId.toString()
                    );
                    return total + sellerItems.reduce((sum, item) => sum + item.subtotal, 0);
                }, 0),
                ordersByStatus: {
                    pending: monthlyOrders.filter(o => o.status === 'pending').length,
                    completed: monthlyOrders.filter(o => o.status === 'completed' || o.status === 'delivered').length
                }
            });
        }

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Error fetching order stats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching order statistics'
        });
    }
};

// Create direct order (Shop Now)
export const createDirectOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, items } = req.body;
        const buyer = req.user._id;

        // Validate required fields
        if (!shippingAddress || !paymentMethod || !items || !Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request data'
            });
        }

        // Validate and get product details
        const orderItems = [];
        for (const item of items) {
            const product = await Product.findById(item.product._id)
                .populate('seller', 'firstname lastname email shopName');
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product._id}`
                });
            }

            // Check stock
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} is out of stock`
                });
            }

            orderItems.push({
                product: product._id,
                seller: product.seller._id,
                quantity: item.quantity,
                price: product.price,
                subtotal: product.price * item.quantity
            });

            // Update product stock
            await Product.findByIdAndUpdate(
                product._id,
                { $inc: { stock: -item.quantity } }
            );
        }

        // Calculate totals
        const subtotal = orderItems.reduce((total, item) => total + item.subtotal, 0);
        const shippingCost = 0; // Free shipping for direct orders
        const total = subtotal + shippingCost;

        // Create order
        const order = new Order({
            buyer,
            items: orderItems,
            payment: {
                method: paymentMethod.toUpperCase(),
                status: paymentMethod.toUpperCase() === 'COD' ? 'pending' : 'processing'
            },
            shippingAddress: {
                fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
                email: shippingAddress.email,
                phone: shippingAddress.phone,
                street: shippingAddress.street,
                city: shippingAddress.city,
                state: shippingAddress.state,
                pincode: shippingAddress.pincode,
                country: shippingAddress.country || 'India'
            },
            subtotal,
            shippingCost,
            total,
            status: 'pending'
        });

        await order.save();

        // Populate order details
        await order.populate([
            { path: 'buyer', select: 'firstname lastname email' },
            { path: 'items.product', select: 'name images price' },
            { path: 'items.seller', select: 'firstname lastname email shopName' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order
        });

    } catch (error) {
        console.error('Direct order creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create order'
        });
    }
};