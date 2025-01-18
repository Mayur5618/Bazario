import mongoose from "mongoose";
import baseUserSchema from "./baseUser.model.js";

const User = mongoose.model('User', baseUserSchema);

const Buyer = User.discriminator('Buyer', new mongoose.Schema({
    // Add any buyer-specific fields here if needed
}));

export default Buyer;