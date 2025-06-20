import mongoose from "mongoose";
import User, { baseUserSchema } from "./baseUser.model.js";

// Create the Buyer schema
const buyerSchema = new mongoose.Schema({
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    searchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SearchHistory' }]
});

// Create the Buyer model using discriminator
const Buyer = User.discriminator('buyer', buyerSchema);

export default Buyer;