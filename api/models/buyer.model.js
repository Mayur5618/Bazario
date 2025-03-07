import mongoose from "mongoose";
import baseUserSchema from "./baseUser.model.js";

// First, create the base User model if it doesn't exist
const User = mongoose.models.User || mongoose.model('User', baseUserSchema);

// Create the Buyer schema
const buyerSchema = new mongoose.Schema({
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    searchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SearchHistory' }]
});

// Create the Buyer model using discriminator
const Buyer = User.discriminator('buyer', buyerSchema);

export default Buyer;