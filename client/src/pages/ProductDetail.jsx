import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import { cartAdd, cartRemove } from "../store/cartSlice";
import YouTube from "react-youtube";
import '../styles/catelog.css';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  // Local states
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState({});

  // Media states
  const [selectedMedia, setSelectedMedia] = useState(0);
  const [isVideo, setIsVideo] = useState(false);

  // Review states
  const [hasPurchased, setHasPurchased] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [purchaseStatus, setPurchaseStatus] = useState({
    hasPurchased: false,
    hasReviewed: false,
    orderDate: null,
    orderStatus: null,
  });

  const [cartItemsMap, setCartItemsMap] = useState({});
   // Fetch cart items when component mounts
   useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get('/api/cart/getCartItems', {
          withCredentials: true
        });
        if (response.data.success) {
          const itemsMap = {};
          response.data.cart.items.forEach(item => {
            itemsMap[item.product._id] = item;
          });
          setCartItemsMap(itemsMap);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    if (userData) {
      fetchCartItems();
    } else {
      setCartItemsMap({});
    }
  }, [userData]);

  const handleAddToCart = async (productId) => {
    if (!userData) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      const response = await axios.post('/api/cart/add', {
        productId,
        quantity: 1
      });
      
      if (response.data.success) {
        dispatch(cartAdd());
        const updatedCart = await axios.get('/api/cart/getCartItems');
        const newItemsMap = {};
        updatedCart.data.cart.items.forEach(item => {
          newItemsMap[item.product._id] = item;
        });
        setCartItemsMap(newItemsMap);
        toast.success('Added to cart!');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity, stock) => {
    if (!userData) {
      toast.error('Please login to update cart');
      return;
    }

    try {
      if (newQuantity < 1) {
        dispatch(cartRemove());
        const response = await axios.delete(`/api/cart/remove/${productId}`);
        if (response.data.success) {
          const newItemsMap = { ...cartItemsMap };
          delete newItemsMap[productId];
          setCartItemsMap(newItemsMap);
          toast.success('Item removed from cart');
        }
        return;
      }

      if (newQuantity > stock) {
        toast.error('Cannot exceed available stock');
        return;
      }

      const response = await axios.put(`/api/cart/update/${productId}`, {
        quantity: newQuantity
      });

      if (response.data.success) {
        const updatedCart = await axios.get('/api/cart/getCartItems');
        const newItemsMap = {};
        updatedCart.data.cart.items.forEach(item => {
          newItemsMap[item.product._id] = item;
        });
        setCartItemsMap(newItemsMap);
        toast.success(`Quantity updated to ${newQuantity}`);
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  // Add this function to check if user has purchased the product
  const checkPurchaseHistory = async () => {
    try {
      const response = await axios.get(`/api/orders/check-purchase/${id}`, {
        withCredentials: true,
      });
      setPurchaseStatus(response.data);
    } catch (error) {
      setPurchaseStatus({
        hasPurchased: false,
        hasReviewed: false,
        orderDate: null,
        orderStatus: null,
      });
    }
  };
  //   if (!userData) {
  //     toast.error('Please login to submit a review');
  //     navigate('/login');
  //     return;
  //   }

  //   if (rating === 0) {
  //     setReviewError('Please select a rating');
  //     return;
  //   }

  //   if (!comment.trim()) {
  //     setReviewError('Please write a review');
  //     return;
  //   }

  //   setIsSubmitting(true);
  //   setReviewError('');
  //   setReviewSuccess('');

  //   try {
  //     const response = await axios.post(
  //       `/api/products/${id}/reviews`,
  //       {
  //         rating,
  //         comment
  //       },
  //       {
  //         withCredentials: true
  //       }
  //     );

  //     if (response.data.success) {
  //       // Update product with new review
  //       setProduct(prevProduct => ({
  //         ...prevProduct,
  //         reviews: [...prevProduct.reviews, response.data.review]
  //       }));

  //       // Reset form
  //       setRating(0);
  //       setComment('');
  //       setReviewSuccess('Review submitted successfully!');
  //       toast.success('Review submitted successfully!');

  //       // Update purchase status to show that user has reviewed
  //       setPurchaseStatus(prev => ({
  //         ...prev,
  //         hasReviewed: true
  //       }));
  //     }
  //   } catch (error) {
  //     setReviewError(error.response?.data?.message || 'Failed to submit review');
  //     toast.error(error.response?.data?.message || 'Failed to submit review');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!userData) {
      toast.error("Please login to submit a review");
      navigate("/login");
      return;
    }

    if (rating === 0) {
      setReviewError("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      setReviewError("Please write a review");
      return;
    }

    if (comment.length < 5) {
      setReviewError("Review must be at least 5 characters long");
      return;
    }

    setIsSubmitting(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      const response = await axios.post(
        `/api/products/${id}/reviews`,
        {
          rating,
          comment,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Update product with new review
        setProduct((prevProduct) => ({
          ...prevProduct,
          reviews: [...prevProduct.reviews, response.data.review],
        }));

        // Reset form
        setRating(0);
        setComment("");
        setReviewSuccess("Review submitted successfully and pending approval!");
        toast.success("Review submitted successfully!");

        // Update purchase status to show that user has reviewed
        setPurchaseStatus((prev) => ({
          ...prev,
          hasReviewed: true,
        }));
      }
    } catch (error) {
      setReviewError(
        error.response?.data?.message || "Failed to submit review"
      );
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this to your useEffect that loads product details
  useEffect(() => {
    if (userData) {
      checkPurchaseHistory();
    }
  }, [userData, id]);

  // Function to check if URL is a YouTube link
  const isYoutubeLink = (url) => {
    if (!url) return false;
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  // Function to extract YouTube video ID
  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Handle thumbnail click
  const handleMediaSelect = (index, mediaUrl) => {
    setSelectedMedia(index);
    setIsVideo(isYoutubeLink(mediaUrl));
  };

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data.product);
        // Check if first media is video
        if (response.data.product.images.length > 0) {
          setIsVideo(isYoutubeLink(response.data.product.images[0]));
        }
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch product details"
        );
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  // Fetch cart items<div className="mt-12 border-t pt-8">
  const fetchCartItems = async () => {
    try {
      const res = await axios.get("/api/cart/getCartItems", {
        withCredentials: true,
      });
      if (res.data.success) {
        setCartItems(res.data.cart?.items || []);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      setCartItems([]);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchCartItems();
    }
  }, [userData]);

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    } else {
      toast.error("Maximum stock limit reached");
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Handle add to cart
  // const handleAddToCart = async (productId) => {
  //   if (!userData) {
  //     toast.error("Please login to add items to cart");
  //     navigate("/login");
  //     return;
  //   }

  //   try {
  //     const res = await axios.post(
  //       "/api/cart/add",
  //       {
  //         productId,
  //         quantity: quantity,
  //       },
  //       {
  //         withCredentials: true,
  //       }
  //     );

  //     if (res.data.success) {
  //       dispatch(cartAdd());
  //       toast.success("Added to cart successfully");
  //       fetchCartItems();
  //     }
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || "Failed to add to cart");
  //   }
  // };

  const isProductInCart = (productId) => {
    return cartItems && cartItems.length > 0
      ? cartItems.some((item) => item?.productId?._id === productId)
      : false;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - Images */}
        <div className="md:w-1/2">
          <div className="mb-4 relative h-[400px]">
            {isVideo ? (
              <YouTube
                videoId={getYoutubeVideoId(product.images[selectedMedia])}
                opts={{
                  width: "100%",
                  height: "400",
                  playerVars: {
                    autoplay: 0,
                  },
                }}
                className="w-full h-full"
              />
            ) : (
              <img
                src={product.images[selectedMedia]}
                alt={product.name}
                className={`w-full h-full object-contain ${
                  product.stock <= 0 ? "opacity-50 grayscale" : ""
                }`}
                onError={(e) => {
                  setImageError((prev) => ({ ...prev, [selectedMedia]: true }));
                  e.target.src = "/placeholder-image.jpg"; // Add a placeholder image
                }}
              />
            )}
            {product.stock <= 0 && !isVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white text-gray-600 px-16 py-2 opacity-80 rounded-3xl border-2 border-gray-400 text-[15px]">
                  Currently Unavailable
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleMediaSelect(index, image)}
                className={`border-2 rounded-md overflow-hidden relative aspect-square ${
                  selectedMedia === index
                    ? "border-blue-500"
                    : "border-gray-200"
                }`}
              >
                {isYoutubeLink(image) ? (
                  <div className="relative w-full h-20">
                    <img
                      src={`https://img.youtube.com/vi/${getYoutubeVideoId(
                        image
                      )}/default.jpg`}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                      <svg
                        className="w-8 h-8 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className={`w-full h-20 object-contain ${
                      product.stock <= 0 ? "opacity-50 grayscale" : ""
                    }`}
                    onError={(e) => {
                      setImageError((prev) => ({ ...prev, [index]: true }));
                      e.target.src = "/placeholder-image.jpg"; // Add a placeholder image
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column - Product Details */}
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <div className="mb-4">
            <span className="text-2xl font-semibold">₹{product.price}</span>
            <span className="text-gray-600 ml-2">per {product.unitType}</span>
          </div>

          {/* Stock Status */}
          <div className="mb-4">
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
          {/* {product.stock > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity ({product.unitType})
              </label>
              <div className="flex items-center">
                <button
                  onClick={decrementQuantity}
                  className="px-3 py-1 border rounded-l bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-20 text-center border-t border-b"
                  min="1"
                  max={product.stock}
                />
                <button
                  onClick={incrementQuantity}
                  className="px-3 py-1 border rounded-r bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )} */}

          {/* Add to Cart Button */}
          {/* <button
            onClick={() => handleAddToCart(product._id)}
            disabled={product.stock === 0 || isProductInCart(product._id)}
            className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-colors ${
              product.stock === 0
                ? "bg-gray-400 cursor-not-allowed"
                : isProductInCart(product._id)
                ? "bg-green-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {product.stock <=0
              ? "Out of Stock"
              : isProductInCart(product._id)
              ? "In Cart"
              : "Add to Cart"}
          </button> */}

          {/* Add to Cart Section */}
          {product.stock > 0 ? (
                <AnimatePresence mode="wait">
                  {cartItemsMap[product._id] ? (
                    <motion.div
                      key="quantity-controls"
                      className="flex items-center border-2 w-[50%] border-red-600 justify-between rounded-md overflow-hidden"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "backOut" }}
                    >
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateQuantity(
                          product._id,
                          cartItemsMap[product._id].quantity - 1,
                          product.stock
                        )}
                        className="px-6 py-2 bg-red-600 text-white font-medium text-xl"
                      >
                        -
                      </motion.button>
                      
                      <div className="relative flex items-center justify-center min-w-[60px]">
                        <AnimatePresence mode="wait">
                          {/* Background Pulse */}
                          <motion.div
                            key={`pulse-${cartItemsMap[product._id].quantity}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                              scale: [1, 1.5],
                              opacity: [0.3, 0],
                            }}
                            transition={{
                              duration: 0.4,
                              ease: "easeOut",
                            }}
                            className="absolute inset-0 bg-red-100 rounded-full"
                          />
                          
                          {/* Quantity Number */}
                          <motion.span
                            key={cartItemsMap[product._id].quantity}
                            initial={{ scale: 0.5, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.5, y: -20, opacity: 0 }}
                            transition={{ 
                              duration: 0.3,
                              ease: "backOut"
                            }}
                            className="absolute font-medium text-lg z-10"
                          >
                            {cartItemsMap[product._id].quantity}
                          </motion.span>
                        </AnimatePresence>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateQuantity(
                          product._id,
                          cartItemsMap[product._id].quantity + 1,
                          product.stock
                        )}
                        className="px-6 py-2 bg-red-600 text-white font-medium text-xl"
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
                      onClick={() => handleAddToCart(product._id)}
                      className="w-[70%] py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 overflow-hidden"
                    >
                      <motion.span
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        Add to Cart
                      </motion.span>
                    </motion.button>
                  )}
                </AnimatePresence>
              ) : (
                <div className="text-red-500 text-center py-2">
                  Out of Stock
                </div>
              )}

          {/* Product Details */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Product Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Category</p>
                <p className="font-medium">{product.category}</p>
              </div>
              <div>
                <p className="text-gray-600">Unit Size</p>
                <p className="font-medium">
                  {product.unitSize} {product.unitType}
                </p>
              </div>
              {/* <div>
                <p className="text-gray-600">Seller</p>
                <p className="font-medium">
                  {product.seller.firstname} {product.seller.lastname}
                </p>
              </div> */}
              <div className="mb-4">
      <h2 className="text-xl font-semibold">Seller Information</h2>
      <Link to={`/sellers/${product.seller._id}`} className="text-blue-500">
        {product.seller.firstname} {product.seller.lastname}
      </Link>
    </div>
              {product.platformType.includes("b2b") && (
                <>
                  <div>
                    <p className="text-gray-600">Min Order Quantity</p>
                    <p className="font-medium">{product.minOrderQuantity}</p>
                  </div>
                  {product.maxOrderQuantity && (
                    <div>
                      <p className="text-gray-600">Max Order Quantity</p>
                      <p className="font-medium">{product.maxOrderQuantity}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-semibold mb-6">Customer Reviews</h2>

        {userData ? (
          purchaseStatus.hasPurchased ? (
            purchaseStatus.hasReviewed ? (
              <div className="mb-8 p-4 bg-gray-50 rounded-md">
                <p className="text-gray-600">
                  You have already reviewed this product.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="mb-8">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, index) => {
                      const ratingValue = index + 1;
                      return (
                        <button
                          type="button"
                          key={ratingValue}
                          className={`text-2xl transition-colors ${
                            ratingValue <= (hover || rating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          onClick={() => setRating(ratingValue)}
                          onMouseEnter={() => setHover(ratingValue)}
                          onMouseLeave={() => setHover(0)}
                        >
                          <FaStar />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your Review
                  </label>
                  <textarea
                    id="comment"
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write your review here..."
                  />
                </div>

                {reviewError && (
                  <div className="mb-4 text-red-600">{reviewError}</div>
                )}

                {reviewSuccess && (
                  <div className="mb-4 text-green-600">{reviewSuccess}</div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-600">
                Only customers who have purchased this product can leave a
                review.
              </p>
            </div>
          )
        ) : (
          <div className="mb-8 p-4 bg-gray-50 rounded-md">
            <p className="text-gray-600">
              Please{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                login
              </Link>{" "}
              to leave a review.
            </p>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review) => (
              <div key={review._id} className="border-b pb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">
                      {review.user.firstname} {review.user.lastname}
                    </span>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, index) => (
                        <FaStar
                          key={index}
                          className={
                            index < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                {/* Add Verified Purchase badge */}
                <div className="mt-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Verified Purchase
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
