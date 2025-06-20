import mongoose from "mongoose";
import User, { baseUserSchema } from "./baseUser.model.js";

const agencySchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    agencyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    alternateContactNumber: { type: String },
    gstNumber: { type: String, required: true },
    businessLicenseNumber: { type: String, required: true },
    bankDetails: {
        accountHolderName: { type: String },
        accountNumber: { type: String },
        ifscCode: { type: String },
        bankName: { type: String }
    },
    website: { type: String },
    logoUrl: { type: String },
    subscribedSellers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Seller" }],
    notifications: [{ type: String }],
    platformType: {
        type: [String],  
        enum: ['b2b', 'b2c'],
        required: true,
        validate: {
            validator: function(v) {
                return v.length > 0 && v.length <= 2;
            },
            message: 'At least one platform type must be selected'
        }
    }
});

const Agency = User.discriminator('agency', agencySchema);

export default Agency; 