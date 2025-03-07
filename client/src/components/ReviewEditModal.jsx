import React, { useState, useEffect } from 'react';
import { FaStar, FaImage, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ReviewEditModal = ({ review, isOpen, onClose, onUpdate }) => {
    const [rating, setRating] = useState(review?.rating || 0);
    const [comment, setComment] = useState(review?.comment || '');
    const [images, setImages] = useState(review?.images || []);
    const [newImages, setNewImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        if (review) {
            setRating(review.rating);
            setComment(review.comment);
            setImages(review.images || []);
        }
    }, [review]);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        // Store new images for upload
        setNewImages([...newImages, ...files]);

        // Create preview URLs for new images
        const newImageUrls = files.map(file => URL.createObjectURL(file));
        setImages([...images, ...newImageUrls]);
    };

    const removeImage = (index) => {
        const updatedImages = [...images];
        updatedImages.splice(index, 1);
        setImages(updatedImages);

        if (index < review.images.length) {
            // It's an existing image
            const imageUrl = review.images[index];
            // Handle removal of existing image
        } else {
            // It's a new image
            const newIndex = index - review.images.length;
            const updatedNewImages = [...newImages];
            updatedNewImages.splice(newIndex, 1);
            setNewImages(updatedNewImages);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!rating) {
            toast.error('Please select a rating');
            return;
        }
        
        if (!comment.trim()) {
            toast.error('Please write a review');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('rating', rating);
            formData.append('comment', comment.trim());
            
            // Append new images
            newImages.forEach(image => {
                formData.append('images', image);
            });

            // Add existing images
            const existingImages = images.slice(0, review.images.length);
            formData.append('existingImages', JSON.stringify(existingImages));

            const response = await axios.put(
                `/api/reviews/${review._id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                }
            );

            if (response.data.success) {
                toast.success('Review updated successfully');
                onUpdate(response.data.review);
                onClose();
            }
        } catch (error) {
            console.error('Error updating review:', error);
            toast.error(error.response?.data?.message || 'Failed to update review');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Edit Review</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Rating Stars */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rating *
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
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
                                    </button>
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows="4"
                                placeholder="Share your experience with this product..."
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Images
                            </label>
                            <div className="flex flex-wrap gap-4 mb-4">
                                {images.map((image, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                                            alt={`Review ${index + 1}`}
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                        >
                                            <FaTimes size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {images.length < 5 && (
                                <div className="flex items-center">
                                    <label className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200">
                                        <FaImage className="mr-2" />
                                        Add Images
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                    <span className="ml-4 text-sm text-gray-500">
                                        {5 - images.length} images remaining
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3 rounded-lg text-white font-medium ${
                                isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Review'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewEditModal; 