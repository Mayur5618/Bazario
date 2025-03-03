import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
      addToRecentlyViewed(data.product);
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

        const response = await axios.delete(`/api/reviews/${reviewId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.data.success) {
            // Update reviews state
            setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
            
            // Update stats
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
            
            // Refresh data
            await fetchReviews();
            await checkUserReview();

            return true; // Return success
        }
        return false; // Return failure
    } catch (error) {
        console.error('Error deleting review:', error);
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
        const response = await axios.post('/api/user/wishlist/add', {
          productId: id
        }, config);

        if (response.data.success) {
          dispatch(addToWishlist(product));
          toast.success("Added to wishlist");
        }
      } else {
        const response = await axios.post('/api/user/wishlist/remove', {
          productId: id
        }, config);

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

  const addToRecentlyViewed = (product) => {
    if (!product) return;

    try {
      // 1. Validation criteria for products
      const isValidProduct = (
        product._id &&
        product.name &&
        product.price &&
        product.images?.length > 0 &&
        typeof product.stock !== 'undefined'
      );

      if (!isValidProduct) {
        console.log('Product does not meet criteria for recently viewed');
        return;
      }

      // 2. Get existing recently viewed products
      const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
      const currentTime = Date.now();
      const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

      // 3. Clean up old entries
      const validProducts = recentlyViewed.filter(item => {
        return (currentTime - item.timestamp) < ONE_WEEK;
      });

      // 4. Check if product already exists
      const existingIndex = validProducts.findIndex(item => item._id === product._id);

      // 5. Remove if exists
      if (existingIndex !== -1) {
        validProducts.splice(existingIndex, 1);
      }

      // 6. Create product object with essential data
      const productToAdd = {
        _id: product._id,
        name: product.name,
        images: product.images,
        price: product.price,
        unit: product.unitType || 'piece',
        rating: Number(product.rating || 0),
        reviews: product.reviews || [],
        stock: Number(product.stock),
        timestamp: currentTime,
        category: product.category,
        viewCount: (existingIndex !== -1 ? 
          validProducts[existingIndex].viewCount + 1 : 1)
      };

      // 7. Add to front of array
      validProducts.unshift(productToAdd);

      // 8. Keep only last 6 items
      const filteredProducts = validProducts.slice(0, 6);

      // 9. Save to localStorage
      localStorage.setItem('recentlyViewed', JSON.stringify(filteredProducts));

      // 10. Notify components of update
      window.dispatchEvent(new Event('recentlyViewedUpdated'));

      console.log('Added to recently viewed:', productToAdd); // Debug log

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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Product Section */}
      <div className="flex flex-col lg:flex-row gap-8 mb-16">
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

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>
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
              refreshReviews={fetchReviews}
            />
          ))}
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-16 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Related Products</h2>
          <Link 
            to={`/products/${product.category}`}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            View All
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {product?.relatedProducts?.map((relatedProduct) => (
            <motion.div
              key={relatedProduct._id}
              whileHover={{ y: -5 }}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl"
            >
              <Link to={`/product/${relatedProduct._id}`} className="block">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={relatedProduct.images[0]}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  {relatedProduct.stock <= 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium px-4 py-2 bg-red-500 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Container */}
                <div className="p-4">
                  {/* Category */}
                  <div className="text-sm text-gray-500 mb-2">
                    {relatedProduct.category}
                  </div>

                  {/* Product Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                    {relatedProduct.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`w-4 h-4 ${
                            star <= relatedProduct.rating ? "text-yellow-400" : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      ({relatedProduct.reviews?.length || 0})
                    </span>
                  </div>

                  {/* Price and Stock Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{relatedProduct.price}
                      </span>
                      <span className="text-sm text-gray-500">
                        per {relatedProduct.unitType || 'piece'}
                      </span>
                    </div>
                    {relatedProduct.stock > 0 ? (
                      <span className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Quick Actions */}
              <div className="p-4 pt-0">
                {relatedProductsCart[relatedProduct._id] ? (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRelatedProductQuantity(
                          relatedProduct._id,
                          relatedProductsCart[relatedProduct._id].quantity - 1
                        );
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <FaMinus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-medium">
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
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <FaPlus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    className={`w-full py-2 px-4 rounded-xl text-white font-medium transition-colors ${
                      relatedProduct.stock > 0
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={relatedProduct.stock <= 0}
                    onClick={(e) => {
                      e.preventDefault();
                      handleRelatedProductAddToCart(relatedProduct);
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaShoppingCart className="text-lg" />
                      <span>Add to Cart</span>
                    </div>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {(!product?.relatedProducts || product.relatedProducts.length === 0) && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No Related Products</h3>
            <p className="mt-1 text-gray-500">We couldn't find any related products at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;