import React, { useState, useEffect } from 'react';
import { FaStar, FaHeart, FaEdit, FaTrash, FaRegHeart, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ImagePreviewModal = ({ isOpen, onClose, imageUrl }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
                <button
                    onClick={onClose}
                    className="absolute -top-10 right-0 text-white hover:text-gray-300"
                >
                    <FaTimes size={24} />
                </button>
                <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-contain rounded-lg"
                />
            </div>
        </div>
    );
};

const ImageWithSkeleton = ({ src, alt, onClick }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <div 
            className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:scale-105 transition-transform"
            onClick={onClick}
        >
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 shimmer"
                    />
                )}
            </AnimatePresence>

            <img
                src={src}
                alt={alt}
                className={`w-full h-full object-cover transition-all duration-300 ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setError(true);
                }}
            />

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-xs">
                    Error
                </div>
            )}
        </div>
    );
};

const EditReviewForm = ({ review, onSave, onCancel }) => {
    const [editedRating, setEditedRating] = useState(review.rating);
    const [editedComment, setEditedComment] = useState(review.comment);
    const [hover, setHover] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editedComment.trim()) {
            toast.error('Please write a review');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await axios.put(
                `/api/products/${review.product}/reviews/${review._id}`,
                {
                    rating: editedRating,
                    comment: editedComment
                },
                { withCredentials: true }
            );

            if (response.data.success) {
                onSave(response.data.review);
            }
        } catch (error) {
            console.error('Update review error:', error);
            // Instead of showing error toast, just silently log the error
            // and keep the form open for the user to try again
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
                <span className="text-gray-700">Your Rating:</span>
                <div className="flex">
                    {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                            <FaStar
                                key={index}
                                className={`cursor-pointer w-6 h-6 ${
                                    ratingValue <= (hover || editedRating)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                }`}
                                onClick={() => setEditedRating(ratingValue)}
                                onMouseEnter={() => setHover(ratingValue)}
                                onMouseLeave={() => setHover(0)}
                            />
                        );
                    })}
                </div>
            </div>

            <textarea
                value={editedComment}
                onChange={(e) => setEditedComment(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Write your review here..."
                minLength="5"
                maxLength="500"
            ></textarea>

            <div className="flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 rounded-lg text-white ${
                        isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Delete Review</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this review? This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReviewItem = ({ review, currentUserId, onDelete, onUpdate, onLike }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentReview, setCurrentReview] = useState(review);

    const isOwner = currentUserId === currentReview.buyer._id;
    const isLiked = currentReview.likes?.includes(currentUserId);

    useEffect(() => {
        setCurrentReview(review);
    }, [review]);

    const handleDelete = async () => {
        try {
            setIsSubmitting(true);
            const response = await axios.delete(
                `/api/products/${currentReview.product}/reviews/${currentReview._id}`,
                { withCredentials: true }
            );
            
            if (response.data.success) {
                setShowDeleteModal(false);
                onDelete(currentReview._id);
                toast.success('Review deleted successfully');
                return;
            }
        } catch (error) {
            console.error('Delete review error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete review');
        } finally {
            setIsSubmitting(false);
            setShowDeleteModal(false);
        }
    };

    const handleLike = async () => {
        try {
            const response = await axios.post(
                `/api/products/${currentReview.product}/reviews/${currentReview._id}/like`,
                {},
                { withCredentials: true }
            );
            
            if (response.data.success) {
                onLike(currentReview._id, response.data.isLiked);
            }
        } catch (error) {
            console.error('Like review error:', error);
            toast.error('Failed to update like');
        }
    };

    const handleSaveEdit = (updatedReview) => {
        setIsEditing(false);
        setCurrentReview(updatedReview);
        onUpdate(updatedReview);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow duration-300 p-4"
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {currentReview.buyer.firstname.charAt(0)}
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-800">
                            {currentReview.buyer.firstname} {currentReview.buyer.lastname}
                        </h4>
                        <div className="flex items-center space-x-2">
                            <div className="flex">
                                {[...Array(5)].map((_, index) => (
                                    <FaStar
                                        key={index}
                                        className={`w-3 h-3 ${
                                            index < currentReview.rating
                                                ? 'text-yellow-400'
                                                : 'text-gray-200'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-gray-500">
                                {new Date(currentReview.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleLike}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm ${
                            isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                        }`}
                    >
                        {isLiked ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
                        <span>{currentReview.likes?.length || 0}</span>
                    </button>
                    
                    {isOwner && (
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1 text-blue-500 hover:bg-blue-50 rounded-full"
                            >
                                <FaEdit size={14} />
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                            >
                                <FaTrash size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-3">
                {isEditing ? (
                    <EditReviewForm
                        review={currentReview}
                        onSave={handleSaveEdit}
                        onCancel={() => setIsEditing(false)}
                    />
                ) : (
                    <>
                        <p className="text-gray-700 text-sm">{currentReview.comment}</p>
                        
                        {currentReview.images?.length > 0 && (
                            <div className="flex flex-wrap gap-3 mt-4">
                                {currentReview.images.map((image, index) => (
                                    <ImageWithSkeleton
                                        key={index}
                                        src={image}
                                        alt={`Review image ${index + 1}`}
                                        onClick={() => setSelectedImage(image)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => !isSubmitting && setShowDeleteModal(false)}
                onConfirm={handleDelete}
            />

            <ImagePreviewModal
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                imageUrl={selectedImage}
            />
        </motion.div>
    );
};

export default ReviewItem; 