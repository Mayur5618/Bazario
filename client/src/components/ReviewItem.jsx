import React, { useState } from 'react';
import { FaStar, FaHeart, FaEdit, FaTrash, FaRegHeart, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

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
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReviewItem = ({ review, currentUserId, onDelete, onLike, refreshReviews }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedRating, setEditedRating] = useState(review.rating);
    const [editedComment, setEditedComment] = useState(review.comment);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const isOwner = currentUserId === review.buyer._id;
    const isLiked = review.likes?.includes(currentUserId);

    const handleDelete = async () => {
        try {
            setIsSubmitting(true);
            const success = await onDelete(review._id);
            
            if (success) {
                toast.success('Review deleted successfully');
            } else {
                toast.error('Failed to delete review');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error(error.message || 'Failed to delete review');
        } finally {
            setIsSubmitting(false);
            setShowDeleteModal(false);
        }
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
                        {review.buyer.firstname.charAt(0)}
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-800">
                            {review.buyer.firstname} {review.buyer.lastname}
                        </h4>
                        <div className="flex items-center space-x-2">
                            <div className="flex">
                                {[...Array(5)].map((_, index) => (
                                    <FaStar
                                        key={index}
                                        className={`w-3 h-3 ${
                                            index < review.rating
                                                ? 'text-yellow-400'
                                                : 'text-gray-200'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onLike(review._id)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm ${
                            isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                        }`}
                    >
                        {isLiked ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
                        <span>{review.likes?.length || 0}</span>
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
                <p className="text-gray-700 text-sm">{review.comment}</p>
                
                {review.images?.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-4">
                        {review.images.map((image, index) => (
                            <ImageWithSkeleton
                                key={index}
                                src={image}
                                alt={`Review image ${index + 1}`}
                                onClick={() => setSelectedImage(image)}
                            />
                        ))}
                    </div>
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