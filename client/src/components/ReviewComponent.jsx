import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar, FaThumbsUp, FaReply, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ReviewComponent = ({ productId, userId, userType }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingReview, setEditingReview] = useState(null);
    const [editText, setEditText] = useState('');
    const [editRating, setEditRating] = useState(0);
    const [newImages, setNewImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    // Feature ratings state
    const [featureRatings, setFeatureRatings] = useState({
        durability: 0,
        valueForMoney: 0,
        giftable: 0,
        craftsmanship: 0,
        sturdiness: 0,
        easyToClean: 0
    });

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`/api/reviews/products/${productId}/reviews`);
            setReviews(response.data.reviews);
            setStats(response.data.stats);
            calculateFeatureRatings(response.data.reviews);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to fetch reviews');
            setLoading(false);
        }
    };

    const calculateFeatureRatings = (reviewsData) => {
        // Calculate average ratings for each feature
        // This is a placeholder - implement based on your data structure
        setFeatureRatings({
            durability: 4.9,
            valueForMoney: 4.8,
            giftable: 4.8,
            craftsmanship: 4.8,
            sturdiness: 4.7,
            easyToClean: 4.7
        });
    };

    const handleLikeReview = async (reviewId) => {
        try {
            const response = await axios.post(`/api/reviews/${reviewId}/like`, {
                userId: userId
            });
            if (response.data.success) {
                fetchReviews();
                toast.success('Review rating updated');
            }
        } catch (err) {
            toast.error('Failed to like review');
        }
    };

    const handleEditReview = async (reviewId) => {
        if (!editText.trim()) {
            toast.error('Review comment cannot be empty');
            return;
        }
        
        if (editRating < 1) {
            toast.error('Please select a rating');
            return;
        }

        try {
            // For basic comment and rating update, we don't need FormData
            const response = await axios.patch(`/api/reviews/${reviewId}`, {
                comment: editText,
                rating: editRating
            });

            console.log('Response:', response.data); // Debug log

            if (response.data.success) {
                setEditingReview(null);
                setEditText('');
                setEditRating(0);
                fetchReviews();
                toast.success('Review updated successfully!');
            } else {
                toast.error(response.data.message || 'Failed to update review');
            }
        } catch (err) {
            console.error('Edit review error:', err); // Debug log
            toast.error(
                err.response?.data?.message || 
                'Failed to update review. Please try again.'
            );
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            const response = await axios.delete(`/api/reviews/${reviewId}`);
            if (response.data.success) {
                setShowDeleteModal(false);
                setReviewToDelete(null);
                fetchReviews();
                toast.success('Review deleted successfully!');
            } else {
                toast.error(response.data.message || 'Failed to delete review');
            }
        } catch (err) {
            console.error('Delete review error:', err);
            toast.error(
                err.response?.data?.message || 
                'Failed to delete review. Please try again.'
            );
        }
    };

    const handleImageSelect = async (event) => {
        const files = Array.from(event.target.files);
        
        if (files.length + newImages.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        try {
            const base64Promises = files.map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = (e) => reject(e);
                    reader.readAsDataURL(file);
                });
            });

            const base64Results = await Promise.all(base64Promises);
            setNewImages(prev => [...prev, ...base64Results]);
        } catch (error) {
            console.error('Error converting images:', error);
            toast.error('Error processing images');
        }
    };

    const handleImageDelete = (imageUrl) => {
        setDeletedImages(prev => [...prev, imageUrl]);
    };

    const FeatureRatings = () => (
        <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
            <h3 className="text-xl font-bold mb-4">Ratings by Feature</h3>
            <div className="grid grid-cols-2 gap-4">
                {Object.entries(featureRatings).map(([feature, rating]) => (
                    <div key={feature} className="flex items-center justify-between">
                        <span className="text-gray-600 capitalize">
                            {feature.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar
                                        key={i}
                                        className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}
                                    />
                                ))}
                            </div>
                            <span className="ml-2 text-gray-700">{rating}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const RatingStats = () => (
        <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold">Customer Reviews</h3>
                    <div className="flex items-center mt-2">
                        <span className="text-3xl font-bold mr-2">
                            {stats?.averageRating?.toFixed(1)}
                        </span>
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    className={i < Math.round(stats?.averageRating) ? "text-yellow-400" : "text-gray-300"}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-gray-600 mt-1">{stats?.totalReviews} global ratings</p>
                </div>
                <div className="w-1/2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center mb-2">
                            <span className="w-16 text-sm">{rating} star</span>
                            <div className="flex-1 mx-4 h-2 bg-gray-200 rounded">
                                <div
                                    className="h-2 bg-yellow-400 rounded"
                                    style={{
                                        width: `${(stats?.ratingBreakdown[rating] / stats?.totalReviews) * 100}%`
                                    }}
                                />
                            </div>
                            <span className="w-12 text-sm text-right">
                                {Math.round((stats?.ratingBreakdown[rating] / stats?.totalReviews) * 100)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                    <h3 className="text-lg font-semibold mb-4">Delete Review</h3>
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to delete this review? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (reviewToDelete) {
                                    onConfirm();
                                }
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto p-4">
            <RatingStats />
            <FeatureRatings />

            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review._id} className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center">
                                    <span className="font-semibold text-lg">
                                        {review.buyer.firstname} {review.buyer.lastname}
                                    </span>
                                    {review.buyer.userType === 'Seller' && (
                                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            Seller
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center mt-1">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar
                                                key={i}
                                                className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-gray-500 text-sm ml-2">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                {userId !== review.buyer._id && (
                                    <button
                                        onClick={() => handleLikeReview(review._id)}
                                        className={`flex items-center space-x-1 ${
                                            review.likes.some(like => like.user === userId)
                                                ? 'text-blue-500'
                                                : 'text-gray-500'
                                        } hover:text-blue-600`}
                                    >
                                        <FaThumbsUp />
                                        <span>{review.likesCount}</span>
                                    </button>
                                )}
                                
                                {userId === review.buyer._id && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditingReview(review._id);
                                                setEditText(review.comment);
                                                setEditRating(review.rating);
                                            }}
                                            className="text-blue-500 hover:text-blue-600"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setReviewToDelete(review._id);
                                                setShowDeleteModal(true);
                                            }}
                                            className="text-red-500 hover:text-red-600 flex items-center space-x-1"
                                        >
                                            <FaTrash />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {editingReview === review._id ? (
                            <div className="mt-4">
                                {/* Rating Stars */}
                                <div className="flex mb-2">
                                    {[...Array(5)].map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setEditRating(index + 1)}
                                            className="text-2xl"
                                        >
                                            <FaStar
                                                className={index < editRating ? "text-yellow-400" : "text-gray-300"}
                                            />
                                        </button>
                                    ))}
                                </div>

                                {/* Comment Text Area */}
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full p-2 border rounded-lg resize-none"
                                    rows="3"
                                />

                                {/* Existing Images */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {review.images
                                        .filter(img => !deletedImages.includes(img))
                                        .map((image, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={image}
                                                    alt={`Review ${index + 1}`}
                                                    className="w-24 h-24 object-cover rounded"
                                                />
                                                <button
                                                    onClick={() => handleImageDelete(image)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                </div>

                                {/* New Image Upload */}
                                <div className="mt-2">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                        id="review-images"
                                    />
                                    <label
                                        htmlFor="review-images"
                                        className="cursor-pointer text-blue-500 hover:text-blue-600"
                                    >
                                        Add Images
                                    </label>
                                </div>

                                {/* Preview New Images */}
                                {newImages.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {newImages.map((file, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`New upload ${index + 1}`}
                                                    className="w-24 h-24 object-cover rounded"
                                                />
                                                <button
                                                    onClick={() => setNewImages(prev => prev.filter((_, i) => i !== index))}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-2 mt-2">
                                    <button
                                        onClick={() => {
                                            setEditingReview(null);
                                            setEditText('');
                                            setEditRating(0);
                                            setNewImages([]);
                                            setDeletedImages([]);
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleEditReview(review._id)}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Update Review
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-700">{review.comment}</p>
                        )}

                        {/* Review Images */}
                        {review.images?.length > 0 && (
                            <div className="flex space-x-2 mt-4">
                                {review.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`Review ${index + 1}`}
                                        className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                                        onClick={() => {/* Handle image preview */}}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Replies Section */}
                        <div className="mt-4 space-y-3">
                            {review.replies.map((reply, index) => (
                                <div key={index} className="ml-8 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="font-medium">
                                                {reply.user.firstname} {reply.user.lastname}
                                            </span>
                                            {reply.userType === 'Seller' && (
                                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                    Seller
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {new Date(reply.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 mt-1">{reply.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setReviewToDelete(null);
                }}
                onConfirm={() => handleDeleteReview(reviewToDelete)}
            />
        </div>
    );
};

export default ReviewComponent;