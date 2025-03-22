import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FaShoppingCart, FaMinus, FaPlus, FaCheck, FaStar, FaArrowRight, FaFilter, FaTimes } from 'react-icons/fa';
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

const CategoryProducts = ({ category, hideViewAll = false, city }) => {
  const { category: urlCategory } = useParams();
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

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchProducts = async (filters = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      // Get category from URL params first, then fallback to props
      const categoryToUse = urlCategory || category;
      
      // Add category to query params if available
      if (categoryToUse) {
        // Convert URL format back to proper category name
        const formattedCategory = categoryToUse
          .split('-')
          .map(word => {
            // Special handling for 'and' to convert to '&'
            if (word === 'and') return '&';
            return word.charAt(0).toUpperCase() + word.slice(1);
          })
          .join(' ');
        queryParams.append('category', formattedCategory);
      }

      // Add city filter if available
      if (city) {
        queryParams.append('city', city);
      }

      // Add all filter parameters
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.rating) queryParams.append('minRating', filters.rating);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.search) queryParams.append('search', filters.search);

      // Always add platformType
      queryParams.append('platformType', 'b2c');

      console.log('API Query:', `/api/products/filtered?${queryParams.toString()}`);
      const response = await axios.get(`/api/products/filtered?${queryParams.toString()}`);
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch products whenever category or URL category changes
    fetchProducts(currentFilters);
  }, [category, urlCategory, city]);

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
    return <div className="animate-pulse grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
      ))}
    </div>;
  }

  return (
    <div className="py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter Toggle Button - Only show on View All page */}
        {!hideViewAll && (
          <div className="mb-4">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
            >
              {isFilterOpen ? <FaTimes className="w-4 h-4" /> : <FaFilter className="w-4 h-4" />}
              {isFilterOpen ? 'Close Filters' : 'Open Filters'}
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                {Object.values(tempFilters).filter(value => value !== '').length} Active
              </span>
            </button>
          </div>
        )}

        {/* Filter Section - Only show on View All page */}
        <AnimatePresence>
          {!hideViewAll && isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Price Range */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Price Range</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          placeholder="Min"
                          value={tempFilters.minPrice}
                          onChange={(e) => setTempFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                          className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                        />
                      </div>
                      <span className="text-gray-400">-</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={tempFilters.maxPrice}
                          onChange={(e) => setTempFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                          className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRatingClick(rating)}
                          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border transition-all ${
                            tempFilters.rating === rating.toString()
                              ? 'bg-blue-50 border-blue-500 text-blue-700'
                              : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                          }`}
                        >
                          {rating}
                          <FaStar className={tempFilters.rating === rating.toString() ? 'text-blue-500' : 'text-yellow-400'} size={12} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Sort By</label>
                    <select
                      value={tempFilters.sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none bg-white"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="rating_high">Highest Rated</option>
                      <option value="most_sold">Most Sold</option>
                    </select>
                  </div>

                  {/* Search */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Search</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={tempFilters.search || ''}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => {
                      setTempFilters({
                        minPrice: '',
                        maxPrice: '',
                        rating: '',
                        sortBy: 'newest',
                        search: ''
                      });
                      fetchProducts({});
                      setIsFilterOpen(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2 hover:bg-gray-50 rounded-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset All
                  </button>
                  <button
                    onClick={() => {
                      handleApplyFilter();
                      setIsFilterOpen(false);
                    }}
                    className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found in this category.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {products.map((product) => (
              <motion.div
                key={product._id}
                variants={productCardVariants}
                whileHover="hover"
                onClick={() => navigate(`/product/${product._id}`)}
                className="cursor-pointer"
              >
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
                  {/* Product Image */}
                  <div className="relative pt-[100%] overflow-hidden rounded-t-lg">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-2 flex flex-col flex-grow">
                    <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold">₹{product.price}</span>
                        <span className="text-xs text-gray-500">per {product.unitType || 'piece'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex">
                        {[...Array(5)].map((_, index) => (
                          <FaStar
                            key={index}
                            className={`w-3 h-3 ${
                              index < (product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        ({product.reviews?.length || 0})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <span className="text-gray-500">Stock: {product.stock}</span>
                    </div>

                    {/* Add to Cart Section */}
                    {product.stock > 0 && (
                      <div className="mt-2">
                        {cartItems[product._id] ? (
                          <div 
                            className="flex items-center justify-between bg-gray-50 rounded-lg p-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleUpdateQuantity(
                                product._id,
                                cartItems[product._id].quantity - 1,
                                product.stock
                              )}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            >
                              <FaMinus className="w-3 h-3" />
                            </button>
                            <span className="font-medium text-sm">
                              {cartItems[product._id].quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(
                                product._id,
                                cartItems[product._id].quantity + 1,
                                product.stock
                              )}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            >
                              <FaPlus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product._id);
                            }}
                            disabled={isAddingToCart[product._id]}
                            className="w-full bg-blue-600 text-white py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 text-sm"
                          >
                            <FaShoppingCart className="w-3 h-3" />
                            {isAddingToCart[product._id] ? 'Adding...' : 'Add to Cart'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts; 