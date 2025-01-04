// product detail page normal
// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';

// const ProductDetail = () => {
//   const { id } = useParams();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [quantity, setQuantity] = useState(1);

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

//   const handleQuantityChange = (e) => {
//     const value = parseInt(e.target.value);
//     if (value > 0 && value <= product.stock) {
//       setQuantity(value);
//     }
//   };

//   const incrementQuantity = () => {
//     if (quantity < product.stock) {
//       setQuantity(prev => prev + 1);
//     }
//   };

//   const decrementQuantity = () => {
//     if (quantity > 1) {
//       setQuantity(prev => prev - 1);
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
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
//       <div className="flex flex-col md:flex-row gap-8">
//         {/* Left Column - Images */}
//         <div className="md:w-1/2">
//           <div className="mb-4">
//             <img
//               src={product.images[selectedImage]}
//               alt={product.name}
//               className="w-full h-[400px] object-cover rounded-lg"
//             />
//           </div>
//           <div className="grid grid-cols-4 gap-2">
//             {product.images.map((image, index) => (
//               <button
//                 key={index}
//                 onClick={() => setSelectedImage(index)}
//                 className={`border-2 rounded-md overflow-hidden ${
//                   selectedImage === index ? 'border-blue-500' : 'border-gray-200'
//                 }`}
//               >
//                 <img
//                   src={image}
//                   alt={`${product.name} thumbnail ${index + 1}`}
//                   className="w-full h-20 object-cover"
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
//                   className="px-3 py-1 border rounded-l bg-gray-100 hover:bg-gray-200"
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
//                   className="px-3 py-1 border rounded-r bg-gray-100 hover:bg-gray-200"
//                 >
//                   +
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Add to Cart Button */}
//           <button
//             disabled={product.stock === 0}
//             className={`w-full py-3 px-6 rounded-lg text-white font-semibold ${
//               product.stock > 0
//                 ? 'bg-blue-600 hover:bg-blue-700'
//                 : 'bg-gray-400 cursor-not-allowed'
//             }`}
//           >
//             {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
//           </button>

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

//           {/* Reviews Section */}
//           {product.reviews && product.reviews.length > 0 && (
//             <div className="mt-8">
//               <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
//               <div className="space-y-4">
//                 {product.reviews.map((review) => (
//                   <div key={review._id} className="border-b pb-4">
//                     <div className="flex items-center mb-2">
//                       <span className="font-medium mr-2">
//                         {review.user.firstname} {review.user.lastname}
//                       </span>
//                       <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
//                       <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
//                     </div>
//                     <p className="text-gray-700">{review.comment}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductDetail;

// add review
// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import { FaStar } from 'react-icons/fa'; // Make sure to install react-icons

// const ProductDetail = () => {
//   const { id } = useParams();
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

//   // Handle review submission
//   const handleReviewSubmit = async (e) => {
//     e.preventDefault();
//     setReviewError('');
//     setReviewSuccess('');
    
//     if (rating === 0) {
//       setReviewError('Please select a rating');
//       return;
//     }

//     if (!comment.trim()) {
//       setReviewError('Please write a review');
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const response = await axios.post(`/api/products/${id}/reviews`, {
//         rating,
//         comment
//       });

//       // Update the product with the new review
//       setProduct(prevProduct => ({
//         ...prevProduct,
//         reviews: [...prevProduct.reviews, response.data.review]
//       }));

//       // Reset form
//       setRating(0);
//       setComment('');
//       setReviewSuccess('Review submitted successfully!');
      
//       // Hide success message after 3 seconds
//       setTimeout(() => setReviewSuccess(''), 3000);
//     } catch (err) {
//       setReviewError(err.response?.data?.message || 'Failed to submit review');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // ... existing code (loading, error handling, etc.) ...

//   // Review Section Component
//   const ReviewSection = () => (
//     <div className="mt-12 border-t pt-8">
//       <h2 className="text-2xl font-semibold mb-6">Customer Reviews</h2>

//       {/* Review Form */}
//       <form onSubmit={handleReviewSubmit} className="mb-8">
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Rating
//           </label>
//           <div className="flex items-center gap-1">
//             {[...Array(5)].map((_, index) => {
//               const ratingValue = index + 1;
//               return (
//                 <button
//                   type="button"
//                   key={ratingValue}
//                   className={`text-2xl ${
//                     ratingValue <= (hover || rating) 
//                       ? 'text-yellow-400' 
//                       : 'text-gray-300'
//                   }`}
//                   onClick={() => setRating(ratingValue)}
//                   onMouseEnter={() => setHover(ratingValue)}
//                   onMouseLeave={() => setHover(0)}
//                 >
//                   <FaStar />
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         <div className="mb-4">
//           <label 
//             htmlFor="comment" 
//             className="block text-sm font-medium text-gray-700 mb-2"
//           >
//             Your Review
//           </label>
//           <textarea
//             id="comment"
//             rows="4"
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Write your review here..."
//           />
//         </div>

//         {reviewError && (
//           <div className="mb-4 text-red-600">{reviewError}</div>
//         )}

//         {reviewSuccess && (
//           <div className="mb-4 text-green-600">{reviewSuccess}</div>
//         )}

//         <button
//           type="submit"
//           disabled={isSubmitting}
//           className={`px-4 py-2 rounded-md text-white font-medium ${
//             isSubmitting 
//               ? 'bg-gray-400 cursor-not-allowed' 
//               : 'bg-blue-600 hover:bg-blue-700'
//           }`}
//         >
//           {isSubmitting ? 'Submitting...' : 'Submit Review'}
//         </button>
//       </form>

//       {/* Reviews List */}
//       <div className="space-y-6">
//         {product.reviews && product.reviews.length > 0 ? (
//           product.reviews.map((review) => (
//             <div key={review._id} className="border-b pb-6">
//               <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center">
//                   <span className="font-medium mr-2">
//                     {review.user.firstname} {review.user.lastname}
//                   </span>
//                   <div className="flex text-yellow-400">
//                     {[...Array(5)].map((_, index) => (
//                       <FaStar
//                         key={index}
//                         className={index < review.rating ? 'text-yellow-400' : 'text-gray-300'}
//                       />
//                     ))}
//                   </div>
//                 </div>
//                 <span className="text-sm text-gray-500">
//                   {new Date(review.createdAt).toLocaleDateString()}
//                 </span>
//               </div>
//               <p className="text-gray-700">{review.comment}</p>
//             </div>
//           ))
//         ) : (
//           <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* ... existing product detail code ... */}

//       {/* Add ReviewSection component */}
//       <ReviewSection />
//     </div>
//   );
// };

// export default ProductDetail;

// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import { FaStar } from 'react-icons/fa';
// // import { useCart } from '../context/CartContext';
// // import { useCart } from '../components/context/CartContext';
// import { toast } from 'react-hot-toast';
// // import { useAuth } from '../components/context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { selectCartItems } from '../store/cartSlice';

// const ProductDetail = () => {
//   const { id } = useParams();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [quantity, setQuantity] = useState(1);
//   // const { addToCart, cart } = useCart();
//   const { addToCart } = useDispatch();
//   const cart = useSelector(selectCartItems);
//   // const { user } = useAuth();
//   const { userData } = useSelector((state) => state.user);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

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
//     }
//   };

//   const decrementQuantity = () => {
//     if (quantity > 1) {
//       setQuantity(prev => prev - 1);
//     }
//   };

//   // Handle add to cart
//   const handleAddToCart = (productId) => {
//     console.log(productId);
//     if (!userData) {
//         toast.error('Please login to add items to cart');
//         navigate('/login');
//         return;
//       }
      
//     if (quantity > product.stock) {
//       toast.error('Not enough stock available');
//       return;
//     }

//     const existingItem = cart.find(item => item.productId === product._id);
//     if (existingItem && (existingItem.quantity + quantity) > product.stock) {
//       toast.error('Cannot add more items than available in stock');
//       return;
//     }

    
//     const cartItem = {
//       productId: product._id,
//       name: product.name,
//       price: product.price,
//       image: product.images[0],
//       quantity: quantity,
//       stock: product.stock,
//       unitType: product.unitType
//     };

//     dispatch(addToCart(cartItem));
//     toast.success('Added to cart successfully!');
//     navigate('/cart');
//   };

//   // Handle review submission
//   const handleReviewSubmit = async (e) => {
//     e.preventDefault();
//     setReviewError('');
//     setReviewSuccess('');
    
//     if (rating === 0) {
//       setReviewError('Please select a rating');
//       return;
//     }

//     if (!comment.trim()) {
//       setReviewError('Please write a review');
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const response = await axios.post(`/api/products/${id}/reviews`, {
//         rating,
//         comment
//       });

//       setProduct(prevProduct => ({
//         ...prevProduct,
//         reviews: [...prevProduct.reviews, response.data.review]
//       }));

//       setRating(0);
//       setComment('');
//       setReviewSuccess('Review submitted successfully!');
      
//       setTimeout(() => setReviewSuccess(''), 3000);
//     } catch (err) {
//       setReviewError(err.response?.data?.message || 'Failed to submit review');
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
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
//       <div className="flex flex-col md:flex-row gap-8">
//         {/* Left Column - Images */}
//         <div className="md:w-1/2">
//           <div className="mb-4">
//             <img
//               src={product.images[selectedImage]}
//               alt={product.name}
//               className="w-full h-[400px] object-cover rounded-lg"
//             />
//           </div>
//           <div className="grid grid-cols-4 gap-2">
//             {product.images.map((image, index) => (
//               <button
//                 key={index}
//                 onClick={() => setSelectedImage(index)}
//                 className={`border-2 rounded-md overflow-hidden ${
//                   selectedImage === index ? 'border-blue-500' : 'border-gray-200'
//                 }`}
//               >
//                 <img
//                   src={image}
//                   alt={`${product.name} thumbnail ${index + 1}`}
//                   className="w-full h-20 object-cover"
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
//                   className="px-3 py-1 border rounded-l bg-gray-100 hover:bg-gray-200"
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
//                   className="px-3 py-1 border rounded-r bg-gray-100 hover:bg-gray-200"
//                 >
//                   +
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Add to Cart Button */}
//           <button
//             onClick={()=>handleAddToCart(product._id)}
//             disabled={product.stock === 0}
//             className={`w-full py-3 px-6 rounded-lg text-white font-semibold ${
//               product.stock > 0
//                 ? 'bg-blue-600 hover:bg-blue-700'
//                 : 'bg-gray-400 cursor-not-allowed'
//             }`}
//           >
//             {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
//           </button>

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
//                     className={`text-2xl ${
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
//             className={`px-4 py-2 rounded-md text-white font-medium ${
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
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { cartAdd } from '../store/cartSlice';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  // const cartItems = useSelector(state => state.cart.items);
  
  // Local states
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Review states
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data.product);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch product details');
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

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
  // const handleAddToCart = () => {
  //   if (!userData) {
  //     toast.error('Please login to add items to cart');
  //     navigate('/login');
  //     return;
  //   }

  //   if (quantity > product.stock) {
  //     toast.error('Not enough stock available');
  //     return;
  //   }

  //   const existingItem = cartItems.find(item => item.product._id === product._id);
  //   if (existingItem && (existingItem.quantity + quantity) > product.stock) {
  //     toast.error('Cannot add more items than available in stock');
  //     return;
  //   }

  //   dispatch(addToCart({
  //     productId: product._id,
  //     quantity: quantity
  //   }));
  // };
  const [cartItems, setCartItems] = useState([]);
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

    if(userData)
   {
     fetchCartItems();
   }
 }, []);

 const handleAddToCart = async (productId) => {
  if (!userData) {
    toast.error('Please login to add items to cart');
    navigate('/login');
    return;
  }

  try {
    const res = await axios.post("/api/cart/add", {
      productId,
      quantity: quantity  // Add the quantity from your state
    }, {
      withCredentials: true  // Important: This sends cookies with the request
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl font-semibold">Product not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Product Details Section */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - Images */}
        <div className="md:w-1/2">
          <div className="mb-4">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-[400px] object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`border-2 rounded-md overflow-hidden transition-colors ${
                  selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="w-full h-20 object-cover"
                />
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
         {/* <Link to="/cart">
          <button
            onClick={()=>handleAddToCart(product._id)}
            disabled={product.stock === 0}
            className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-colors ${
              product.stock > 0
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
          </Link> */}
          {/* Replace the Link wrapper with just the button */}
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

          {/* Additional Details */}
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
              </div>
            ))
          ) : (
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;