import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaImage, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ProductReviewSection = ({ productId, userId, orderId, onReviewSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const compressImage = async (file) => {
        // Check file size before compression (5MB limit)
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > MAX_FILE_SIZE) {
            throw new Error('Image size should be less than 5MB');
        }

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Max dimensions - reduced for better compression
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress with lower quality and maximum size check
                    const compressImage = (quality = 0.7) => {
                        return new Promise((resolve) => {
                            canvas.toBlob((blob) => {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    const base64String = reader.result;
                                    // Check if the compressed size is still too large
                                    if (base64String.length > 1024 * 1024) { // If larger than 1MB
                                        if (quality > 0.1) {
                                            // Try again with lower quality
                                            resolve(compressImage(quality - 0.1));
                                        } else {
                                            resolve(base64String); // Use the smallest possible size
                                        }
                                    } else {
                                        resolve(base64String);
                                    }
                                };
                                reader.readAsDataURL(blob);
                            }, 'image/jpeg', quality);
                        });
                    };

                    // Start compression with initial quality
                    compressImage().then(resolve);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length + images.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        // Check total size of all files
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        if (totalSize > 10 * 1024 * 1024) { // 10MB total limit
            toast.error('Total image size should be less than 10MB');
            return;
        }

        setIsSubmitting(true);
        try {
            const compressedImages = await Promise.all(
                files.map(async (file) => {
                    try {
                        // Additional file type validation
                        if (!file.type.startsWith('image/')) {
                            toast.error(`${file.name} is not a valid image file`);
                            return null;
                        }

                        const compressedBase64 = await compressImage(file);
                        
                        // Check compressed size
                        if (compressedBase64.length > 2 * 1024 * 1024) { // 2MB limit after compression
                            toast.error(`${file.name} is too large even after compression`);
                            return null;
                        }

                        return {
                            url: compressedBase64,
                            file: file.name
                        };
                    } catch (error) {
                        toast.error(`Error processing ${file.name}: ${error.message}`);
                        return null;
                    }
                })
            );

            // Filter out failed compressions
            const validImages = compressedImages.filter(img => img !== null);
            
            // Check if any images were successfully processed
            if (validImages.length === 0) {
                toast.error('No valid images were processed');
                return;
            }

            // Log the processed images
            console.log('Processed images:', validImages);

            setImages(prev => [...prev, ...validImages]);
            toast.success(`Successfully added ${validImages.length} image${validImages.length > 1 ? 's' : ''}`);
        } catch (error) {
            console.error('Error processing images:', error);
            toast.error('Error processing images. Please try smaller images.');
        } finally {
            setIsSubmitting(false);
            // Reset the file input
            e.target.value = '';
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Client-side validation
        if (!rating) {
            toast.error('Please select a rating');
            return;
        }
        
        if (!comment.trim()) {
            toast.error('Please write a review');
            return;
        }

        if (comment.trim().length < 5) {
            toast.error('Review must be at least 5 characters long');
            return;
        }

        setIsSubmitting(true);
        try {
            // Log the images being sent
            console.log('Images before submission:', images);
            
            const reviewData = {
                rating,
                comment: comment.trim(),
                images: images, // Send the entire images array with url property
                orderId
            };

            await onReviewSubmit(reviewData);
            
            // Reset form
            setRating(0);
            setComment('');
            setImages([]);
            
            // Scroll to the reviews section
            const reviewsSection = document.querySelector('#reviews-section');
            if (reviewsSection) {
                reviewsSection.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            // Extract meaningful error message
            let errorMessage = 'Failed to submit review';
            
            if (error.message.includes('validation failed')) {
                if (error.message.includes('comment')) {
                    errorMessage = 'Review must be at least 5 characters long';
                } else if (error.message.includes('rating')) {
                    errorMessage = 'Please select a valid rating (1-5)';
                }
            }
            
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
            <h3 className="text-2xl font-bold mb-6">Write a Review</h3>
            <form onSubmit={handleSubmit}>
                {/* Rating Stars */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Overall Rating *
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                                key={star}
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none"
                            >
                                <FaStar 
                                    className={`text-3xl ${
                                        star <= (hoverRating || rating)
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                    }`}
                                />
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Review Text */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review *
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                        rows="4"
                        placeholder="Share your experience with this product..."
                    />
                </div>

                {/* Image Upload */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Photos (Optional)
                    </label>
                    <div className="flex flex-wrap gap-4">
                        {images.map((image, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="relative"
                            >
                                <img
                                    src={image.url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-24 h-24 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                                >
                                    <FaTimes size={12} />
                                </button>
                            </motion.div>
                        ))}
                        {images.length < 5 && (
                            <motion.label
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                            >
                                <FaImage className="text-gray-400 text-xl mb-1" />
                                <span className="text-xs text-gray-500">Add Photo</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                            </motion.label>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        You can upload up to 5 images
                    </p>
                </div>

                {/* Submit Button */}
                <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 rounded-lg text-white font-medium transition-all duration-200 ${
                        isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Submitting...
                        </div>
                    ) : (
                        'Submit Review'
                    )}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default ProductReviewSection; 