import mongoose from 'mongoose';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import Seller from '../models/seller.model.js';
import Buyer from '../models/buyer.model.js';
import Agency from '../models/agency.model.js';
import { getCoordinatesFromAddress } from '../utils/geocoding.js';
import Review from '../models/review.model.js';
import jwt from 'jsonwebtoken';

export const getDashboardStats = async (req, res) => {
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
            // Only include revenue from completed orders
            if (order.status === 'completed' || order.status === 'delivered') {
                const sellerItems = order.items.filter(item => 
                    item.seller.toString() === sellerId.toString()
                );
                const orderTotal = sellerItems.reduce((sum, item) => 
                    sum + (item.price * item.quantity), 0
                );
                return total + orderTotal;
            }
            return total;
        }, 0);

        // Calculate seller's average rating
        const products = await Product.find({ seller: sellerId });
        let totalRating = 0;
        let totalReviews = 0;

        products.forEach(product => {
            // Add rating (even if it's 0)
            totalRating += product.rating || 0;
            
            // Count total reviews
            if (product.numReviews) {
                totalReviews += product.numReviews;
            }
        });

        // Calculate average rating considering all products
        const sellerRating = products.length > 0 ? Number(totalRating / products.length).toFixed(1) : 'New';

        res.status(200).json({
            success: true,
            stats: {
                totalProducts,
                totalOrders,
                pendingOrders,
                revenue,
                sellerRating,
                totalReviews
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
        const sellerId = req.params.sellerId || req.user._id;
        const { sort = '-createdAt', limit, platformType } = req.query;
        
        // Create base query
        let query = { seller: sellerId };
        
        // Add platformType filter if provided
        if (platformType) {
            query.platformType = platformType;
        }

        // Execute query
        let products = await Product.find(query)
            .sort(sort)
            .select('name price images stock rating numReviews platformType minPrice maxPrice unitType unitPrice auctionEndDate availableLocations negotiationEnabled currentHighestBid currentHighestBidder auctionStatus');

        // Apply limit only if specified
        if (limit) {
            products = products.slice(0, parseInt(limit));
        }

        // Fetch latest review and pending orders for each product
        const productsWithDetails = await Promise.all(products.map(async (product) => {
            // Get latest review
            const latestReview = await Review.findOne({ product: product._id })
                .sort('-createdAt')
                .select('rating comment userName createdAt');

            // Get pending orders count
            const pendingOrders = await Order.countDocuments({
                'items.product': product._id,
                'items.seller': sellerId,
                status: { $in: ['pending', 'confirmed', 'processing'] }
            });

            return {
                ...product.toObject(),
                latestReview,
                pendingOrders
            };
        }));

        res.json({
            success: true,
            products: productsWithDetails
        });

    } catch (error) {
        console.error('Error fetching seller products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching seller products',
            error: error.message
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

        // Get coordinates from address
        const coordinates = await getCoordinatesFromAddress(address, city, state, pincode, country);

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
            shopName,
            businessType,
            aadharNumber,
            termsAccepted,
            location: coordinates,
            notifications: []
        };

        console.log('Creating new seller with complete data:', userData);

        const user = new Seller(userData);
        await user.save();

        return res.status(201).json({
            success: true,
            message: 'Signup Successful! You can now start selling on our platform.'
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

export const getSellerProfile = async (req, res) => {
    try {
        const { sellerId } = req.params;
        
        // Convert string ID to ObjectId
        const objectId = new mongoose.Types.ObjectId(sellerId);
        
        // Find seller using the User model
        const seller = await mongoose.model('User').findOne({
            _id: objectId,
            userType: 'seller'  // Make sure this matches the exact value in your DB
        }).select('firstname lastname shopName profileImage businessType city state createdAt');

        console.log('Seller query result:', seller); // For debugging

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        // Get seller's products count
        const productsCount = await Product.countDocuments({ seller: sellerId });

        // Get seller's total orders
        const ordersCount = await Order.countDocuments({ 
            'items.seller': sellerId 
        });

        res.json({
            success: true,
            seller: {
                ...seller.toObject(),
                productsCount,
                ordersCount
            }
        });

    } catch (error) {
        console.error('Error in getSellerProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching seller profile',
            error: error.message
        });
    }
};

// Add this function to verify seller exists
export const verifySeller = async (req, res) => {
    try {
        const { sellerId } = req.params;
        
        // First, let's log the seller document directly from MongoDB
        const seller = await mongoose.connection.collection('users').findOne({
            _id: new mongoose.Types.ObjectId(sellerId)
        });
        
        console.log('Raw seller document:', seller);
        
        res.json({
            success: true,
            exists: !!seller,
            userType: seller?.userType
        });
    } catch (error) {
        console.error('Verify seller error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getSellerById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find seller
        const seller = await Seller.findById(id)
            .select('firstname lastname shopName profileImage businessType city state createdAt rating');
        
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        // Get seller's products
        const products = await Product.find({ seller: id })
            .select('name images price stock rating numReviews')
            .sort('-createdAt')
            .limit(10);

        // Get seller's stats
        const stats = {
            totalProducts: await Product.countDocuments({ seller: id }),
            totalSales: 0,
            averageRating: 0,
            totalCustomers: 0
        };

        // Calculate total sales and unique customers
        const orders = await Order.find({ 'items.seller': id });
        const uniqueCustomers = new Set();

        orders.forEach(order => {
            uniqueCustomers.add(order.buyer.toString());
            const sellerItems = order.items.filter(item => 
                item.seller.toString() === id.toString()
            );
            if (order.status === 'completed' || order.status === 'delivered') {
                stats.totalSales += sellerItems.reduce((sum, item) => 
                    sum + (item.price * item.quantity), 0
                );
            }
        });

        stats.totalCustomers = uniqueCustomers.size;

        // Calculate average rating
        const reviews = await Review.find({ 
            product: { $in: products.map(p => p._id) }
        });
        
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            stats.averageRating = (totalRating / reviews.length).toFixed(1);
        }

        res.status(200).json({
            success: true,
            seller,
            products,
            stats
        });

    } catch (error) {
        console.error('Error fetching seller details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching seller details',
            error: error.message
        });
    }
};

export const getReviewStats = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const twentyEightDaysAgo = new Date();
        twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

        // Get seller's products
        const products = await Product.find({ seller: sellerId });
        const productIds = products.map(p => p._id);

        // Get reviews for these products in last 28 days
        const reviews = await Review.find({
            product: { $in: productIds },
            createdAt: { $gte: twentyEightDaysAgo }
        });

        // Calculate stats
        const stats = {
            totalReviews28Days: reviews.length,
            repliedReviews: reviews.filter(r => r.replies && r.replies.length > 0).length,
            pendingReplies: reviews.filter(r => !r.replies || r.replies.length === 0).length
        };

        res.status(200).json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Error fetching review stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching review statistics'
        });
    }
};

export const getLatestReviews = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const limit = 3; // Get only latest 3 reviews

        // Get seller's products
        const products = await Product.find({ seller: sellerId });
        const productIds = products.map(p => p._id);

        // Get latest reviews for these products
        const reviews = await Review.find({ product: { $in: productIds } })
            .populate('buyer', 'firstname lastname profileImage')
            .populate('product', 'name images')
            .sort({ createdAt: -1 })
            .limit(limit);

        res.status(200).json({
            success: true,
            reviews
        });

    } catch (error) {
        console.error('Error fetching latest reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching latest reviews'
        });
    }
};

export const searchProductReviews = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const { query } = req.query;

        // First find products matching the search query
        const products = await Product.find({
            seller: sellerId,
            name: { $regex: query, $options: 'i' }
        });

        const productIds = products.map(p => p._id);

        // Then get reviews for these products
        const reviews = await Review.find({ product: { $in: productIds } })
            .populate('buyer', 'firstname lastname profileImage')
            .populate('product', 'name images')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            reviews
        });

    } catch (error) {
        console.error('Error searching product reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching product reviews'
        });
    }
};

export const sellerSignin = async (req, res) => {
    try {
        const { mobileno, password } = req.body;

        if (!mobileno || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide mobile number and password'
            });
        }

        const mobilenoString = mobileno.toString();

        // Find seller by mobile number
        const seller = await Seller.findOne({ mobileno: mobilenoString });

        if (!seller) {
            return res.status(401).json({
                success: false,
                message: 'Invalid mobile number or password'
            });
        }

        // Verify password
        const isPasswordValid = await seller.matchPassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid mobile number or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: seller._id, userType: 'seller' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send response with cookie
        res.status(200)
           .cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
           })
           .json({
                success: true,
                data: {
                    _id: seller._id,
                    firstname: seller.firstname,
                    lastname: seller.lastname,
                    mobileno: seller.mobileno,
                    userType: 'seller',
                    platformType: seller.platformType,
                    profileImage: seller.profileImage,
                    shopName: seller.shopName,
                    businessType: seller.businessType,
                    token: token
                }
           });

    } catch (error) {
        console.error('Seller signin error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during signin',
            error: error.message
        });
    }
};
