import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaStar, FaShoppingCart, FaMinus, FaPlus } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import { cartAdd } from "../store/cartSlice";
import { motion } from "framer-motion";
import ProductReviewSection from "../components/ProductReviewSection";
import YouTube from "react-youtube";
import ReviewItem from '../components/ReviewItem';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

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

  useEffect(() => {
    fetchProductDetails();
    if (userData) {
      fetchCartItems();
      checkUserReview();
    }
  }, [id, userData]);

  const fetchProductDetails = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch product details');
      }

      setProduct(data.product);
      if (data.product.images.length > 0) {
        setIsVideo(isYoutubeLink(data.product.images[0]));
      }
      fetchReviews();
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to fetch product details");
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/products/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch reviews');
      }

      setReviews(data.reviews);
      setProductStats({
        averageRating: parseFloat(data.stats.averageRating),
        totalReviews: data.stats.totalReviews,
        ratingCounts: data.stats.ratingCounts
      });
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
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart items");
    }
  };

  const handleAddToCart = async () => {
    if (!userData) {
      toast.error("Please login to add items to cart");
      return;
    }

    setIsAddingToCart(true);
    try {
      const response = await fetch("/api/cart/add", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId: id,
          quantity
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add to cart');
      }

      if (data.success) {
        dispatch(cartAdd());
        toast.success("Added to cart!");
        fetchCartItems();
      }
    } catch (error) {
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
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
      console.log('Submitting review:', formData);

      const response = await fetch(`/api/reviews/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rating: formData.rating,
          comment: formData.comment,
          images: formData.images,
          orderId: formData.orderId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      console.log('Review submission response:', data);

      if (data.success) {
        toast.success('Review submitted successfully!');
        fetchReviews();
        setHasReviewed(true);
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast.error(error.message || 'Failed to submit review');
      throw error;
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
        // First find the review that's being deleted
        const deletedReview = reviews.find(review => review._id === reviewId);
        
        // Remove review from UI immediately
        const updatedReviews = reviews.filter(review => review._id !== reviewId);
        setReviews(updatedReviews);
        
        // Update stats
        setProductStats(calculateProductStats(updatedReviews));
        
        // Reset review status to allow writing a new review
        setHasReviewed(false);
        setCanReview(true);
        
        // Optionally refresh reviews from server
        await fetchReviews();
        
        // Refresh the user's review status
        await checkUserReview();
    } catch (error) {
        console.error('Error handling review deletion:', error);
        toast.error('Error updating review statistics');
        
        // Refresh everything in case of error
        await fetchReviews();
        await checkUserReview();
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Product Section */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Media Gallery */}
        <div className="lg:w-1/2">
          <div className="mb-4 relative h-[400px] md:h-[500px]">
            {isVideo ? (
              <YouTube
                videoId={getYoutubeVideoId(product.images[selectedMedia])}
                opts={{
                  width: "100%",
                  height: "100%",
                  playerVars: { autoplay: 0 },
                }}
                className="w-full h-full rounded-lg overflow-hidden"
              />
            ) : (
              <motion.img
                src={product.images[selectedMedia]}
                alt={product.name}
                className={`w-full h-full object-contain rounded-lg ${
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
            )}
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-5 gap-2">
            {product.images.map((image, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  setSelectedMedia(index);
                  setIsVideo(isYoutubeLink(image));
                }}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                  selectedMedia === index
                    ? "border-blue-500"
                    : "border-gray-200"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isYoutubeLink(image) ? (
                  <div className="relative w-full h-full">
                    <img
                      src={`https://img.youtube.com/vi/${getYoutubeVideoId(
                        image
                      )}/default.jpg`}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                      <FaPlay className="text-white text-xl" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          {/* Rating Summary */}
          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={star <= productStats.averageRating ? "text-yellow-400" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">
              ({productStats.totalReviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-3xl font-bold">₹{product.price}</span>
            <span className="text-gray-600 ml-2">per {product.unitType}</span>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            <span
              className={`${
                product.stock > 0 ? "text-green-600" : "text-red-600"
              } font-semibold`}
            >
              {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
            {product.stock > 0 && (
              <span className="text-gray-600 ml-2">
                ({product.stock} {product.unitType}s available)
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  <FaMinus />
                </button>
                <span className="text-xl font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  <FaPlus />
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <motion.button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAddingToCart}
            className={`w-full py-3 px-6 rounded-lg flex items-center justify-center space-x-2 ${
              product.stock === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white font-medium`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaShoppingCart />
            <span>
              {isAddingToCart
                ? "Adding..."
                : product.stock === 0
                ? "Out of Stock"
                : "Add to Cart"}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-8">Customer Reviews</h2>
        
        {/* Review Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <span className="text-4xl font-bold">{productStats.averageRating}</span>
              <div className="ml-4">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={star <= productStats.averageRating ? "text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <p className="text-gray-600 mt-1">{productStats.totalReviews} reviews</p>
              </div>
            </div>
            
            {/* Rating Breakdown */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center">
                  <span className="w-12">{rating} star</span>
                  <div className="flex-1 mx-4 h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-yellow-400 rounded"
                      style={{
                        width: `${(productStats.ratingCounts[rating] / productStats.totalReviews) * 100 || 0}%`
                      }}
                    />
                  </div>
                  <span className="w-12 text-right">
                    {Math.round((productStats.ratingCounts[rating] / productStats.totalReviews) * 100 || 0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Review Form */}
        {userData && canReview && !hasReviewed && (
          <ProductReviewSection
            productId={id}
            userId={userData._id}
            orderId={orderId}
            onReviewSubmit={handleReviewSubmit}
          />
        )}

        {userData && !canReview && !hasReviewed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-700">
              You need to purchase and receive this product before you can write a review.
            </p>
          </div>
        )}

        {/* Review List */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewItem
              key={review._id}
              review={review}
              currentUserId={userData?._id}
              onDelete={handleReviewDelete}
              onLike={handleReviewLike}
              refreshReviews={fetchReviews}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
