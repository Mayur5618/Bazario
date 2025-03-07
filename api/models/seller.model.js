import mongoose from "mongoose";
import baseUserSchema from "./baseUser.model.js";

// First, create the base User model if it doesn't exist
const User = mongoose.models.User || mongoose.model('User', baseUserSchema);

// Create the Seller schema
const sellerSchema = new mongoose.Schema({
    shopName: {
        type: String,
        required: true
    },
    businessType: {
        type: String,
        required: true,
    },
    customBusinessType: String,
    businessDescription: String,
    aadharNumber: {
        type: String,
        required: true,
        length: 12
    },
    platformType: {
        type: [String],
        enum: ['b2b', 'b2c'],
        required: true
    },
    termsAccepted: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return v === "true";
            },
            message: "Terms must be accepted"
        }
    }
});

// Create the Seller model using discriminator
const Seller = User.discriminator('seller', sellerSchema);

export default Seller;