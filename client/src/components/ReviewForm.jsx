import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ReviewForm = ({ productId, orderId, onReviewSubmitted, existingReview = null }) => {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState(existingReview?.comment || '');
    const [images, setImages] = useState(existingReview?.images || []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating);
            setComment(existingReview.comment);
            setImages(existingReview.images || []);
        }
    }, [existingReview]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        // Convert images to base64
        const promises = files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (e) => reject(e);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(promises)
            .then(base64Images => {
                setImages(prev => [...prev, ...base64Images]);
            })
            .catch(error => {
                console.error('Error converting images:', error);
                toast.error('Error processing images');
            });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }
        if (!comment.trim()) {
            toast.error('Please write a review');
            return;
        }

        try {
            setIsSubmitting(true);
            
            const reviewData = {
                rating,
                comment,
                images
            };

            let response;
            if (existingReview) {
                // Update existing review
                response = await axios.put(
                    `/api/reviews/${existingReview._id}`,
                    reviewData,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        withCredentials: true
                    }
                );
                toast.success('Review updated successfully!');
            } else {
                // Create new review
                reviewData.orderId = orderId;
                response = await axios.post(
                    `/api/products/${productId}/reviews`,
                    reviewData,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        withCredentials: true
                    }
                );
                toast.success('Review submitted successfully!');
            }

            if (response.data.success) {
                setRating(0);
                setComment('');
                setImages([]);
                if (onReviewSubmitted) {
                    onReviewSubmitted(response.data.review);
                }
            }
        } catch (error) {
            console.error('Review submission error:', error);
            toast.error(error.response?.data?.message || 'Error submitting review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            {/* Rating Stars */}
            <div className="flex items-center gap-2">
                <span className="text-gray-700">Your Rating:</span>
                <div className="flex">
                    {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                            <FaStar
                                key={index}
                                className={`cursor-pointer w-6 h-6 ${
                                    ratingValue <= (hover || rating)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                }`}
                                onClick={() => setRating(ratingValue)}
                                onMouseEnter={() => setHover(ratingValue)}
                                onMouseLeave={() => setHover(0)}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Review Text */}
            <div>
                <label className="block text-gray-700 mb-2">Your Review:</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Write your review here..."
                    minLength="5"
                    maxLength="500"
                ></textarea>
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-gray-700 mb-2">
                    Add Images (optional, max 5):
                </label>
                <input
                    type="file"
                    onChange={handleImageChange}
                    multiple
                    accept="image/*"
                    className="w-full"
                    max="5"
                />
                {images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Preview ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-md"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                    isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
            </button>
        </form>
    );
};

export default ReviewForm; 