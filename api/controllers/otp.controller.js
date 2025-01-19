import Buyer from '../models/buyer.model.js';
import OTP from '../models/otp.model.js';

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const checkMobile = async (req, res) => {
    try {
        const { mobileno } = req.body;
        const existingUser = await Buyer.findOne({ mobileno });
        
        res.json({ exists: !!existingUser });
    } catch (error) {
        console.error('Check Mobile Error:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error checking mobile number" 
        });
    }
};

export const sendOTP = async (req, res) => {
    try {
        const { mobileno } = req.body;
        const otp = generateOTP();
        
        // Save OTP to database
        await OTP.findOneAndUpdate(
            { mobileno },
            { mobileno, otp },
            { upsert: true, new: true }
        );

        // For development: just log the OTP
        console.log(`🔐 OTP for ${mobileno}: ${otp}`);

        res.json({ 
            success: true, 
            message: "OTP sent successfully",
            // Only in development: send OTP in response
            otp: otp // This makes testing easier
        });
    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to send OTP" 
        });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { mobileno, otp } = req.body;
        
        // Find the stored OTP
        const otpRecord = await OTP.findOne({ mobileno });

        if (!otpRecord) {
            return res.status(400).json({ 
                success: false, 
                message: "OTP expired or not found" 
            });
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid OTP" 
            });
        }

        // Delete the OTP record after successful verification
        await OTP.deleteOne({ mobileno });
        
        res.json({ 
            success: true, 
            message: "OTP verified successfully" 
        });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ 
            success: false, 
            message: "Verification failed" 
        });
    }
}; 