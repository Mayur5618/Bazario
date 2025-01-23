import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FaShoppingCart, FaMinus, FaPlus, FaCheck, FaStar } from 'react-icons/fa';
import { cartAdd, cartRemove, updateCartItemQuantity } from '../store/cartSlice';
import ProductFilter from './ProductFilter';
import ProductCard from './ProductCard';

// Cool animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const productCardVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const buttonVariants = {
  initial: { scale: 0 },
  animate: { 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  },
  tap: { scale: 0.95 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2
    }
  }
};

const quantityControlsVariants = {
  initial: { 
    opacity: 0,
    scale: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  exit: {
    opacity: 0,
    scale: 0,
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

const loadingContainerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const loadingDotVariants = {
  initial: {
    y: 0,
    scale: 1
  },
  animate: {
    y: [-10, 0],
    scale: [1, 1.2, 1],
    transition: {
      repeat: Infinity,
      duration: 0.8
    }
  }
};

const CategoryProducts = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sortBy: searchParams.get('sortBy') || 'newest'
  });
  const [cartItems, setCartItems] = useState({});
  const [isAddingToCart, setIsAddingToCart] = useState({});
  const userData = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Create a ref to store the current toast ID
  const toastId = React.useRef(null);
  const toastDuration = 2000; // Duration for success messages

  // Add new state for temporary filters
  const [tempFilters, setTempFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sortBy: searchParams.get('sortBy') || 'newest'
  });

  const fetchProducts = async (filters) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      // Add category
      if (category) {
        queryParams.append('category', category);
      }

      // Add filters
      if (filters) {
        if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
        if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
        // Change rating filter to match backend expectation
        if (filters.rating) queryParams.append('rating', filters.rating);
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      }

      // Always add platformType
      queryParams.append('platformType', 'b2c');

      const response = await axios.get(`/api/products/filtered?${queryParams.toString()}`);
      console.log('Filter params:', queryParams.toString()); // Debug log
      
      if (response.data.success) {
        // Client-side rating filter if server doesn't handle it
        let filteredProducts = response.data.products;
        if (filters?.rating) {
          filteredProducts = filteredProducts.filter(
            product => product.rating >= parseInt(filters.rating)
          );
        }
        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentFilters);
  }, [category, searchParams.get('query')]);

  // Fetch cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userData) return;

      try {
        const response = await axios.get("/api/cart/getCartItems", {
          withCredentials: true
        });
        if (response.data.success) {
          const cartItemsMap = {};
          response.data.cart.items.forEach(item => {
            cartItemsMap[item.product._id] = item;
          });
          setCartItems(cartItemsMap);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchCartItems();
  }, [userData]);

  const showToastMessage = (product, quantity, action, isLoading = false) => {
    // Dismiss any existing toast before showing a new one
    if (toastId.current) {
      toast.dismiss(toastId.current);
    }

    const toastOptions = {
      duration: isLoading ? Infinity : toastDuration,
      position: 'top-right',
      className: 'transform-gpu',
      style: {
        background: '#fff',
        color: '#333',
        padding: '16px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid #e5e7eb',
        marginTop: '16px',
        marginRight: '16px',
        minWidth: '300px',
        maxWidth: '380px',
      },
    };

    const message = (
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 flex-shrink-0">
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full rounded-md object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-800 line-clamp-1">{product.name}</p>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-blue-600">Updating cart...</span>
              </>
            ) : (
              <p className="text-sm">
                {action === 'update' ? (
                  <span className="text-blue-600 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Quantity updated to {quantity}
                  </span>
                ) : action === 'add' ? (
                  <span className="text-green-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Added to cart!
                  </span>
                ) : (
                  <span className="text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Removed from cart
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    );

    // Create new toast
    toastId.current = isLoading ? 
      toast.loading(message, toastOptions) : 
      toast.success(message, toastOptions);

    // Clear the toast ID after duration for success messages
    if (!isLoading) {
      setTimeout(() => {
        toastId.current = null;
      }, toastDuration);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!userData) {
      toast.error("Please login to add items to cart");
      navigate('/login');
      return;
    }

    setIsAddingToCart(prev => ({ ...prev, [productId]: true }));
    const product = products.find(p => p._id === productId);

    try {
      const response = await axios.post("/api/cart/add", {
        productId,
        quantity: 1,
      });

      if (response.data.success) {
        dispatch(cartAdd({ product, quantity: 1 }));
        setCartItems(prev => ({
          ...prev,
          [productId]: { product, quantity: 1 }
        }));
        showToastMessage(product, 1, 'add');
      }
    } catch (error) {
      toast.error("Failed to add item to cart");
    } finally {
      setIsAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity, maxStock) => {
    if (newQuantity < 0 || newQuantity > maxStock) return;
    
    const product = products.find(p => p._id === productId);

    try {
      // Show loading toast
      showToastMessage(product, newQuantity, 'update', true);

      if (newQuantity === 0) {
        const response = await axios.delete(`/api/cart/remove/${productId}`);
        if (response.data.success) {
          dispatch(cartRemove(productId));
          setCartItems(prev => {
            const newItems = { ...prev };
            delete newItems[productId];
            return newItems;
          });
          // Show success message for removal
          showToastMessage(product, 0, 'remove', false);
        }
      } else {
        const response = await axios.put(`/api/cart/update/${productId}`, {
          quantity: newQuantity
        });
        if (response.data.success) {
          dispatch(updateCartItemQuantity({ productId, quantity: newQuantity }));
          setCartItems(prev => ({
            ...prev,
            [productId]: { ...prev[productId], quantity: newQuantity }
          }));
          // Show success message for update
          showToastMessage(product, newQuantity, 'update', false);
        }
      }
    } catch (error) {
      if (toastId.current) {
        toast.dismiss(toastId.current);
      }
      toast.error("Failed to update cart");
    }
  };

  // Update the filter handlers to use tempFilters instead of directly fetching
  const handleRatingClick = (rating) => {
    const newRating = tempFilters.rating === rating.toString() ? '' : rating.toString();
    setTempFilters(prev => ({ ...prev, rating: newRating }));
  };

  const handleSortChange = (value) => {
    setTempFilters(prev => ({ ...prev, sortBy: value }));
  };

  const handleApplyFilter = () => {
    setCurrentFilters(tempFilters);
    fetchProducts(tempFilters);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Title */}
        <h1 className="text-2xl font-bold mb-8 capitalize">{category}</h1>

        {/* Main Layout */}
        <div className="flex gap-8">
          {/* Filter Sidebar - Sticky position */}
          <aside className="w-72 shrink-0">
            <div className="bg-white rounded-lg shadow-sm sticky top-[84px]">
              <div className="p-6">
                {/* Filter Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                  <button
                    onClick={() => {
                      const resetFilters = {
                        minPrice: '',
                        maxPrice: '',
                        rating: '',
                        sortBy: 'newest'
                      };
                      setTempFilters(resetFilters);
                      setCurrentFilters(resetFilters);
                      fetchProducts(resetFilters);
                    }}
                    className="text-blue-600 text-sm hover:underline font-medium"
                  >
                    Clear All
                  </button>
                </div>

                {/* Filter Content */}
                <div className="space-y-6">
                  {/* Price Range */}
                  <div className="mb-6">
                    <h3 className="text-base font-medium mb-3">Price Range</h3>
                    <div className="flex gap-4">
                      <input
                        type="number"
                        placeholder="Min"
                        value={tempFilters.minPrice}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                        className="w-full px-3 py-2 border rounded"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={tempFilters.maxPrice}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mb-6">
                    <h3 className="text-base font-medium mb-3">Rating</h3>
                    <div className="space-y-2">
                      {[4, 3, 2, 1].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRatingClick(rating)}
                          className={`w-full flex items-center p-2 rounded ${
                            tempFilters.rating === rating.toString() ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex">
                            {[...Array(5)].map((_, index) => (
                              <FaStar
                                key={index}
                                className={`w-4 h-4 ${
                                  index < rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">& Up</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="mb-6">
                    <h3 className="text-base font-medium mb-3">Sort By</h3>
                    <select
                      value={tempFilters.sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="newest">Newest</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="rating_high">Highest Rated</option>
                      <option value="most_sold">Most Sold</option>
                    </select>
                  </div>
                </div>

                {/* Apply Filters Button */}
                <div className="mt-6">
                  <button
                    onClick={handleApplyFilter}
                    className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Products Grid */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[400px]"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="wait">
                {products.length === 0 ? (
                  // No products message
                  <div className="col-span-full flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <p className="text-gray-500 text-lg">No products found</p>
                      <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
                    </div>
                  </div>
                ) : (
                  // Product cards
                  products.map((product) => (
                    <motion.div
                      key={product._id}
                      variants={productCardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-full"
                    >
                      {/* Product Image with fixed aspect ratio */}
                      <div className="relative w-full pt-[100%] mb-4 overflow-hidden rounded-lg">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex flex-col flex-grow">
                        {/* Title */}
                        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>

                        {/* Price and Unit */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl font-bold">₹{product.price}</span>
                          <span className="text-sm text-gray-500">per {product.unit}</span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, index) => (
                              <FaStar
                                key={index}
                                className={`w-4 h-4 ${
                                  index < product.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {product.rating} ({product.reviews?.length || 0})
                          </span>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-green-600">In Stock</span>
                          <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                        </div>

                        {/* Add to Cart Button */}
                        <div className="mt-auto">
                          {cartItems[product._id] ? (
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                              <button
                                onClick={() => handleUpdateQuantity(
                                  product._id,
                                  cartItems[product._id].quantity - 1,
                                  product.stock
                                )}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              >
                                <FaMinus className="w-4 h-4" />
                              </button>
                              <span className="text-lg font-medium">
                                {cartItems[product._id].quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(
                                  product._id,
                                  cartItems[product._id].quantity + 1,
                                  product.stock
                                )}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              >
                                <FaPlus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(product._id)}
                              disabled={isAddingToCart[product._id]}
                              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <FaShoppingCart className="w-4 h-4" />
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CategoryProducts; 