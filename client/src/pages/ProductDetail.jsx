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

  // Accordion states
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

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
                <Link 
                    to={`/sellers/${product.seller._id}`}
                className="w-full bg-violet-600 text-white py-2.5 md:py-3 px-4 rounded-xl hover:bg-violet-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm md:text-base font-medium"
                >
                <FaStore className="text-base md:text-lg" />
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
                            {userData && canReview && !hasReviewed && (
                              <button
                                onClick={() => setEditingReview(true)}
                                className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50"
                              >
                                Write a Review
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
                                        className="w-16 h-16 object-cover rounded-lg"
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
            {product.relatedProducts?.length > 5 && (
              <>
                <button 
                  onClick={() => {
                    const container = document.getElementById('related-products-container');
                    container.scrollLeft -= container.offsetWidth;
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm shadow-lg rounded-full p-2 hover:bg-white transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={() => {
                    const container = document.getElementById('related-products-container');
                    container.scrollLeft += container.offsetWidth;
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm shadow-lg rounded-full p-2 hover:bg-white transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            <div 
              id="related-products-container"
              className="overflow-x-auto hide-scrollbar scroll-smooth"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 min-w-max">
                {product.relatedProducts?.map((relatedProduct) => (
                  <div 
                    key={relatedProduct._id}
                    className="w-[160px] sm:w-[200px] md:w-[220px] lg:w-[240px] bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all h-full flex flex-col"
                  >
                    <Link to={`/product/${relatedProduct._id}`}>
                      <div className="relative pt-[100%] overflow-hidden rounded-t-lg">
                        <img
                          src={relatedProduct.images[0]}
                          alt={relatedProduct.name}
                          className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        {relatedProduct.stock <= 0 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white text-sm md:text-base font-medium">Out of Stock</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2 flex flex-col flex-grow">
                        <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 line-clamp-1">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm sm:text-base font-bold">₹{relatedProduct.price}</span>
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