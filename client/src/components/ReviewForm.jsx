import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }
        setImages(files);
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
            const formData = new FormData();
            formData.append('rating', rating);
            formData.append('comment', comment);
            images.forEach(image => {
                formData.append('images', image);
            });

            const response = await axios.post(
                `/api/products/${productId}/reviews`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                }
            );

            if (response.data.success) {
                toast.success('Review submitted successfully!');
                setRating(0);
                setComment('');
                setImages([]);
                if (onReviewSubmitted) {
                    onReviewSubmitted(response.data.review);
                }
            }
        } catch (error) {
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
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
};

export default ReviewForm; 