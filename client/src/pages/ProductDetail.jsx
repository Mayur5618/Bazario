// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { FaStar } from 'react-icons/fa';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';
// import { cartAdd } from '../store/cartSlice';

// const ProductDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { userData } = useSelector((state) => state.user);
//   // const cartItems = useSelector(state => state.cart.items);
  
//   // Local states
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [quantity, setQuantity] = useState(1);

//   // Review states
//   const [rating, setRating] = useState(0);
//   const [hover, setHover] = useState(0);
//   const [comment, setComment] = useState('');
//   const [reviewError, setReviewError] = useState('');
//   const [reviewSuccess, setReviewSuccess] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
  
  
//   // Fetch product details
//   useEffect(() => {
//     const fetchProductDetails = async () => {
//       try {
//         const response = await axios.get(`/api/products/${id}`);
//         setProduct(response.data.product);
//         setLoading(false);
//       } catch (err) {
//         setError(err.response?.data?.message || 'Failed to fetch product details');
//         setLoading(false);
//       }
//     };

//     fetchProductDetails();
//   }, [id]);

//   // Handle quantity change
//   const handleQuantityChange = (e) => {
//     const value = parseInt(e.target.value);
//     if (value > 0 && value <= product.stock) {
//       setQuantity(value);
//     }
//   };

//   const incrementQuantity = () => {
//     if (quantity < product.stock) {
//       setQuantity(prev => prev + 1);
//     } else {
//       toast.error('Maximum stock limit reached');
//     }
//   };

//   const decrementQuantity = () => {
//     if (quantity > 1) {
//       setQuantity(prev => prev - 1);
//     }
//   };

//   // Handle add to cart
//   // const handleAddToCart = () => {
//   //   if (!userData) {
//   //     toast.error('Please login to add items to cart');
//   //     navigate('/login');
//   //     return;
//   //   }

//   //   if (quantity > product.stock) {
//   //     toast.error('Not enough stock available');
//   //     return;
//   //   }

//   //   const existingItem = cartItems.find(item => item.product._id === product._id);
//   //   if (existingItem && (existingItem.quantity + quantity) > product.stock) {
//   //     toast.error('Cannot add more items than available in stock');
//   //     return;
//   //   }

//   //   dispatch(addToCart({
//   //     productId: product._id,
//   //     quantity: quantity
//   //   }));
//   // };
//   const [cartItems, setCartItems] = useState([]);
//   const fetchCartItems = async () => {
//     try {
//       const res = await axios.get("/api/cart/getCartItems", {
//         withCredentials: true
//       });
//       if (res.data.success) {
//         setCartItems(res.data.cart?.items || []);
//       } else {
//         setCartItems([]);
//       }
//     } catch (error) {
//       console.error('Error fetching cart items:', error);
//       setCartItems([]);
//     }
//   };

//   useEffect(() => {

//     if(userData)
//    {
//      fetchCartItems();
//    }
//  }, []);

//  const handleAddToCart = async (productId) => {
//   if (!userData) {
//     toast.error('Please login to add items to cart');
//     navigate('/login');
//     return;
//   }

//   try {
//     const res = await axios.post("/api/cart/add", {
//       productId,
//       quantity: quantity  // Add the quantity from your state
//     }, {
//       withCredentials: true  // Important: This sends cookies with the request
//     });

//     if (res.data.success) {
//       dispatch(cartAdd());
//       toast.success('Added to cart successfully');
//       fetchCartItems();
//     }
//   } catch (error) {
//     console.error('Add to cart error:', error);
//     toast.error(error.response?.data?.message || 'Failed to add to cart');
//   }
// };

// const isProductInCart = (productId) => {
//   return cartItems && cartItems.length > 0 
//     ? cartItems.some((item) => item?.productId?._id === productId)
//     : false;
// };

//   // Handle review submission
//   const handleReviewSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!userData) {
//       toast.error('Please login to submit a review');
//       navigate('/login');
//       return;
//     }

//     if (rating === 0) {
//       setReviewError('Please select a rating');
//       return;
//     }

//     if (!comment.trim()) {
//       setReviewError('Please write a review');
//       return;
//     }

//     setIsSubmitting(true);
//     setReviewError('');
//     setReviewSuccess('');

//     try {
//       const response = await axios.post(`/api/products/${id}/reviews`, 
//         { rating, comment },
//         { withCredentials: true }
//       );

//       setProduct(prevProduct => ({
//         ...prevProduct,
//         reviews: [...prevProduct.reviews, response.data.review]
//       }));

//       setRating(0);
//       setComment('');
//       setReviewSuccess('Review submitted successfully!');
//       toast.success('Review submitted successfully!');
      
//       setTimeout(() => setReviewSuccess(''), 3000);
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || 'Failed to submit review';
//       setReviewError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="text-center text-red-600">
//           <p className="text-xl font-semibold mb-4">{error}</p>
//           <button 
//             onClick={() => window.location.reload()} 
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <p className="text-xl font-semibold">Product not found</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Product Details Section */}
//       <div className="flex flex-col md:flex-row gap-8">
//         {/* Left Column - Images */}
//         <div className="md:w-1/2">
//           <div className="mb-4 relative h-[400px]">
//             <img
//               src={product.images[selectedImage]}
//               alt={product.name}
//               // className="w-full h-[400px] object-cover rounded-lg"
//               className={`w-full h-full object-contain rounded-lg ${
//                 product.stock <= 0 ? 'opacity-50' : ''
//               }`}
//             />
//             {product.stock <= 0 && (
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <span className="bg-white text-gray-600 px-16 py-2 opacity-80 rounded-3xl border-2 border-gray-400 text-[15px]">
//                       Currently Unavailable
//                     </span>
//                   </div>
//                 ) }
//           </div>
//           <div className="grid grid-cols-4 gap-2">
//             {product.images.map((image, index) => (
//               <button
//                 key={index}
//                 onClick={() => setSelectedImage(index)}
//                 className={`border-2 rounded-md overflow-hidden transition-colors ${
//                   selectedImage === index ? 'border-blue-500' : 'border-gray-200'
//                 }`}
//               >
//                 <img
//                   src={image}
//                   alt={`${product.name} thumbnail ${index + 1}`}
//                   // className="w-full h-20 object-cover "
//                   className={`w-full h-20 object-contain ${
//                     product.stock <= 0 ? 'opacity-50' : ''
//                   }`}
//                 />
               
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Right Column - Product Details */}
//         <div className="md:w-1/2">
//           <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
//           <div className="mb-4">
//             <span className="text-2xl font-semibold">₹{product.price}</span>
//             <span className="text-gray-600 ml-2">per {product.unitType}</span>
//           </div>

//           {/* Stock Status */}
//           <div className="mb-4">
//             <span className={`${
//               product.stock > 0 ? 'text-green-600' : 'text-red-600'
//             } font-semibold`}>
//               {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
//             </span>
//             {product.stock > 0 && (
//               <span className="text-gray-600 ml-2">
//                 ({product.stock} {product.unitType}s available)
//               </span>
//             )}
//           </div>

//           {/* Description */}
//           <div className="mb-6">
//             <h2 className="text-xl font-semibold mb-2">Description</h2>
//             <p className="text-gray-700">{product.description}</p>
//           </div>

//           {/* Quantity Selector */}
//           {product.stock > 0 && (
//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Quantity ({product.unitType})
//               </label>
//               <div className="flex items-center">
//                 <button
//                   onClick={decrementQuantity}
//                   className="px-3 py-1 border rounded-l bg-gray-100 hover:bg-gray-200 transition-colors"
//                 >
//                   -
//                 </button>
//                 <input
//                   type="number"
//                   value={quantity}
//                   onChange={handleQuantityChange}
//                   className="w-20 text-center border-t border-b"
//                   min="1"
//                   max={product.stock}
//                 />
//                 <button
//                   onClick={incrementQuantity}
//                   className="px-3 py-1 border rounded-r bg-gray-100 hover:bg-gray-200 transition-colors"
//                 >
//                   +
//                 </button>
//               </div>
//             </div>
//           )}
//          {/* <Link to="/cart">
//           <button
//             onClick={()=>handleAddToCart(product._id)}
//             disabled={product.stock === 0}
//             className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-colors ${
//               product.stock > 0
//                 ? 'bg-blue-600 hover:bg-blue-700'
//                 : 'bg-gray-400 cursor-not-allowed'
//             }`}
//           >
//             {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
//           </button>
//           </Link> */}
//           {/* Replace the Link wrapper with just the button */}
// <button
//   onClick={() => handleAddToCart(product._id)}
//   disabled={product.stock === 0 || isProductInCart(product._id)}
//   className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-colors ${
//     product.stock === 0
//       ? 'bg-gray-400 cursor-not-allowed'
//       : isProductInCart(product._id)
//       ? 'bg-green-600'
//       : 'bg-blue-600 hover:bg-blue-700'
//   }`}
// >
//   {product.stock === 0 
//     ? 'Out of Stock' 
//     : isProductInCart(product._id)
//     ? 'In Cart'
//     : 'Add to Cart'}
// </button>

//           {/* Additional Details */}
//           <div className="mt-8">
//             <h2 className="text-xl font-semibold mb-4">Product Details</h2>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p className="text-gray-600">Category</p>
//                 <p className="font-medium">{product.category}</p>
//               </div>
//               <div>
//                 <p className="text-gray-600">Unit Size</p>
//                 <p className="font-medium">{product.unitSize} {product.unitType}</p>
//               </div>
//               <div>
//                 <p className="text-gray-600">Seller</p>
//                 <p className="font-medium">
//                   {product.seller.firstname} {product.seller.lastname}
//                 </p>
//               </div>
//               {product.platformType.includes('b2b') && (
//                 <>
//                   <div>
//                     <p className="text-gray-600">Min Order Quantity</p>
//                     <p className="font-medium">{product.minOrderQuantity}</p>
//                   </div>
//                   {product.maxOrderQuantity && (
//                     <div>
//                       <p className="text-gray-600">Max Order Quantity</p>
//                       <p className="font-medium">{product.maxOrderQuantity}</p>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Reviews Section */}
//       <div className="mt-12 border-t pt-8">
//         <h2 className="text-2xl font-semibold mb-6">Customer Reviews</h2>

//         {/* Review Form */}
//         <form onSubmit={handleReviewSubmit} className="mb-8">
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Rating
//             </label>
//             <div className="flex items-center gap-1">
//               {[...Array(5)].map((_, index) => {
//                 const ratingValue = index + 1;
//                 return (
//                   <button
//                     type="button"
//                     key={ratingValue}
//                     className={`text-2xl transition-colors ${
//                       ratingValue <= (hover || rating) 
//                         ? 'text-yellow-400' 
//                         : 'text-gray-300'
//                     }`}
//                     onClick={() => setRating(ratingValue)}
//                     onMouseEnter={() => setHover(ratingValue)}
//                     onMouseLeave={() => setHover(0)}
//                   >
//                     <FaStar />
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="mb-4">
//             <label 
//               htmlFor="comment" 
//               className="block text-sm font-medium text-gray-700 mb-2"
//             >
//               Your Review
//             </label>
//             <textarea
//               id="comment"
//               rows="4"
//               value={comment}
//               onChange={(e) => setComment(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Write your review here..."
//             />
//           </div>

//           {reviewError && (
//             <div className="mb-4 text-red-600">{reviewError}</div>
//           )}

//           {reviewSuccess && (
//             <div className="mb-4 text-green-600">{reviewSuccess}</div>
//           )}

//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
//               isSubmitting 
//                 ? 'bg-gray-400 cursor-not-allowed' 
//                 : 'bg-blue-600 hover:bg-blue-700'
//             }`}
//           >
//             {isSubmitting ? 'Submitting...' : 'Submit Review'}
//           </button>
//         </form>

//         {/* Reviews List */}
//         <div className="space-y-6">
//           {product.reviews && product.reviews.length > 0 ? (
//             product.reviews.map((review) => (
//               <div key={review._id} className="border-b pb-6">
//                 <div className="flex items-center justify-between mb-2">
//                   <div className="flex items-center">
//                     <span className="font-medium mr-2">
//                       {review.user.firstname} {review.user.lastname}
//                     </span>
//                     <div className="flex text-yellow-400">
//                       {[...Array(5)].map((_, index) => (
//                         <FaStar
//                           key={index}
//                           className={index < review.rating ? 'text-yellow-400' : 'text-gray-300'}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                   <span className="text-sm text-gray-500">
//                     {new Date(review.createdAt).toLocaleDateString()}
//                   </span>
//                 </div>
//                 <p className="text-gray-700">{review.comment}</p>
//               </div>
//             ))
//           ) : (
//             <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductDetail;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { cartAdd } from '../store/cartSlice';
import YouTube from 'react-youtube';

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
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [purchaseStatus, setPurchaseStatus] = useState({
    hasPurchased: false,
    hasReviewed: false,
    orderDate: null,
    orderStatus: null
  });

  // Add this function to check if user has purchased the product
  const checkPurchaseHistory = async () => {
    try {
      const response = await axios.get(`/api/orders/check-purchase/${id}`, {
        withCredentials: true
      });
      setPurchaseStatus(response.data);
    } catch (error) {
      console.error('Error checking purchase history:', error);
      setPurchaseStatus({
        hasPurchased: false,
        hasReviewed: false,
        orderDate: null,
        orderStatus: null
      });
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
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Function to extract YouTube video ID
  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
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
        setError(err.response?.data?.message || 'Failed to fetch product details');
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  // Fetch cart items<div className="mt-12 border-t pt-8">
  const fetchCartItems = async () => {
    try {
      const res = await axios.get("/api/cart/getCartItems", {
        withCredentials: true
      });
      if (res.data.success) {
        setCartItems(res.data.cart?.items || []);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setCartItems([]);
    }
  };

  useEffect(() => {
    if(userData) {
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
      setQuantity(prev => prev + 1);
    } else {
      toast.error('Maximum stock limit reached');
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Handle add to cart
  const handleAddToCart = async (productId) => {
    if (!userData) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      const res = await axios.post("/api/cart/add", {
        productId,
        quantity: quantity
      }, {
        withCredentials: true
      });

      if (res.data.success) {
        dispatch(cartAdd());
        toast.success('Added to cart successfully');
        fetchCartItems();
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const isProductInCart = (productId) => {
    return cartItems && cartItems.length > 0 
      ? cartItems.some((item) => item?.productId?._id === productId)
      : false;
  };

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!userData) {
      toast.error('Please login to submit a review');
      navigate('/login');
      return;
    }

    if (rating === 0) {
      setReviewError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setReviewError('Please write a review');
      return;
    }

    setIsSubmitting(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const response = await axios.post(`/api/products/${id}/reviews`, 
        { rating, comment },
        { withCredentials: true }
      );

      setProduct(prevProduct => ({
        ...prevProduct,
        reviews: [...prevProduct.reviews, response.data.review]
      }));

      setRating(0);
      setComment('');
      setReviewSuccess('Review submitted successfully!');
      toast.success('Review submitted successfully!');
      
      setTimeout(() => setReviewSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to submit review';
      setReviewError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
                  width: '100%',
                  height: '400',
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
                  product.stock <= 0 ? 'opacity-50 grayscale' : ''
                }`}
                onError={(e) => {
                  setImageError(prev => ({...prev, [selectedMedia]: true}));
                  e.target.src = '/placeholder-image.jpg'; // Add a placeholder image
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

          {/* Thumbnails */}
          {/* <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleMediaSelect(index, image)}
                className={`border-2 rounded-md overflow-hidden relative aspect-square ${
                  selectedMedia === index ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                {isYoutubeLink(image) ? (
                  <div className="w-full h-20 bg-gray-100 flex items-center justify-center">
                    <svg 
                      className="w-8 h-8 text-red-600" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                  </div>
                ) : (
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className={`w-full h-20 object-contain ${
                      product.stock <= 0 ? 'opacity-50 grayscale' : ''
                    }`}
                    onError={(e) => {
                      setImageError(prev => ({...prev, [index]: true}));
                      e.target.src = '/placeholder-image.jpg'; // Add a placeholder image
                    }}
                  />
                )}
              </button>
            ))}
          </div> */}
          {/* Thumbnails */}
<div className="grid grid-cols-4 gap-2">
  {product.images.map((image, index) => (
    <button
      key={index}
      onClick={() => handleMediaSelect(index, image)}
      className={`border-2 rounded-md overflow-hidden relative aspect-square ${
        selectedMedia === index ? 'border-blue-500' : 'border-gray-200'
      }`}
    >
      {isYoutubeLink(image) ? (
        <div className="relative w-full h-20">
          <img
            src={`https://img.youtube.com/vi/${getYoutubeVideoId(image)}/default.jpg`}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
            <svg 
              className="w-8 h-8 text-white" 
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      ) : (
        <img
          src={image}
          alt={`${product.name} thumbnail ${index + 1}`}
          className={`w-full h-20 object-contain ${
            product.stock <= 0 ? 'opacity-50 grayscale' : ''
          }`}
          onError={(e) => {
            setImageError(prev => ({...prev, [index]: true}));
            e.target.src = '/placeholder-image.jpg'; // Add a placeholder image
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
            <span className={`${
              product.stock > 0 ? 'text-green-600' : 'text-red-600'
            } font-semibold`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
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
          )}

          {/* Add to Cart Button */}
          <button
            onClick={() => handleAddToCart(product._id)}
            disabled={product.stock === 0 || isProductInCart(product._id)}
            className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-colors ${
              product.stock === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : isProductInCart(product._id)
                ? 'bg-green-600'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {product.stock === 0 
              ? 'Out of Stock' 
              : isProductInCart(product._id)
              ? 'In Cart'
              : 'Add to Cart'}
          </button>

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
                <p className="font-medium">{product.unitSize} {product.unitType}</p>
              </div>
              <div>
                <p className="text-gray-600">Seller</p>
                <p className="font-medium">
                  {product.seller.firstname} {product.seller.lastname}
                </p>
              </div>
              {product.platformType.includes('b2b') && (
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

        {/* Review Form */}
        {/* <form onSubmit={handleReviewSubmit} className="mb-8">
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
                        ? 'text-yellow-400' 
                        : 'text-gray-300'
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
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form> */}

        {/* Reviews List */}
        {/* <div className="space-y-6">
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
                          className={index < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          )}
        </div> */}
        {userData ? 
        (purchaseStatus.hasPurchased ? (
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
                        ? 'text-yellow-400' 
                        : 'text-gray-300'
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
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>

      ) 
    ): (
        <div className="mb-8 p-4 bg-gray-50 rounded-md">
          <p className="text-gray-600">
            Only customers who have purchased this product can leave a review.
          </p>
        </div>
      )
    ) : (
      <div className="mb-8 p-4 bg-gray-50 rounded-md">
        <p className="text-gray-600">
          Please <Link to="/login" className="text-blue-600 hover:underline">login</Link> to leave a review.
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
                      className={index < review.rating ? 'text-yellow-400' : 'text-gray-300'}
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