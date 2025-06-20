import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const baseUserSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    mobileno: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: '' },
    userType: { 
        type: String, 
        required: true,
        enum: ['buyer', 'seller', 'agency'],
        default: 'buyer'
    },
    location: {
        type: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true }
        },
        required: true,
        default: { latitude: 0, longitude: 0 }
    }
}, {
    timestamps: true,
    discriminatorKey: 'userType',
});

// Add method to check password
baseUserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password before saving
baseUserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', baseUserSchema);

export { baseUserSchema };
export default User;