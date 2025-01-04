import mongoose from "mongoose";
import baseUserSchema from "./baseUser.model.js";

const User = mongoose.model('User', baseUserSchema);

const Seller = User.discriminator('seller', new mongoose.Schema({
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
}));

export default Seller;