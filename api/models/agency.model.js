import mongoose from "mongoose";
import User, { baseUserSchema } from "./baseUser.model.js";

const Agency = User.discriminator('agency', new mongoose.Schema({
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

export default Agency; 