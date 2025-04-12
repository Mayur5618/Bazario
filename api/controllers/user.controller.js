import Seller from '../models/seller.model.js';
import Product from '../models/product.model.js';
import Buyer from '../models/buyer.model.js';
import Agency from '../models/agency.model.js';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import crypto from 'crypto';
import multer from 'multer'; // Import multer for file uploads
import path from 'path'; // Import path for file path handling
import fs from 'fs'; // Import fs for file system operations
// import User from '../models/.model.js'; // Ensure you import your User model
import User from '../models/buyer.model.js';
import { uploadToFirebase } from '../utilities/firebase.js';
import Order from '../models/order.model.js';
import Review from '../models/review.model.js';
import { getCoordinatesFromAddress } from '../utils/geocoding.js';
// Twilio configuration
const twilioClient = twilio("AC7e47441a2fde99bca427d17971d3036b", "7ae83cc4d9f5d8e445eff220b5340b0d");
const TWILIO_PHONE_NUMBER = "+918140023599";

// In-memory store for OTPs (for demonstration purposes)
const otpStore = {};

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user._id}${path.extname(file.originalname)}`); // Use user ID as filename
    }
});

const upload = multer({ storage });

// Function to send OTP
export const sendOtp = async (req, res) => {
    const { mobileno } = req.body;

    if (!mobileno) {
        return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    // Generate a random 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore[mobileno] = otp; // Store OTP in memory (use a database in production)

    try {
        await twilioClient.messages.create({
            body: `Your OTP is ${otp}`,
            from: TWILIO_PHONE_NUMBER,
            to: mobileno
        });
        return res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
};

// Function to verify OTP
export const verifyOtp = async (req, res) => {
    const { mobileno, otp } = req.body;

    if (!mobileno || !otp) {
        return res.status(400).json({ success: false, message: 'Mobile number and OTP are required' });
    }

    const storedOtp = otpStore[mobileno];

    if (!storedOtp) {
        return res.status(400).json({ success: false, message: 'OTP not found or expired' });
    }

    if (storedOtp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP is valid, you can proceed with registration or other logic
    delete otpStore[mobileno]; // Clear OTP after verification
    return res.status(200).json({ success: true, message: 'OTP verified successfully' });
};

export const signup = async (req, res) => {
    try {
        console.log('Received signup request:', req.body); 

        const { firstname, lastname, mobileno, address, country, state, city, pincode, password, userType, platformType } = req.body;

        const mobilenoString = mobileno.toString();

        if (!firstname || !lastname || !mobileno || !address || !country || 
            !state || !city || !pincode || !password || !userType) {
            return res.status(400).json({ 
                success: false,
                message: 'Please fill all required fields' 
            });
        }

        // Get coordinates from address
        const coordinates = await getCoordinatesFromAddress(address, city, state, pincode, country);

        if (!password || password.length < 6) {
            return res.status(400).json({ 
                success: false,
                message: 'Password is required and should be at least 6 characters long' 
            });
        }

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

        let UserModel;
        let userData = {
            firstname,
            lastname,
            mobileno: mobilenoString,
            address,
            country,
            state,
            city,
            pincode,
            password,
            location: coordinates
        };

        switch (userType.toLowerCase()) {
            case 'seller':
                if (!platformType) {
                    return res.status(400).json({ 
                        success: false,
                        message: 'Platform type is required for sellers' 
                    });
                }
                UserModel = Seller;
                userData.platformType = platformType;
                break;

            case 'agency':
                if (!platformType) {
                    return res.status(400).json({ 
                        success: false,
                        message: 'Platform type is required for agencies' 
                    });
                }
                UserModel = Agency;
                userData.platformType = platformType;
                break;

            case 'buyer':
                UserModel = Buyer;
                break;

            default:
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid user type' 
                });
        }

        console.log('Creating new user with data:', userData); // Add logging

        const user = new UserModel(userData);
        await user.save();

        console.log('User saved successfully:', user); // Add logging

        // const token = jwt.sign(
        //     { id: user._id, userType }, 
        //     'your-temporary-secret-key',
        //     { expiresIn: '30d' }
        // );

        return res.status(201).json({
            success: true,
            data:"Signup Successfull.."
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

export const sellerSignup = async (req, res) => {
    try {
        const { 
            firstname, 
            lastname, 
            mobileno, 
            address, 
            country, 
            state, 
            city, 
            profileImage,
            pincode, 
            password,
            shopName,
            businessType,
            customBusinessType,
            businessDescription,
            aadharNumber,
            termsAccepted,
            platformType = ['b2c']
        } = req.body;

        const mobilenoString = mobileno.toString();

        // Basic validation
        if (!firstname || !lastname || !mobileno || !address || !country || 
            !state || !city || !profileImage || !pincode || !password || !shopName || 
            !businessType || !aadharNumber) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please fill all required fields' 
            });
        }

        // Validate password
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Validate Aadhar number
        if (!/^\d{12}$/.test(aadharNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Aadhar number'
            });
        }

        // Validate business type
        if (businessType === 'other' && !customBusinessType) {
            return res.status(400).json({
                success: false,
                message: 'Please specify your business type'
            });
        }

        // Validate terms acceptance
        if (!termsAccepted) {
            return res.status(400).json({
                success: false,
                message: 'Please accept the terms and conditions'
            });
        }

        // Get coordinates from address
        const coordinates = await getCoordinatesFromAddress(address, city, state, pincode, country);

        // Check if user already exists
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

        // Create seller object with coordinates
        const seller = new Seller({
            firstname,
            lastname,
            mobileno: mobilenoString,
            address,
            country,
            state,
            city,
            profileImage,
            pincode,
            password,
            shopName,
            businessType,
            customBusinessType,
            businessDescription,
            aadharNumber,
            termsAccepted,
            platformType,
            userType: 'seller',
            status: 'pending',
            location: coordinates
        });

        await seller.save();

        return res.status(201).json({
            success: true,
            message: "Seller registration successful. Your account is pending approval."
        });
    } catch (error) {
        console.error('Error in seller signup:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating seller account',
            error: error.message
        });
    }
};

export const signin = async (req, res) => {
    try {
        const { mobileno, password } = req.body;

        if (!mobileno || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide mobile number and password'
            });
        }

        const mobilenoString = mobileno.toString();

        let user = null;
        
        const seller = await Seller.findOne({ mobileno: mobilenoString });
        const buyer = await Buyer.findOne({ mobileno: mobilenoString });
        const agency = await Agency.findOne({ mobileno: mobilenoString });

        user = seller || buyer || agency;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid mobile number or password'
            });
        }

        const isPasswordValid = await user.matchPassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid mobile number or password'
            });
        }

        const token = jwt.sign(
            { id: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

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
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                mobileno: user.mobileno,
                userType: user.userType,
                platformType: user.platformType,
                profileImage: user.profileImage,
                wishlist: user.wishlist,
                city: user.city || user.address?.city || '',
                token: token
              }
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during signin',
            error: error.message
        });
    }
};

export const updatePlatformTypes = async (req, res) => {
    try {
        const userId = req.user._id;
        const { platformTypes } = req.body;

        // Validate platform types
        if (!Array.isArray(platformTypes) || 
            !platformTypes.every(type => ['b2b', 'b2c'].includes(type)) ||
            platformTypes.length === 0 || 
            platformTypes.length > 2) {
            return res.status(400).json({
                success: false,
                message: 'Invalid platform types. Must be ["b2b"], ["b2c"], or ["b2b", "b2c"]'
            });
        }

        // Update user's platform types
        const user = await User.findByIdAndUpdate(
            userId,
            { platformTypes },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Platform types updated successfully',
            platformTypes: user.platformTypes
        });

    } catch (error) {
        console.error('Update platform types error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const verifyUser = async (req, res) => {
    try {
      const token = req.cookies.access_token;
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user based on decoded token
      let user = null;
      switch (decoded.userType) {
        case 'seller':
          user = await Seller.findById(decoded.id);
          break;
        case 'buyer':
          user = await Buyer.findById(decoded.id);
          break;
        case 'agency':
          user = await Agency.findById(decoded.id);
          break;
      }
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
  
      res.json({
        success: true,
        data: {
          _id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          mobileno: user.mobileno,
          userType: user.userType,
          platformType: user.platformType
        }
      });
  
    } catch (error) {
      console.error('Verify user error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  };
  
  export const logout = async (req, res) => {
    try {
      res.clearCookie('access_token').json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Error during logout'
      });
    }
  };

  export const signOut = async (req, res, next) => {
    res
      .status(200)
      .clearCookie("access_token")
      .json({ message: "Sign-out succeful..", ok: true });
  };

  export const checkAuth = async (req, res) => {
    try {
        const buyer = await Buyer.findById(req.user.id).select('-password');
        
        if (!buyer) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: buyer  // This includes the profileImage
        });
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking authentication',
            error: error.message
        });
    }
};

// Add this new controller function
export const checkMobileExists = async (req, res) => {
    try {
        const { mobileno } = req.body;
        const mobilenoString = mobileno.toString();

        // Check each user type individually
        const sellerExists = await Seller.findOne({ mobileno: mobilenoString });
        const buyerExists = await Buyer.findOne({ mobileno: mobilenoString });
        const agencyExists = await Agency.findOne({ mobileno: mobilenoString });

        // Mobile exists if any of the queries found a user
        const exists = !!(sellerExists || buyerExists || agencyExists);

        return res.status(200).json({
            success: true,
            exists
        });
    } catch (error) {
        console.error('Error checking mobile:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking mobile number',
            error: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
  try {
      const { firstname, lastname, phone, address } = req.body;
      
      const user = await User.findById(req.user._id);
      
      if (!user) {
          return res.status(404).json({
              success: false,
              message: 'User not found'
          });
      }

      // Update fields
      user.firstname = firstname || user.firstname;
      user.lastname = lastname || user.lastname;
      user.phone = phone || user.phone;
      user.address = address || user.address;

      await user.save();

      res.json({
          success: true,
          message: 'Profile updated successfully',
          user: {
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
              phone: user.phone,
              address: user.address,
              userType: user.userType
          }
      });
  } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
          success: false,
          message: error.message || 'Error updating profile'
      });
  }
};

export const getSellerData = async (req, res) => {
  try {
    const sellerId = req.params.id;
    
    // Try to find seller in Seller model first
    let seller = await Seller.findById(sellerId)
      .select('firstname lastname shopName profileImage businessType city state createdAt rating mobileno address pincode userType');

    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found' 
      });
    }

    // Get seller's products
    const products = await Product.find({ 
      seller: sellerId,
      platformType: { $in: ['b2c'] }  // Find products that have b2c in their platformType array
    })
      .select('name images price stock rating numReviews category subCategory')
      .sort('-createdAt');

    // Get seller's stats
    const stats = {
      totalProducts: await Product.countDocuments({ 
        seller: sellerId,
        platformType: { $in: ['b2c'] }
      }),
      totalOrders: await Order.countDocuments({ 'items.seller': sellerId }),
      averageRating: 0,
      totalReviews: 0
    };

    // Calculate average rating from reviews
    const reviews = await Review.find({ 
      product: { $in: products.map(p => p._id) }
    });
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      stats.averageRating = (totalRating / reviews.length).toFixed(1);
      stats.totalReviews = reviews.length;
    }

    // Categorize products
    const categorizedProducts = {
      all: products,
      byCategory: {}
    };

    // Group products by category
    products.forEach(product => {
      if (product.category) {
        const category = product.category.toLowerCase();
        if (!categorizedProducts.byCategory[category]) {
          categorizedProducts.byCategory[category] = [];
        }
        categorizedProducts.byCategory[category].push(product);
      }
    });

    // Log the response for debugging
    console.log('Sending seller data:', {
      seller: seller.toObject(),
      productsCount: products.length,
      stats
    });

    res.status(200).json({ 
      success: true,
      seller: {
        ...seller.toObject(),
        stats
      },
      categorizedProducts
    });
  } catch (error) {
    console.error('Error fetching seller data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching seller data',
      error: error.message 
    });
  }
};

// Update the uploadProfileImage controller
export const uploadProfileImage = async (req, res) => {
    try {
        const { image, userId } = req.body;
        
        console.log('Received request with:', {
            hasImage: !!image,
            hasUserId: !!userId,
            userId: userId
        });

        // Validate required fields
        if (!image || !userId) {
            return res.status(400).json({ 
                success: false, 
                message: `Missing required fields: ${!image ? 'image' : ''} ${!userId ? 'userId' : ''}`.trim()
            });
        }

        // Find the user
        const user = await Buyer.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        try {
            // Upload to Firebase
            const imageUrl = await uploadToFirebase(image);
            console.log('Image uploaded to Firebase:', imageUrl);

            // Update user's profile image
            const updatedUser = await Buyer.findByIdAndUpdate(
                userId,
                { $set: { profileImage: imageUrl } },
                { new: true }
            ).select('-password');

            if (!updatedUser) {
                throw new Error('Failed to update user profile');
            }

            res.status(200).json({
                success: true,
                message: 'Profile image updated successfully',
                user: updatedUser
            });

        } catch (error) {
            console.error('Upload/Update error:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing image upload',
                error: error.message
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Function to get user profile
export const getProfile = async (req, res) => {
    try {
        // Check all user types
        let user = null;
        const userId = req.user._id;
        
        // Try to find user in all models
        user = await Promise.any([
            Buyer.findById(userId).select('-password'),
            Seller.findById(userId).select('-password'),
            Agency.findById(userId).select('-password')
        ]).catch(() => null);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Return fields matching frontend names
        res.status(200).json({
            success: true,
            user: {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.mobileno,
                address: user.address,
                city: user.city,
                state: user.state,
                pincode: user.pincode
            }
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

// Get seller profile with products and stats
export const getSellerProfile = async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    // Get seller details
    const seller = await Seller.findById(sellerId)
      .select('firstname lastname email phone profileImage bio description location businessHours');
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Get seller's products
    const products = await Product.find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .select('name images price stock rating numReviews');

    // Get seller's stats
    const stats = {
      totalProducts: products.length,
      totalSales: 0,
      averageRating: 0,
      totalCustomers: 0
    };

    // Calculate total sales and average rating
    const orders = await Order.find({ 'items.seller': sellerId });
    const uniqueCustomers = new Set();
    let totalRating = 0;
    let numRatings = 0;

    orders.forEach(order => {
      // Count unique customers
      uniqueCustomers.add(order.buyer.toString());
      
      // Calculate total sales
      const sellerItems = order.items.filter(item => 
        item.seller.toString() === sellerId.toString()
      );
      stats.totalSales += sellerItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
    });

    // Get average rating from reviews
    const reviews = await Review.find({ 
      product: { $in: products.map(p => p._id) }
    });
    
    if (reviews.length > 0) {
      totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      numRatings = reviews.length;
      stats.averageRating = totalRating / numRatings;
    }

    stats.totalCustomers = uniqueCustomers.size;

    res.status(200).json({
      success: true,
      seller,
      products,
      stats
    });

  } catch (error) {
    console.error('Error fetching seller profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seller profile',
      error: error.message
    });
  }
};

// Get agency details by ID
export const getAgencyDetails = async (req, res) => {
  try {
    const { agencyId } = req.params;

    // Find agency and select specific fields
    const agency = await Agency.findById(agencyId).select(
      'firstname lastname email mobileno agencyName address city state pincode profileImage businessLicenseNumber alternateContactNumber website subscribedSellers notifications platformType logoUrl'
    );

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    // Get agency's active bids count
    const activeBidsCount = await Order.countDocuments({
      'buyer': agencyId,
      'status': 'active'
    });

    // Get agency's won auctions count
    const wonAuctionsCount = await Order.countDocuments({
      'buyer': agencyId,
      'status': 'completed'
    });

    // Calculate total investment
    const orders = await Order.find({
      'buyer': agencyId,
      'status': 'completed'
    });
    
    const totalInvestment = orders.reduce((total, order) => {
      return total + (order.totalAmount || 0);
    }, 0);

    // Format the response
    const response = {
      _id: agency._id,
      firstname: agency.firstname,
      lastname: agency.lastname,
      email: agency.email,
      mobileno: agency.mobileno,
      agencyName: agency.agencyName,
      address: agency.address,
      city: agency.city,
      state: agency.state,
      pincode: agency.pincode,
      profileImage: agency.profileImage,
      businessLicenseNumber: agency.businessLicenseNumber,
      alternateContactNumber: agency.alternateContactNumber,
      website: agency.website,
      logoUrl: agency.logoUrl || "",
      platformType: agency.platformType,
      stats: {
        activeBids: activeBidsCount,
        wonAuctions: wonAuctionsCount,
        totalInvestment: totalInvestment
      },
      subscribedSellers: agency.subscribedSellers || [],
      notifications: agency.notifications || []
    };

    res.status(200).json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching agency details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching agency details',
      error: error.message
    });
  }
};