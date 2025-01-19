import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaStar, FaShoppingCart, FaMinus, FaPlus, FaPlay, FaHeart, FaRegHeart } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import { cartAdd, cartRemove } from "../store/cartSlice";
import { motion, AnimatePresence } from "framer-motion";
import ProductReviewSection from "../components/ProductReviewSection";
import YouTube from "react-youtube";
import ReviewItem from '../components/ReviewItem';
import { addToWishlist, removeFromWishlist } from "../store/wishlistSlice";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const isInWishlist = wishlistItems.includes(id);

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

  useEffect(() => {
    fetchProductDetails();
    if (userData) {
      fetchCartItems();
      checkUserReview();
      fetchCartItem();
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
        quantity: 1,
      });

      if (response.data.success) {
        dispatch(cartAdd());
        const updatedCart = await axios.get("/api/cart/getCartItems");
        const updatedItem = updatedCart.data.cart.items.find(
          item => item.product._id === id
        );
        setCartItem(updatedItem);
        toast.success("Added to cart!");
      }
    } catch (error) {
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
            let errorMessage = data.message || 'Failed to submit review';
            
            // Handle specific validation errors
            if (data.error?.includes('validation failed')) {
                if (data.error.includes('comment')) {
                    errorMessage = 'Review must be at least 5 characters long';
                } else if (data.error.includes('rating')) {
                    errorMessage = 'Please select a valid rating (1-5)';
                }
            }
            
            throw new Error(errorMessage);
        }

        if (data.success) {
            toast.success('Review submitted successfully!');
            fetchReviews();
            setHasReviewed(true);
        }
    } catch (error) {
        throw error; // Let ProductReviewSection handle the error
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

  const handleWishlist = () => {
    if (!userData) {
      toast.error("Please login to manage wishlist");
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist(id));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishlist(id));
      toast.success("Added to wishlist");
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
          {/* Main Image Container */}
          <div className="mb-4 relative h-[400px] md:h-[500px] bg-white rounded-lg overflow-hidden">
            {isVideo ? (
              <YouTube
                videoId={getYoutubeVideoId(product.images[selectedMedia])}
                opts={{
                  width: "100%",
                  height: "100%",
                  playerVars: { autoplay: 0 },
                }}
                className="w-full h-full"
              />
            ) : (
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
            )}
          </div>

          {/* Thumbnails Grid */}
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
                    : "border-gray-200 hover:border-blue-300"
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

        {/* Product Info - Updated Styling */}
        <div className="lg:w-1/2">
          <div className="sticky top-4">
            <h1 className="text-3xl font-bold mb-4 text-gray-900">{product.name}</h1>
            
            {/* Rating Summary - Enhanced */}
            <div className="flex items-center mb-4 bg-gray-50 p-3 rounded-lg">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`w-5 h-5 ${
                      star <= productStats.averageRating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-600 font-medium">
                {productStats.averageRating} ({productStats.totalReviews} reviews)
              </span>
            </div>

            {/* Price - Enhanced */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <span className="text-4xl font-bold text-gray-900">₹{product.price}</span>
              <span className="text-gray-600 ml-2">per {product.unitType}</span>
            </div>

            {/* Stock Status - Improved */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Stock Status</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {product.stock > 0 ? (
                      <>
                        <span className="text-green-600 font-medium">{product.stock}</span>
                        <span> {product.unitType}s available</span>
                      </>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {product.stock > 10 
                    ? "Plenty in stock"
                    : product.stock > 5 
                    ? "Limited stock"
                    : product.stock > 0 
                    ? "Low stock"
                    : "Currently unavailable"}
                </div>
              </div>
            </div>

            {/* Cart and Wishlist Controls */}
            <div className="mt-6 flex gap-3">
              <div className="flex-1">
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
                          className="px-6 py-3 bg-blue-600 text-white font-medium text-xl"
                        >
                          -
                        </motion.button>

                        <div className="relative flex items-center justify-center min-w-[60px]">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`pulse-${cartItem.quantity}`}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{
                                scale: [1, 1.5],
                                opacity: [0.3, 0],
                              }}
                              transition={{
                                duration: 0.4,
                                ease: "easeOut",
                              }}
                              className="absolute inset-0 bg-blue-100 rounded-full"
                            />
                            <motion.span
                              key={cartItem.quantity}
                              initial={{ scale: 0.5, y: 20, opacity: 0 }}
                              animate={{ scale: 1, y: 0, opacity: 1 }}
                              exit={{ scale: 0.5, y: -20, opacity: 0 }}
                              transition={{
                                duration: 0.3,
                                ease: "backOut",
                              }}
                              className="absolute font-medium text-xl z-10"
                            >
                              {cartItem.quantity}
                            </motion.span>
                          </AnimatePresence>
                        </div>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUpdateQuantity(cartItem.quantity + 1)}
                          className="px-6 py-3 bg-blue-600 text-white font-medium text-xl"
                          disabled={cartItem.quantity >= product.stock}
                        >
                          +
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="add-button"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "backOut" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddToCart}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        disabled={isAddingToCart}
                      >
                        {isAddingToCart ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <>
                            <FaShoppingCart className="text-xl" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </motion.button>
                    )}
                  </AnimatePresence>
                ) : (
                  <div className="text-red-500 text-center py-3 bg-red-50 rounded-xl">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Wishlist Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleWishlist}
                className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 transition-colors ${
                  isInWishlist 
                    ? 'border-red-500 bg-red-50 text-red-500' 
                    : 'border-gray-200 hover:border-red-500 hover:bg-red-50 text-gray-400 hover:text-red-500'
                }`}
              >
                {isInWishlist ? (
                  <FaHeart className="text-xl" />
                ) : (
                  <FaRegHeart className="text-xl" />
                )}
              </motion.button>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>
          </div>
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