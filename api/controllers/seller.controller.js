import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import Seller from '../models/seller.model.js';
import Buyer from '../models/buyer.model.js';
import Agency from '../models/agency.model.js';

export const getSellerDashboardStats = async (req, res) => {
    try {
        const sellerId = req.user._id;

        // Get total products count
        const totalProducts = await Product.countDocuments({ seller: sellerId });

        // Get orders statistics
        const orders = await Order.find({
            'items.seller': sellerId
        });

        // Calculate total orders and pending orders
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => 
            ['pending', 'confirmed', 'processing'].includes(order.status)
        ).length;

        // Calculate total revenue
        const revenue = orders.reduce((total, order) => {
            const sellerItems = order.items.filter(item => 
                item.seller.toString() === sellerId.toString()
            );
            const orderTotal = sellerItems.reduce((sum, item) => 
                sum + (item.price * item.quantity), 0
            );
            return total + orderTotal;
        }, 0);

        res.status(200).json({
            success: true,
            stats: {
                totalProducts,
                totalOrders,
                pendingOrders,
                revenue
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const sellerId = req.user._id;

        // Get total products
        const totalProducts = await Product.countDocuments({ seller: sellerId });

        // Get total orders and calculate revenue
        const orders = await Order.find({ 
            'items.seller': sellerId 
        });

        const totalOrders = orders.length;

        // Get pending orders
        const pendingOrders = await Order.countDocuments({ 
            'items.seller': sellerId,
            status: 'pending'
        });

        // Calculate total revenue
        const revenue = orders.reduce((total, order) => {
            const sellerItems = order.items.filter(item => 
                item.seller.toString() === sellerId.toString()
            );
            const orderTotal = sellerItems.reduce((sum, item) => 
                sum + (item.price * item.quantity), 0
            );
            return total + orderTotal;
        }, 0);

        res.status(200).json({
            success: true,
            stats: {
                totalProducts,
                totalOrders,
                pendingOrders,
                revenue
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
};

export const getPendingOrders = async (req, res) => {
    try {
        const sellerId = req.user._id;

        const pendingOrders = await Order.find({ 
            'items.seller': sellerId,
            status: 'pending'
        })
        .populate('buyer', 'firstname lastname email phone')
        .populate('items.product', 'name images price')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            orders: pendingOrders
        });

    } catch (error) {
        console.error('Error fetching pending orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending orders'
        });
    }
};

export const getSellerProducts = async (req, res) => {
    try {
        const sellerId = req.user._id;

        const products = await Product.find({ seller: sellerId })
            .sort({ createdAt: -1 })
            .select('name price stock images createdAt');  // Only select needed fields

        res.status(200).json({
            success: true,
            products
        });

    } catch (error) {
        console.error('Error fetching seller products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching seller products'
        });
    }
};

export const signup = async (req, res) => {
    try {
        console.log('Received signup request:', req.body);

        const {
            firstname, lastname, mobileno, password, address,
            country, state, city, pincode, userType,
            platformType, shopName, businessType, aadharNumber,
            termsAccepted
        } = req.body;

        const mobilenoString = mobileno.toString();

        // Check existing user
        const existingUser = await Promise.any([
            Seller.findOne({ mobileno: mobilenoString }),
            Buyer.findOne({ mobileno: mobilenoString }),
            Agency.findOne({ mobileno: mobilenoString })
        ]).catch(() => null);

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this mobile number'
            });
        }

        // Create complete user data object with ALL required fields
        const userData = {
            firstname,
            lastname,
            mobileno: mobilenoString,
            password,
            address,
            country,
            state,
            city,
            pincode,
            userType: 'seller',
            platformType: platformType || ['b2c'],
            shopName,              // Added this
            businessType,          // Added this
            aadharNumber,         // Added this
            termsAccepted         // Added this
        };

        console.log('Creating new seller with complete data:', userData);

        const user = new Seller(userData);
        await user.save();

        return res.status(201).json({
            success: true,
            message: 'Signup Successful..'
        });

    } catch (error) {
        console.error('Error in signup:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
};
