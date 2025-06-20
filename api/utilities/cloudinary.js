// api/utils/cloudinary.js
import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: "dav3swmpp", // Your Cloudinary cloud name
    api_key: "379484443677759",       // Your Cloudinary API key
    api_secret:"lM9cSsh24qc9wF5oyCl-O8bthYw"   // Your Cloudinary API secret
});

// Function to upload image to Cloudinary
export const uploadToCloudinary = async (filePath) => {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(filePath, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result.secure_url); // Return the secure URL of the uploaded image
            }
        });
    });
};