import Agency from '../models/agency.model.js';
import Seller from '../models/seller.model.js';
import Buyer from '../models/buyer.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Agency Login
export const signin = async (req, res) => {
    try {
        const { mobileno, password } = req.body;
        console.log('Login attempt with:', { mobileno });

        // Validate input
        if (!mobileno || !password) {
            return res.status(400).json({
                success: false,
                message: 'कृपया मोबाइल नंबर और पासवर्ड दर्ज करें'
            });
        }

        const mobilenoString = mobileno.toString();

        // Find user by mobile number
        const user = await Agency.findOne({ mobileno: mobilenoString });
        
        if (!user) {
            console.log('User not found with mobile:', mobilenoString);
            return res.status(401).json({
                success: false,
                message: 'अमान्य मोबाइल नंबर या पासवर्ड'
            });
        }

        console.log('Found user:', { 
            id: user._id,
            mobileno: user.mobileno,
            userType: user.userType
        });

        // Check password using matchPassword method
        const isPasswordValid = await user.matchPassword(password);
        console.log('Password validation result:', isPasswordValid);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'अमान्य मोबाइल नंबर या पासवर्ड'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id,
                userType: 'agency'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from user object
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        console.log('Login successful for user:', mobilenoString);

        res.status(200).json({
            success: true,
            message: 'लॉगिन सफल',
            data: {
                ...userWithoutPassword,
                token,
                userType: 'agency'
            }
        });

    } catch (error) {
        console.error('Agency login error:', error);
        res.status(500).json({
            success: false,
            message: 'सर्वर में त्रुटि है, कृपया कुछ देर बाद प्रयास करें'
        });
    }
};

export const agencySignup = async (req, res) => {
    try {
        const {
            email,
            mobileno,
            password,
            confirmPassword,
            address,
            country,
            state,
            city,
            pincode,
            agencyName,
            contactPerson,
            alternateContactNumber,
            gstNumber,
            businessLicenseNumber,
            bankDetails,
            website,
            logoUrl,
            platformType = ['b2b'],
            firstname,
            lastname
        } = req.body;

        const mobilenoString = mobileno.toString();

        // Basic validation
        if (!email || !mobileno || !password || !confirmPassword || !address || !country || 
            !state || !city || !pincode || !agencyName || 
            !contactPerson || !gstNumber || !businessLicenseNumber) {
            return res.status(400).json({
                success: false,
                message: 'कृपया सभी आवश्यक फील्ड भरें'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'अमान्य ईमेल पता'
            });
        }

        // Validate password
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए'
            });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'पासवर्ड मैच नहीं कर रहे हैं'
            });
        }

        // Validate GST number format (basic validation)
        if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber)) {
            return res.status(400).json({
                success: false,
                message: 'अमान्य GST नंबर'
            });
        }

        // Check if user already exists
        const existingUser = await Promise.any([
            Seller.findOne({ $or: [{ mobileno: mobilenoString }, { email }] }),
            Buyer.findOne({ $or: [{ mobileno: mobilenoString }, { email }] }),
            Agency.findOne({ $or: [{ mobileno: mobilenoString }, { email }] })
        ]).catch(() => null);

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'इस मोबाइल नंबर या ईमेल से पहले से ही एक खाता मौजूद है'
            });
        }

        // Create agency user with default location
        const agency = new Agency({
            email,
            mobileno: mobilenoString,
            password,
            address,
            country,
            state,
            city,
            pincode,
            location: { latitude: 0, longitude: 0 }, // Default location
            agencyName,
            contactPerson,
            alternateContactNumber,
            gstNumber,
            businessLicenseNumber,
            bankDetails: {
                accountHolderName: bankDetails?.accountHolderName || '',
                accountNumber: bankDetails?.accountNumber || '',
                ifscCode: bankDetails?.ifscCode || '',
                bankName: bankDetails?.bankName || ''
            },
            website,
            logoUrl,
            platformType,
            firstname: agencyName, // Use agencyName as firstname
            lastname: contactPerson // Use contactPerson as lastname
        });

        await agency.save();

        return res.status(201).json({
            success: true,
            message: 'एजेंसी रजिस्ट्रेशन सफल',
            data: {
                id: agency._id,
                agencyName: agency.agencyName,
                contactPerson: agency.contactPerson
            }
        });

    } catch (error) {
        console.error('Error in agency signup:', error);
        return res.status(500).json({
            success: false,
            message: 'एजेंसी रजिस्ट्रेशन में त्रुटि',
            error: error.message
        });
    }
};