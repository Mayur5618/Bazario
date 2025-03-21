import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaStar, FaShoppingCart, FaMinus, FaPlus, FaPlay, FaHeart, FaRegHeart, FaStore, FaArrowRight } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import { cartAdd, cartRemove } from "../store/cartSlice";
import { motion, AnimatePresence } from "framer-motion";
import ProductReviewSection from "../components/ProductReviewSection";
import YouTube from "react-youtube";
import ReviewItem from '../components/ReviewItem';
import { addToWishlist, removeFromWishlist } from "../store/wishlistSlice";
import ReviewEditModal from '../components/ReviewEditModal';

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
        console.log('Submitting review with images:', formData.images);
        
        // Extract base64 strings from image objects
        const imageUrls = formData.images.map(img => img.url);
        console.log('Image URLs being sent:', imageUrls);

        const response = await axios.post(`/api/reviews/products/${id}/reviews`, {
            rating: formData.rating,
            comment: formData.comment,
            images: imageUrls,
            orderId: formData.orderId
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = response.data;

        if (data.success) {
            toast.success('Review submitted successfully!');
            await fetchReviews(); // Wait for reviews to be fetched
            setHasReviewed(true);
        } else {
            throw new Error(data.message || 'Failed to submit review');
        }
    } catch (error) {
        console.error('Review submission error:', error);
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
        // Find the review before deleting
        const reviewToDelete = reviews.find(review => review._id === reviewId);
        if (!reviewToDelete) {
            throw new Error('Review not found');
        }

        // Update UI first
        setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
        setProductStats(prev => ({
            ...prev,
            totalReviews: prev.totalReviews - 1,
            ratingCounts: {
                ...prev.ratingCounts,
                [reviewToDelete.rating]: prev.ratingCounts[reviewToDelete.rating] - 1
            }
        }));
        
        // Reset review status
        setHasReviewed(false);
        setCanReview(true);

        // Make API call
        const response = await axios.delete(`/api/reviews/${reviewId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.data.success) {
            // Refresh data in background
            fetchReviews();
            checkUserReview();
            return true;
        } else {
            // Revert UI changes if API call fails
            await fetchReviews();
            await checkUserReview();
            return false;
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        // Revert UI changes if API call fails
        await fetchReviews();
        await checkUserReview();
        throw new Error(error.response?.data?.message || 'Failed to delete review');
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Product Section */}
      <div className="flex flex-col lg:flex-row gap-8 mb-16">
        {/* Media Gallery */}
        <div className="lg:w-1/2">
          {/* Main Image Container */}
          <div className="mb-4 relative h-[400px] md:h-[500px] bg-white rounded-lg overflow-hidden">
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
          <div className="grid grid-cols-5 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedMedia(index);
                  setIsVideo(false);
                }}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
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
                className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
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
            <div className="mb-6 bg-white p-3 rounded-lg shadow-sm">
              <span className="text-4xl font-bold text-gray-900">₹{product.price}</span>
              <span className="text-gray-600 ml-2">per {product.unitType}</span>
            </div>

            {/* Cart and Wishlist Controls */}
            <div className="mb-6 flex gap-3">
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
                            <FaShoppingCart className="text-lg" />
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
                disabled={isWishlistLoading}
                className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 transition-colors ${
                  isInWishlist 
                    ? 'border-red-500 bg-red-50 text-red-500' 
                    : 'border-gray-200 hover:border-red-500 hover:bg-red-50 text-gray-400 hover:text-red-500'
                }`}
              >
                {isWishlistLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                  />
                ) : isInWishlist ? (
                  <FaHeart className="text-xl" />
                ) : (
                  <FaRegHeart className="text-xl" />
                )}
              </motion.button>
            </div>

            {/* Shop Now Button */}
            <div className="mb-6">
                <Link 
                    to={`/sellers/${product.seller._id}`}
                    className="w-full bg-violet-600 text-white py-3 px-4 rounded-xl hover:bg-violet-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                >
                    <FaStore className="text-lg" />
                    Shop Now
                </Link>
            </div>

            {/* Seller Info - Compact */}
            <div 
                onClick={() => navigate(`/sellers/${product.seller._id}`)}
                className="mb-6 bg-white rounded-lg border border-gray-100 overflow-hidden cursor-pointer hover:border-blue-200 hover:shadow-md transition-all duration-200"
            >
                <div className="p-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            {product.seller.profileImage ? (
                                <img 
                                    src={product.seller.profileImage} 
                                    alt={product.seller.shopName}
                                    className="w-12 h-12 rounded-full object-cover border border-gray-100"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                                    <span className="text-lg font-medium text-blue-600">
                                        {product.seller.shopName.charAt(0)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600">
                                {product.seller.shopName}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 mt-0.5">
                                <span className="flex items-center">
                                    <FaStar className="text-yellow-400 w-4 h-4 mr-1" />
                                    {product.seller.rating || "New"}
                                </span>
                                <span className="mx-2">•</span>
                                <span>{product.seller.productsCount || product.seller.totalProducts || 4} Products</span>
                            </div>
                        </div>
                        <div className="text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            {product.description && product.description.trim() !== "" && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Customer Reviews</h2>
        
        {/* Review Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
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
              onEdit={(review) => setEditingReview(review)}
              refreshReviews={fetchReviews}
            />
          ))}
        </div>

        {/* Review Edit Modal */}
        {editingReview && (
          <ReviewEditModal
            review={editingReview}
            isOpen={!!editingReview}
            onClose={() => setEditingReview(null)}
            onUpdate={handleReviewEdit}
          />
        )}
      </div>

      {/* Related Products Section */}
      <div className="mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
            <Link 
              to={`/products?category=${product.category}`}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium"
            >
              View All
              <FaArrowRight className="text-sm" />
            </Link>
          </div>

          <div className="relative">
            <div className="overflow-x-auto hide-scrollbar">
              <div className="flex gap-4 pb-4">
                {product.relatedProducts?.map((relatedProduct) => (
                  <div 
                    key={relatedProduct._id}
                    className="flex-shrink-0 w-[250px] bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <Link to={`/product/${relatedProduct._id}`}>
                      <div className="relative h-[200px] bg-gray-100">
                        <img
                          src={relatedProduct.images[0]}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover"
                        />
                        {relatedProduct.stock <= 0 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-medium">Out of Stock</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-1 truncate">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= relatedProduct.rating ? "text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-1 text-sm text-gray-500">
                            ({relatedProduct.reviews?.length || 0})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">₹{relatedProduct.price}</span>
                        </div>
                        {relatedProduct.stock > 0 ? (
                          <div className="mt-2">
                            {relatedProductsCart[relatedProduct._id] ? (
                              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-1">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleRelatedProductQuantity(
                                      relatedProduct._id,
                                      relatedProductsCart[relatedProduct._id].quantity - 1
                                    );
                                  }}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                                >
                                  <FaMinus className="text-sm" />
                                </button>
                                <span className="font-medium text-gray-900">
                                  {relatedProductsCart[relatedProduct._id].quantity}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleRelatedProductQuantity(
                                      relatedProduct._id,
                                      relatedProductsCart[relatedProduct._id].quantity + 1
                                    );
                                  }}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                                  disabled={relatedProductsCart[relatedProduct._id].quantity >= relatedProduct.stock}
                                >
                                  <FaPlus className="text-sm" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleRelatedProductAddToCart(relatedProduct);
                                }}
                                className="w-full py-2.5 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition-all hover:shadow-md"
                              >
                                <FaShoppingCart className="text-sm" />
                                Add to Cart
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="mt-2">
                            <div className="w-full py-2.5 text-center text-red-500 text-sm bg-red-50 rounded-xl">
                              Out of Stock
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add this CSS to hide scrollbar but keep functionality */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;