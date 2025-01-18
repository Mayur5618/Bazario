import React, { useState } from 'react';
import { FaStar, FaHeart, FaEdit, FaTrash } from 'react-icons/fa';
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
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white p-6 rounded-lg shadow-md mb-4"
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">
                                {review.buyer.firstname} {review.buyer.lastname}
                            </h4>
                            {!isEditing && (
                                <div className="flex">
                                    {[...Array(5)].map((_, index) => (
                                        <FaStar
                                            key={index}
                                            className={`${
                                                index < review.rating
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="text-gray-500 text-sm">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleLike}
                            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                                isLiked ? 'text-red-500' : 'text-gray-400'
                            }`}
                        >
                            <FaHeart />
                            <span className="ml-1 text-sm">{review.likes?.length || 0}</span>
                        </button>
                        {isOwner && (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-blue-500"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-red-500"
                                >
                                    <FaTrash />
                                </button>
                            </>
                        )}
                    </div>
                </div>

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
                                            className={`text-2xl ${
                                                star <= editedRating
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comment
                            </label>
                            <textarea
                                value={editedComment}
                                onChange={(e) => setEditedComment(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                rows="4"
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {isSubmitting ? 'Updating...' : 'Update Review'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <p className="text-gray-700">{review.comment}</p>
                        {review.images?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {review.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`Review ${index + 1}`}
                                        className="w-24 h-24 object-cover rounded-lg"
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </motion.div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Review"
                message="Are you sure you want to delete this review? This action cannot be undone."
            />
        </>
    );
};

export default ReviewItem; 