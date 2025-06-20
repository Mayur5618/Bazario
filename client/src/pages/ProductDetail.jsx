import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaStar, FaShoppingCart, FaMinus, FaPlus, FaPlay, FaHeart, FaRegHeart, FaStore, FaArrowRight, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import { cartAdd, cartRemove } from "../store/cartSlice";
import { motion, AnimatePresence } from "framer-motion";
import ProductReviewSection from "../components/ProductReviewSection";
import YouTube from "react-youtube";
import ReviewItem from '../components/ReviewItem';
import { addToWishlist, removeFromWishlist } from "../store/wishlistSlice";
import ReviewEditModal from '../components/ReviewEditModal';

const ImageViewerModal = ({ images, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
        >
          <FaTimes className="w-6 h-6" />
        </button>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 text-white hover:text-gray-300 p-2"
            >
              <FaChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 text-white hover:text-gray-300 p-2"
            >
              <FaChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Main image */}
        <img
          src={images[currentIndex]}
          alt={`Review image ${currentIndex + 1}`}
          className="max-h-[90vh] max-w-[90vw] object-contain"
        />
      </div>
    </div>
  );
};

const ReviewForm = ({ onSubmit, onClose, orderId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newImages = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large. Max size is 5MB`);
        continue;
      }

      try {
        const base64 = await convertToBase64(file);
        // Store the base64 string directly
        newImages.push({
          url: base64, // Store the base64 string
          name: file.name
        });
        
        toast.success(`${file.name} ready to upload`);
      } catch (error) {
        console.error('Error processing image:', error);
        toast.error(`Failed to process ${file.name}: ${error.message}`);
      }
    }

    setImages([...images, ...newImages]);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
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

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        comment,
        images,
        orderId
      });
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Write a Review</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="text-2xl focus:outline-none"
                  >
                    <span className={`${
                      star <= (hoveredRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your experience with this product..."
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Photos (Optional)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url}
                      alt={`Preview ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {images.length < 5 && (
                <div className="flex items-center justify-center w-full">
                  <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="mt-2 text-sm text-gray-500">Click to upload photos</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">You can upload up to 5 images</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </div>
              ) : (
                'Submit Review'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const isInWishlist = wishlistItems.some(item => item._id === id);

  // Product states
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Media states
  const [selectedMedia, setSelectedMedia] = useState(0);
  const [isVideo, setIsVideo] = useState(false);
  const [imageError, setImageError] = useState({});

  // Review states
  const [reviews, setReviews] = useState([]);
  const [productStats, setProductStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }
  });
  const [hasReviewed, setHasReviewed] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Cart states
  const [cartItems, setCartItems] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartItem, setCartItem] = useState(null);
  const [relatedProductsCart, setRelatedProductsCart] = useState({});

  // Add loading state for wishlist actions
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // Review edit states
  const [editingReview, setEditingReview] = useState(null);

  // Accordion states
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  // Add review prompt state
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);

  const [selectedReviewImages, setSelectedReviewImages] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch product details');
        }

        if (!data.success || !data.product) {
          throw new Error('Product data not found');
        }

        setProduct(data.product);
        if (data.product.youtubeLink) {
          setIsVideo(true);
        }
        fetchReviews();
        
        // Add to recently viewed if user is logged in
        if (userData) {
          await addToRecentlyViewed(data.product);
          // Check if user has completed orders for this product
          checkCompletedOrders();
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message || "Failed to fetch product details");
        toast.error(err.message || "Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    if (userData) {
      fetchCartItems();
      checkUserReview();
      fetchCartItem();
    }
  }, [id, userData]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/products/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch reviews');
      }

      if (data.success) {
        setReviews(data.reviews);
        setProductStats({
          averageRating: parseFloat(data.stats.averageRating),
          totalReviews: data.stats.totalReviews,
          ratingCounts: data.stats.ratingCounts
        });
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
      toast.error('Failed to load reviews');
    }
  };

  const calculateProductStats = (reviewsList) => {
    const stats = {
      averageRating: 0,
      totalReviews: reviewsList.length,
      ratingCounts: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      }
    };

    reviewsList.forEach(review => {
      stats.ratingCounts[review.rating]++;
    });

    if (stats.totalReviews > 0) {
      const totalRating = reviewsList.reduce((sum, review) => sum + review.rating, 0);
      stats.averageRating = (totalRating / stats.totalReviews).toFixed(1);
    }

    return stats;
  };

  const checkUserReview = async () => {
    try {
      const response = await fetch(`/api/reviews/user/product/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check user review');
      }

      setCanReview(data.canReview);
      setHasReviewed(data.hasReviewed);
      setOrderId(data.orderId);
    } catch (error) {
      console.error("Error checking user review:", error);
      setCanReview(false);
      setHasReviewed(false);
    }
  };

  const fetchCartItems = async () => {
    try {
      const response = await fetch("/api/cart/getCartItems", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch cart items');
      }

      setCartItems(data.cart?.items || []);
      
      // Create a map of related products in cart
      const cartMap = {};
      data.cart?.items.forEach(item => {
        cartMap[item.product._id] = item;
      });
      setRelatedProductsCart(cartMap);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart items");
    }
  };

  const fetchCartItem = async () => {
    try {
      const response = await axios.get("/api/cart/getCartItems", {
        withCredentials: true,
      });
      if (response.data.success) {
        const foundItem = response.data.cart.items.find(
          item => item.product._id === id
        );
        setCartItem(foundItem);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const handleAddToCart = async () => {
    if (!userData) {
      toast.error("Please login to add items to cart");
      return;
    }

    setIsAddingToCart(true);
    try {
      const response = await axios.post("/api/cart/add", {
        productId: id,
        quantity: quantity
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        dispatch(cartAdd({
          product: product,
          quantity: quantity
        }));
        
        const updatedCart = await axios.get("/api/cart/getCartItems", {
          withCredentials: true
        });
        const updatedItem = updatedCart.data.cart.items.find(
          item => item.product._id === id
        );
        setCartItem(updatedItem);
        toast.success("Added to cart!");
      }
    } catch (error) {
      console.error("Cart error:", error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity) => {
    if (!userData) {
      toast.error("Please login to update cart");
      return;
    }

    try {
      if (newQuantity < 1) {
        dispatch(cartRemove());
        const response = await axios.delete(`/api/cart/remove/${id}`);
        if (response.data.success) {
          setCartItem(null);
          toast.success("Item removed from cart");
        }
        return;
      }

      if (newQuantity > product.stock) {
        toast.error("Cannot exceed available stock");
        return;
      }

      const response = await axios.put(`/api/cart/update/${id}`, {
        quantity: newQuantity,
      });

      if (response.data.success) {
        const updatedCart = await axios.get("/api/cart/getCartItems");
        const updatedItem = updatedCart.data.cart.items.find(
          item => item.product._id === id
        );
        setCartItem(updatedItem);
        toast.success(`Quantity updated to ${newQuantity}`);
      }
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleReviewSubmit = async (formData) => {
    try {
      if (!userData) {
        toast.error('Please login to submit a review');
        return;
      }

      // First check if user can review
      const checkResponse = await fetch(`/api/reviews/check/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const checkData = await checkResponse.json();

      if (!checkData.success) {
        toast.error(checkData.message || 'Unable to verify review eligibility');
        return;
      }

      if (!checkData.canReview) {
        toast.error('You cannot review this product at this time');
        return;
      }

      // If we have orderId from the check, use it
      const reviewData = {
        rating: formData.rating,
        comment: formData.comment,
        orderId: checkData.orderId,
        images: formData.images ? formData.images.map(img => img.url) : [] // Send base64 strings directly
      };

      console.log('Sending review data:', {
        ...reviewData,
        hasImages: reviewData.images.length > 0,
        imagesCount: reviewData.images.length
      });

      const response = await fetch(`/api/reviews/products/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();
      console.log('Review response:', data);

      if (data.success) {
        // Update reviews list immediately with the new review including images
        const newReview = {
          ...data.review,
          buyer: userData,
          createdAt: new Date().toISOString(),
          likes: [],
          likesCount: 0
        };

        setReviews(prevReviews => [newReview, ...prevReviews]);
        
        // Update product stats
        setProductStats(prev => ({
          ...prev,
          totalReviews: prev.totalReviews + 1,
          ratingCounts: {
            ...prev.ratingCounts,
            [data.review.rating]: (prev.ratingCounts[data.review.rating] || 0) + 1
          },
          averageRating: (
            (prev.averageRating * prev.totalReviews + data.review.rating) / 
            (prev.totalReviews + 1)
          ).toFixed(1)
        }));

        // Update review status
        setHasReviewed(true);
        setCanReview(false);
        setEditingReview(false);
        setShowReviewPrompt(false);

        toast.success('Review submitted successfully!');
        
        // Refresh reviews to ensure everything is in sync
        fetchReviews();
      } else {
        throw new Error(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast.error(error.message || 'Failed to submit review');
    }
  };

  const isYoutubeLink = (url) => {
    return url?.includes("youtube.com") || url?.includes("youtu.be");
  };

  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleReviewDelete = async (reviewId) => {
    try {
      // Find the review before deleting
      const reviewToDelete = reviews.find(review => review._id === reviewId);
      if (!reviewToDelete) {
        throw new Error('Review not found');
      }

      // Make API call first
      const response = await axios.delete(`/api/reviews/${reviewId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        // Update UI after successful API call
        setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
        
        // Update product stats
        setProductStats(prev => ({
          ...prev,
          totalReviews: prev.totalReviews - 1,
          ratingCounts: {
            ...prev.ratingCounts,
            [reviewToDelete.rating]: prev.ratingCounts[reviewToDelete.rating] - 1
          }
        }));
        
        // Reset review status immediately
        setHasReviewed(false);
        setCanReview(true);
        
        // Show success message
        toast.success('Review deleted successfully');
        
        // Refresh data in background
        fetchReviews();
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error.message || 'Failed to delete review');
      // Revert UI changes if API call fails
      await fetchReviews();
      await checkUserReview();
      return false;
    }
  };

  const handleReviewLike = async (reviewId, isLiked) => {
    // Find the review that's being liked/unliked
    const reviewToUpdate = reviews.find(review => review._id === reviewId);
    if (!reviewToUpdate) return;

    // Check if user has already liked
    const hasLiked = reviewToUpdate.likes?.includes(userData._id);

    // Update the reviews state optimistically
    setReviews(prev => prev.map(review => {
        if (review._id === reviewId) {
            const updatedLikes = hasLiked
                ? review.likes.filter(id => id !== userData._id) // Remove like
                : [...(review.likes || []), userData._id];       // Add like
            
            return {
                ...review,
                likes: updatedLikes,
                likesCount: updatedLikes.length
            };
        }
        return review;
    }));

    try {
        const response = await fetch(`/api/reviews/${reviewId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            // If the API call fails, revert the optimistic update
            await fetchReviews();
            throw new Error('Failed to update like');
        }
    } catch (error) {
        console.error('Like error:', error);
        toast.error('Failed to update like');
        // Revert changes on error
        await fetchReviews();
    }
  };

  const handleWishlist = async () => {
    if (!userData) {
      toast.error("Please login to manage wishlist");
      navigate('/login');
      return;
    }

    setIsWishlistLoading(true);
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      };

      if (!isInWishlist) {
        const response = await axios.post('/api/wishlist/add', {
          productId: id
        }, config);

        if (response.data.success) {
          dispatch(addToWishlist(product));
          toast.success("Added to wishlist");
        }
      } else {
        const response = await axios.delete(`/api/wishlist/remove/${id}`, config);

        if (response.data.success) {
          dispatch(removeFromWishlist(id));
          toast.success("Removed from wishlist");
        }
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error(error.response?.data?.message || "Failed to update wishlist");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const addToRecentlyViewed = async (product) => {
    if (!userData || !product || !product._id) return;

    try {
        await axios.post('/api/recently-viewed/add', {
            productId: product._id
        }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    } catch (error) {
        console.error('Error updating recently viewed products:', error);
    }
  };

  const handleRelatedProductAddToCart = async (relatedProduct) => {
    if (!userData) {
      toast.error("Please login to add items to cart");
      return;
    }

    try {
      const response = await axios.post("/api/cart/add", {
        productId: relatedProduct._id,
        quantity: 1
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        dispatch(cartAdd({
          product: relatedProduct,
          quantity: 1
        }));
        
        const updatedCart = await axios.get("/api/cart/getCartItems", {
          withCredentials: true
        });
        
        // Update related products cart map
        const cartMap = {};
        updatedCart.data.cart.items.forEach(item => {
          cartMap[item.product._id] = item;
        });
        setRelatedProductsCart(cartMap);
        
        toast.success("Added to cart!");
      }
    } catch (error) {
      console.error("Cart error:", error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  const handleRelatedProductQuantity = async (productId, newQuantity) => {
    if (!userData) {
      toast.error("Please login to update cart");
      return;
    }

    try {
      if (newQuantity < 1) {
        const response = await axios.delete(`/api/cart/remove/${productId}`);
        if (response.data.success) {
          dispatch(cartRemove(productId));
          setRelatedProductsCart(prev => {
            const updated = { ...prev };
            delete updated[productId];
            return updated;
          });
          toast.success("Item removed from cart");
        }
        return;
      }

      // Find the related product
      const relatedProduct = product?.relatedProducts?.find(p => p._id === productId);
      if (!relatedProduct) {
        toast.error("Product not found");
        return;
      }

      // Check stock
      if (newQuantity > relatedProduct.stock) {
        toast.error("Cannot exceed available stock");
        return;
      }

      const response = await axios.put(`/api/cart/update/${productId}`, {
        quantity: newQuantity
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        // Update local state first
        const updatedCart = await axios.get("/api/cart/getCartItems", {
          withCredentials: true
        });
        
        const cartMap = {};
        updatedCart.data.cart.items.forEach(item => {
          cartMap[item.product._id] = item;
        });
        setRelatedProductsCart(cartMap);

        // Update Redux state without incrementing cart count
        dispatch({
          type: 'cart/updateQuantity',
          payload: {
            productId,
            quantity: newQuantity
          }
        });
        
        toast.success(`Quantity updated to ${newQuantity}`);
      }
    } catch (error) {
      console.error("Update quantity error:", error);
      toast.error(error.response?.data?.message || "Failed to update quantity");
    }
  };

  const handleCategoryClick = (slug) => {
    console.log('Navigating to:', `/products?category=${slug}`);
    navigate(`/products?category=${slug}`);
  };

  // Add this function to handle review edit
  const handleReviewEdit = async (updatedReview) => {
    try {
      // Update the reviews state with the edited review
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review._id === updatedReview._id ? updatedReview : review
        )
      );

      // Recalculate product stats
      const updatedStats = calculateProductStats(reviews.map(review => 
        review._id === updatedReview._id ? updatedReview : review
      ));
      setProductStats(updatedStats);
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
    }
  };

  const checkCompletedOrders = async () => {
    try {
      const response = await fetch(`/api/orders/check-purchase/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success || data.hasPurchased) {
        setShowReviewPrompt(!data.hasReviewed);
        setCanReview(true);
        setHasReviewed(data.hasReviewed);
      }
    } catch (error) {
      console.error('Error checking completed orders:', error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-2 md:py-8">
      {/* Product Section */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-8 mb-8 md:mb-16">
        {/* Media Gallery */}
        <div className="lg:w-1/2">
          {/* Main Image Container */}
          <div className="relative aspect-square md:h-[500px] bg-white rounded-lg overflow-hidden">
            {/* Wishlist Button - Moved to top-right of image */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleWishlist}
              disabled={isWishlistLoading}
              className={`absolute top-2 right-2 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-colors ${
                isInWishlist 
                  ? 'text-red-500' 
                  : 'text-gray-600 hover:text-red-500'
              }`}
            >
              {isWishlistLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                />
              ) : isInWishlist ? (
                <FaHeart className="text-lg md:text-xl" />
              ) : (
                <FaRegHeart className="text-lg md:text-xl" />
              )}
            </motion.button>

            {selectedMedia < product.images.length ? (
              <motion.img
                src={product.images[selectedMedia]}
                alt={product.name}
                className={`w-full h-full object-contain ${
                  product.stock <= 0 ? "opacity-50 grayscale" : ""
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onError={(e) => {
                  setImageError((prev) => ({ ...prev, [selectedMedia]: true }));
                  e.target.src = "/placeholder-image.jpg";
                }}
              />
            ) : isVideo && product.youtubeLink ? (
              <YouTube
                videoId={getYoutubeVideoId(product.youtubeLink)}
                opts={{
                  width: "100%",
                  height: "100%",
                  playerVars: { autoplay: 0 },
                }}
                className="w-full h-full"
              />
            ) : null}
          </div>

          {/* Thumbnails Grid */}
          <div className="grid grid-cols-5 gap-1.5 md:gap-2 mt-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedMedia(index);
                  setIsVideo(false);
                }}
                className={`relative aspect-square rounded-md md:rounded-lg overflow-hidden border ${
                  selectedMedia === index
                    ? "border-blue-500"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            {product.youtubeLink && (
              <button
                onClick={() => {
                  setSelectedMedia(product.images.length);
                  setIsVideo(true);
                }}
                className={`relative aspect-square rounded-md md:rounded-lg overflow-hidden border ${
                  selectedMedia === product.images.length && isVideo
                    ? "border-blue-500"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="relative w-full h-full">
                  <img
                    src={`https://img.youtube.com/vi/${getYoutubeVideoId(product.youtubeLink)}/default.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                    <FaPlay className="text-white text-xl" />
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Product Info - Updated Mobile Styling */}
        <div className="lg:w-1/2">
          <div className="sticky top-4">
            <h1 className="text-xl md:text-3xl font-bold mb-3 md:mb-4 text-gray-900">{product.name}</h1>
            
            {/* Rating Summary - Enhanced */}
            <div className="flex items-center mb-3 md:mb-4 bg-gray-50 p-2 md:p-3 rounded-lg">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`w-4 h-4 md:w-5 md:h-5 ${
                      star <= productStats.averageRating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm md:text-base text-gray-600 font-medium">
                {productStats.averageRating} ({productStats.totalReviews} reviews)
              </span>
            </div>

            {/* Price - Enhanced */}
            <div className="mb-4 md:mb-6 bg-white p-2 md:p-3 rounded-lg shadow-sm">
              <span className="text-2xl md:text-4xl font-bold text-gray-900">₹{product.price}</span>
              <span className="text-sm md:text-base text-gray-600 ml-2">per {product.unitType}</span>
            </div>

            {/* Cart Controls */}
            <div className="mb-4 md:mb-6">
                {product.stock > 0 ? (
                  <AnimatePresence mode="wait">
                    {cartItem ? (
                      <motion.div
                        key="quantity-controls"
                        className="flex items-center border-2 border-blue-600 justify-between rounded-xl overflow-hidden"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "backOut" }}
                      >
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUpdateQuantity(cartItem.quantity - 1)}
                        className="px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 text-white font-medium text-lg md:text-xl"
                        >
                          -
                        </motion.button>

                      <span className="text-lg md:text-xl font-medium min-w-[40px] md:min-w-[60px] text-center">
                              {cartItem.quantity}
                      </span>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUpdateQuantity(cartItem.quantity + 1)}
                        className="px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 text-white font-medium text-lg md:text-xl"
                          disabled={cartItem.quantity >= product.stock}
                        >
                          +
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="add-button"
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddToCart}
                      className="w-full py-2.5 md:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                        disabled={isAddingToCart}
                      >
                        {isAddingToCart ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <>
                          <FaShoppingCart className="text-base md:text-lg" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </motion.button>
                    )}
                  </AnimatePresence>
                ) : (
                <div className="text-red-500 text-center py-2.5 md:py-3 bg-red-50 rounded-xl text-sm md:text-base">
                    Out of Stock
                  </div>
                )}
            </div>

            {/* Shop Now Button */}
            <div className="mb-4 md:mb-6">
                <button 
                    onClick={() => {
                        if (!userData) {
                            toast.error("Please login to continue shopping");
                            navigate('/login');
                            return;
                        }
                        if (product.stock <= 0) {
                            toast.error("Product is out of stock");
                            return;
                        }
                        // Navigate to checkout with properly structured product details
                        navigate('/checkout', {
                            state: {
                                items: [{
                                    product: {
                                        _id: product._id
                                    },
                                    quantity: 1
                                }],
                                totalAmount: product.price,
                                buyNow: true,
                                directOrder: true
                            }
                        });
                    }}
                    className="w-full bg-violet-600 text-white py-2.5 md:py-3 px-4 rounded-xl hover:bg-violet-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm md:text-base font-medium"
                    disabled={product.stock <= 0}
                >
                    <FaStore className="text-base md:text-lg" />
                    {product.stock <= 0 ? 'Out of Stock' : 'Shop Now'}
                </button>
            </div>

            {/* Seller Info - Compact */}
            <Link 
              to={`/users/sellers/${product.seller._id}`}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex-shrink-0">
                  <img 
                    src={product.seller.profileImage || '/default-shop.png'} 
                    alt={product.seller.shopName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{product.seller.shopName}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>• {product.seller.productsCount} Products</span>
                  </div>
                </div>
              </div>
              <FaArrowRight className="text-gray-400" />
            </Link>


            {/* Product Description and Reviews Accordion for Mobile */}
            <div className="mt-4 md:mt-8">
              {/* Product Description Accordion */}
              <div className="bg-white rounded-lg overflow-hidden mb-2 border border-gray-200">
                <button
                  onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                >
                  <span className="text-base font-medium text-gray-900">Product Description</span>
                  <motion.div
                    animate={{ rotate: isDescriptionOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isDescriptionOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 py-3 text-sm text-gray-700 border-t border-gray-100 bg-gray-50">
                        <pre className="whitespace-pre-wrap font-sans">
                          {product.description || "No description available"}
                        </pre>
              </div>
                    </motion.div>
            )}
                </AnimatePresence>
      </div>

              {/* Reviews & Ratings Accordion */}
              <div className="bg-white rounded-lg overflow-hidden">
                <button
                  onClick={() => setIsReviewsOpen(!isReviewsOpen)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-base font-medium text-gray-900">
                    Reviews & Ratings ({productStats.totalReviews})
                  </span>
                  <motion.div
                    animate={{ rotate: isReviewsOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isReviewsOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t">
                        {/* Rating Summary */}
                        <div className="p-4 border-b">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-3xl font-bold text-gray-900">{productStats.averageRating}</span>
                              <div className="flex flex-col">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                                      className={`w-3 h-3 ${
                                        star <= productStats.averageRating ? "text-yellow-400" : "text-gray-300"
                                      }`}
                  />
                ))}
              </div>
                                <span className="text-xs text-gray-500">{productStats.totalReviews} ratings</span>
            </div>
          </div>
                            {userData && (
                              <button
                                onClick={() => {
                                  if (!userData) {
                                    toast.error("Please login to write a review");
                                    return;
                                  }
                                  if (!canReview) {
                                    toast.error("You need to purchase this product first to review it");
                                    return;
                                  }
                                  if (hasReviewed) {
                                    toast.error("You have already reviewed this product");
                                    return;
                                  }
                                  setEditingReview(true);
                                }}
                                className={`px-4 py-2 ${
                                  canReview && !hasReviewed
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-gray-400 cursor-not-allowed"
                                } text-white rounded-lg transition-colors text-sm font-medium`}
                              >
                                {hasReviewed 
                                  ? "Already Reviewed"
                                  : canReview 
                                    ? "Write a Review"
                                    : "Purchase to Review"}
                              </button>
                            )}
                          </div>
                          {/* Rating Bars */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
                              <div key={rating} className="flex items-center text-sm">
                                <div className="flex items-center w-12">
                                  <span>{rating}</span>
                                  <FaStar className="w-3 h-3 text-yellow-400 ml-1" />
                                </div>
                                <div className="flex-1 mx-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-yellow-400 rounded-full"
                    style={{
                      width: `${(productStats.ratingCounts[rating] / productStats.totalReviews) * 100 || 0}%`
                    }}
                  />
                </div>
                                <span className="w-8 text-xs text-gray-500">
                                  {productStats.ratingCounts[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>

                        {/* Reviews List */}
                        <div className="divide-y">
                          {reviews.length > 0 ? (
                            reviews.map((review) => (
                              <div key={review._id} className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                                      {review.buyer.profileImage ? (
                                        <img 
                                          src={review.buyer.profileImage}
                                          alt={`${review.buyer.firstname} ${review.buyer.lastname}`}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <span className="text-sm font-medium text-gray-600">
                                            {review.buyer.firstname.charAt(0).toUpperCase()}
                                          </span>
          </div>
        )}
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900">
                                        {`${review.buyer.firstname} ${review.buyer.lastname}`}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        <div className="flex text-yellow-400">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                              key={star}
                                              className={`w-3 h-3 ${
                                                star <= review.rating ? "text-yellow-400" : "text-gray-300"
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
                                  {userData?._id === review.buyer._id && (
                                    <button
                                      onClick={() => setEditingReview(review)}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                                {review.images && review.images.length > 0 && (
                                  <div className="flex gap-2 mb-2">
                                    {review.images.map((image, index) => (
                                      <img
                                        key={index}
                                        src={image}
                                        alt={`Review ${index + 1}`}
                                        className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => {
                                          setSelectedReviewImages(review.images);
                                          setSelectedImageIndex(index);
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={() => handleReviewLike(review._id)}
                                    className={`flex items-center gap-1 text-xs ${
                                      review.likes?.includes(userData?._id)
                                        ? "text-blue-600"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905 0 .905.714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                    <span>{review.likes?.length || 0}</span>
                                  </button>
                                  {userData?._id === review.buyer._id && (
                                    <button
                                      onClick={() => handleReviewDelete(review._id)}
                                      className="text-xs text-red-500"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              No reviews yet. Be the first to review this product!
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-8 md:mt-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900">Related Products</h2>
            <Link 
              to={`/products/category/${product.category.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-')}`}
              className="text-sm md:text-base text-blue-600 hover:text-blue-800 flex items-center gap-1 md:gap-2 font-medium"
            >
              View All
              <FaArrowRight className="text-xs md:text-sm" />
            </Link>
          </div>

          <div className="relative">
            {product.relatedProducts?.length > 0 && (
              <>
                <button 
                  onClick={() => {
                    const container = document.getElementById('related-products-container');
                    const scrollAmount = window.innerWidth < 640 ? 160 : 240; // Smaller scroll for mobile
                    container.scrollLeft -= scrollAmount;
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm shadow-lg rounded-full p-1.5 sm:p-2 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ transform: 'translate(-5px, -50%)' }}
                >
                  <FaChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <button 
                  onClick={() => {
                    const container = document.getElementById('related-products-container');
                    const scrollAmount = window.innerWidth < 640 ? 160 : 240; // Smaller scroll for mobile
                    container.scrollLeft += scrollAmount;
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm shadow-lg rounded-full p-1.5 sm:p-2 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ transform: 'translate(5px, -50%)' }}
                >
                  <FaChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </>
            )}
            
            <div 
              id="related-products-container"
              className="flex overflow-x-auto hide-scrollbar scroll-smooth gap-2 sm:gap-4 pb-4"
              style={{ scrollBehavior: 'smooth' }}
            >
              {product.relatedProducts?.map((relatedProduct) => (
                <div 
                  key={relatedProduct._id}
                  className="flex-shrink-0 w-[160px] sm:w-[240px] bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
                >
                  <Link to={`/product/${relatedProduct._id}`} className="block">
                    <div className="relative pt-[100%] overflow-hidden rounded-t-lg">
                      <img
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {relatedProduct.stock <= 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white text-xs sm:text-sm font-medium">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2 sm:p-3">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm sm:text-lg font-bold text-gray-900">₹{relatedProduct.price}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex">
                          {[...Array(5)].map((_, index) => (
                            <FaStar
                              key={index}
                              className={`w-2 h-2 sm:w-3 sm:h-3 ${
                                index < (relatedProduct.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-600">
                          ({relatedProduct.reviews?.length || 0})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] sm:text-xs">
                        <span className={`font-medium ${relatedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {relatedProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <span className="text-gray-500">Stock: {relatedProduct.stock}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add this CSS to hide scrollbar but keep functionality */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>

      {/* Add Review Prompt */}
      {showReviewPrompt && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm border border-blue-100 animate-slide-up">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">Share your experience!</h3>
              <p className="text-xs text-gray-500 mt-1">
                You've purchased this product. Help others by sharing your review.
              </p>
            </div>
            <button 
              onClick={() => setShowReviewPrompt(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => {
              setEditingReview(true);
              setShowReviewPrompt(false);
            }}
            className="mt-3 w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Write a Review
          </button>
        </div>
      )}

      {editingReview && (
        <ReviewForm
          onSubmit={handleReviewSubmit}
          onClose={() => setEditingReview(false)}
          orderId={orderId}
        />
      )}

      {selectedReviewImages && (
        <ImageViewerModal
          images={selectedReviewImages}
          startIndex={selectedImageIndex}
          onClose={() => setSelectedReviewImages(null)}
        />
      )}
    </div>
  );
};

export default ProductDetail;