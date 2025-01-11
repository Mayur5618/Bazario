import { useState } from 'react';
import { FaStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ReviewItem = ({ review, userData, onReplySubmitted }) => {
    const [isLiked, setIsLiked] = useState(
        review.likes?.some(like => like.user === userData?._id)
    );
    const [likesCount, setLikesCount] = useState(review.likes?.length || 0);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLike = async () => {
        if (!userData) {
            toast.error('Please login to like reviews');
            return;
        }

        try {
            const response = await axios.post(
                `/api/reviews/${review._id}/like`,
                {},
                { withCredentials: true }
            );

            setIsLiked(response.data.isLiked);
            setLikesCount(response.data.likesCount);
        } catch (error) {
            toast.error('Error updating like');
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            setIsSubmitting(true);
            const response = await axios.post(
                `/api/reviews/${review._id}/reply`,
                { comment: replyText },
                { withCredentials: true }
            );

            if (response.data.success) {
                toast.success('Reply added successfully');
                setReplyText('');
                setShowReplyForm(false);
                if (onReplySubmitted) {
                    onReplySubmitted(response.data.review);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding reply');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="border-b pb-6 mb-6">
            {/* Review Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <span className="font-medium">
                        {review.buyer.firstname} {review.buyer.lastname}
                    </span>
                    <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                            <FaStar
                                key={i}
                                className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                            />
                        ))}
                    </div>
                </div>
                <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                </span>
            </div>

            {/* Review Content */}
            <p className="text-gray-700 mb-4">{review.comment}</p>

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto">
                    {review.images.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="w-20 h-20 object-cover rounded"
                        />
                    ))}
                </div>
            )}

            {/* Like and Reply Buttons */}
            <div className="flex items-center gap-4 mt-4">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 ${
                        isLiked ? 'text-red-500' : 'text-gray-500'
                    }`}
                >
                    {isLiked ? <FaHeart /> : <FaRegHeart />}
                    <span>{likesCount}</span>
                </button>
                <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="text-blue-600 hover:text-blue-700"
                >
                    Reply
                </button>
            </div>

            {/* Reply Form */}
            {showReplyForm && (
                <form onSubmit={handleReplySubmit} className="mt-4">
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        placeholder="Write your reply..."
                    ></textarea>
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            type="button"
                            onClick={() => setShowReplyForm(false)}
                            className="px-3 py-1 text-gray-600 hover:text-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-3 py-1 rounded-md text-white ${
                                isSubmitting
                                    ? 'bg-gray-400'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            )}

            {/* Replies */}
            {review.replies && review.replies.length > 0 && (
                <div className="ml-8 mt-4 space-y-4">
                    {review.replies.map((reply, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">
                                    {reply.user.firstname} {reply.user.lastname}
                                    <span className="text-sm text-gray-500 ml-2">
                                        ({reply.userType})
                                    </span>
                                </span>
                                <span className="text-sm text-gray-500">
                                    {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-700">{reply.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewItem; 