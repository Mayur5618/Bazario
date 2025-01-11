import Seller from '../models/seller.model.js';
import Product from '../models/product.model.js';
import Buyer from '../models/buyer.model.js';
import Agency from '../models/agency.model.js';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import crypto from 'crypto';

// Twilio configuration
const twilioClient = twilio("AC7e47441a2fde99bca427d17971d3036b", "7ae83cc4d9f5d8e445eff220b5340b0d");
const TWILIO_PHONE_NUMBER = "+918140023599";

// In-memory store for OTPs (for demonstration purposes)
const otpStore = {};

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
            password
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
            { 
                id: user._id, 
                userType: user.userType 
            },
            'your-temporary-secret-key',
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
                token            
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
  
      const decoded = jwt.verify(token, 'your-temporary-secret-key');
      
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
      const token = req.cookies.access_token;
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token found'
        });
      }
  
      const decoded = jwt.verify(token, 'your-temporary-secret-key');
      
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
  
      // Return user data without sensitive information
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
      console.error('Check auth error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid token'
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
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    const products = await Product.find({ seller: sellerId }); // Fetch products by seller ID
    res.status(200).json({ seller, products });
  } catch (error) {
    console.error('Error fetching seller data:', error);
    res.status(500).json({ success: false, message: 'Error fetching seller data' });
  }
};