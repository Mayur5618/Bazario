import mongoose from "mongoose";
import User from "./baseUser.model.js";

// Create the Seller schema that extends the base user schema
const sellerSchema = new mongoose.Schema({
    shopName: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        default: ''
    },
    businessType: {
        type: String,
        required: true
    },
    customBusinessType: String,
    businessDescription: String,
    aadharNumber: {
        type: String,
        required: true
    },
    platformType: {
        type: [String],
        enum: ['b2b', 'b2c'],
        required: true
    },
    termsAccepted: {
        type: Boolean,
        required: true
    },
    notifications: [{
        message: {
            type: String,
            required: true
        },
        read: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
});

// Create and export the Seller model
const Seller = User.discriminator('seller', sellerSchema);
export default Seller;