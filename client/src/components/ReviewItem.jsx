import React, { useState } from 'react';
import { FaStar, FaHeart, FaEdit, FaTrash, FaRegHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const ReviewItem = ({ 
    review, 
    currentUserId, 
    onDelete, 
    onLike, 
    refreshReviews 
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedRating, setEditedRating] = useState(review.rating);
    const [editedComment, setEditedComment] = useState(review.comment);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const isOwner = currentUserId === review.buyer._id;
    const isLiked = review.likes?.includes(currentUserId);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!isOwner) {
            toast.error("You can only edit your own reviews");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/reviews/${review._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    rating: editedRating,
                    comment: editedComment,
                    images: review.images
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update review');
            }

            toast.success('Review updated successfully');
            setIsEditing(false);
            refreshReviews();
        } catch (error) {
            console.error('Update review error:', error);
            toast.error(error.message || 'Failed to update review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!isOwner) {
            toast.error("You can only delete your own reviews");
            return;
        }

        try {
            const response = await fetch(`/api/reviews/${review._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete review');
            }

            toast.success('Review deleted successfully');
            onDelete(review._id);
        } catch (error) {
            console.error('Delete review error:', error);
            toast.error(error.message || 'Failed to delete review');
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleLike = async () => {
        if (!currentUserId) {
            toast.error("Please login to like reviews");
            return;
        }

        try {
            const response = await fetch(`/api/reviews/${review._id}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to toggle like');
            }

            onLike(review._id, data.isLiked);
        } catch (error) {
            console.error('Like review error:', error);
            toast.error(error.message || 'Failed to like review');
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
        >
            {/* Review Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                            {review.buyer.firstname.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800">
                                {review.buyer.firstname} {review.buyer.lastname}
                            </h4>
                            <div className="flex items-center mt-1">
                                <div className="flex">
                                    {[...Array(5)].map((_, index) => (
                                        <FaStar
                                            key={index}
                                            className={`w-4 h-4 ${
                                                index < review.rating
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500 ml-2">
                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleLike}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                        >
                            {isLiked ? (
                                <FaHeart className="text-red-500 w-4 h-4" />
                            ) : (
                                <FaRegHeart className="text-gray-400 w-4 h-4" />
                            )}
                            <span className="text-sm text-gray-600">{review.likes?.length || 0}</span>
                        </button>
                        
                        {isOwner && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors duration-200"
                                >
                                    <FaEdit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-colors duration-200"
                                >
                                    <FaTrash className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Content */}
            <div className="p-6">
                {isEditing ? (
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rating
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setEditedRating(star)}
                                        className="focus:outline-none"
                                    >
                                        <FaStar
                                            className={`w-6 h-6 ${
                                                star <= editedRating
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-200'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Review
                            </label>
                            <textarea
                                value={editedComment}
                                onChange={(e) => setEditedComment(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                rows="4"
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200"
                            >
                                {isSubmitting ? 'Updating...' : 'Update Review'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        {review.images?.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                                {review.images.map((image, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                        <img
                                            src={image}
                                            alt={`Review ${index + 1}`}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Review"
                message="Are you sure you want to delete this review? This action cannot be undone."
            />
        </motion.div>
    );
};

export default ReviewItem; 