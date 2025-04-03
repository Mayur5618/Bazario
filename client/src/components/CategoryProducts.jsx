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

const CategoryProducts = ({ category, hideViewAll = false, city, showFilters = false }) => {
  const { category: urlCategory } = useParams();
  const [searchParams] = useSearchParams();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    platformType: 'b2c'
  });
  const [tempFilters, setTempFilters] = useState(currentFilters);
  const [cartItems, setCartItems] = useState({});
  const [isAddingToCart, setIsAddingToCart] = useState({});
  const userData = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Create a ref to store the current toast ID
  const toastId = React.useRef(null);
  const toastDuration = 2000; // Duration for success messages

  const fetchProducts = async (filters = {}) => {
    try {
      setLoading(true);
      
      // Get category from URL params first, then fallback to props
      const categoryToUse = urlCategory || category;
      
      if (!categoryToUse) {
        throw new Error('Category is required');
      }

      // Format category for URL
      const formattedCategory = categoryToUse.toLowerCase();
      
      // Add city parameter if available
      const cityParam = city ? `?city=${encodeURIComponent(city)}` : '';
      
      // Make API call with new URL format
      console.log('API URL:', `/api/products/web/category/${formattedCategory}${cityParam}`);
      const response = await axios.get(`/api/products/web/category/${formattedCategory}${cityParam}`);
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        // Store subcategories directly
        let filteredSubcategories = response.data.subcategories.map(sub => {
          let filteredProducts = sub.products;
          
          // Apply filters to products in each subcategory
          if (filters.minPrice) {
            filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice);
          }
          if (filters.maxPrice) {
            filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice);
          }
          if (filters.rating) {
            filteredProducts = filteredProducts.filter(p => p.rating >= filters.rating);
          }
          
          // Apply sorting within each subcategory
          if (filters.sortBy) {
            switch(filters.sortBy) {
              case 'price_low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
              case 'price_high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
              case 'rating_high':
                filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
              default:
                filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }
          }
          
          return {
            ...sub,
            products: filteredProducts
          };
        });

        // Filter out subcategories with no products after filtering
        filteredSubcategories = filteredSubcategories.filter(sub => sub.products.length > 0);
        
        setSubcategories(filteredSubcategories);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch products whenever category, URL category, city or currentFilters changes
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
            src={product.images[0] || '/placeholder-image.jpg'} 
            alt={product.name || 'Product'} 
            className="w-full h-full rounded-md object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-800 line-clamp-1">{product.name || 'Unnamed Product'}</p>
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
    const product = subcategories.find(sub => sub.products.some(p => p._id === productId));

    try {
      const response = await axios.post("/api/cart/add", {
        productId,
        quantity: 1,
      });

      if (response.data.success) {
        dispatch(cartAdd({ product: product.products.find(p => p._id === productId), quantity: 1 }));
        setCartItems(prev => ({
          ...prev,
          [productId]: { product: product.products.find(p => p._id === productId), quantity: 1 }
        }));
        showToastMessage(product.products.find(p => p._id === productId), 1, 'add');
      }
    } catch (error) {
      toast.error("Failed to add item to cart");
    } finally {
      setIsAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity, maxStock) => {
    if (newQuantity < 0 || newQuantity > maxStock) return;
    
    const product = subcategories.find(sub => sub.products.some(p => p._id === productId));

    try {
      // Show loading toast
      showToastMessage(product.products.find(p => p._id === productId), newQuantity, 'update', true);

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
          showToastMessage(product.products.find(p => p._id === productId), 0, 'remove', false);
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
          showToastMessage(product.products.find(p => p._id === productId), newQuantity, 'update', false);
        }
      }
    } catch (error) {
      if (toastId.current) {
        toast.dismiss(toastId.current);
      }
      toast.error("Failed to update cart");
    }
  };

  if (loading) {
    return <div className="animate-pulse grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
      ))}
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-4">
          {showFilters && (
            <div className="mb-4">
              <button
                onClick={() => {
                  setShowFilterModal(!showFilterModal);
                  setTempFilters(currentFilters);
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                {showFilterModal ? <FaTimes className="w-4 h-4" /> : <FaFilter className="w-4 h-4" />}
                <span>{showFilterModal ? 'Close Filters' : 'Open Filters'}</span>
              </button>
            </div>
          )}

          <AnimatePresence>
            {showFilterModal && showFilters && (
              <>
                {/* Mobile Filter Modal */}
                <motion.div 
                  className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilterModal(false)}
                />
                <motion.div
                  className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-xl shadow-lg"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Filters</h3>
                      <button
                        onClick={() => {
                          const resetFilters = {
                            minPrice: '',
                            maxPrice: '',
                            rating: '',
                            sortBy: 'newest',
                            platformType: 'b2c'
                          };
                          setTempFilters(resetFilters);
                          setCurrentFilters(resetFilters);
                          setShowFilterModal(false);
                          fetchProducts(resetFilters);
                        }}
                        className="flex items-center gap-1 text-blue-600 text-sm hover:text-blue-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset
                      </button>
                    </div>

                    <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                      {/* Price Range */}
                      <div>
                        <h4 className="text-sm font-medium mb-3">Price Range</h4>
                        <div className="flex gap-2 items-center">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                            <input
                              type="number"
                              placeholder="Min"
                              value={tempFilters.minPrice}
                              onChange={(e) => setTempFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                              className="w-full pl-7 pr-3 py-2 border rounded text-sm"
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
                              className="w-full pl-7 pr-3 py-2 border rounded text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Rating */}
                      <div>
                        <h4 className="text-sm font-medium mb-3">Rating</h4>
                        <div className="flex flex-wrap gap-2">
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => setTempFilters(prev => ({
                                ...prev,
                                rating: prev.rating === rating.toString() ? '' : rating.toString()
                              }))}
                              className={`flex items-center gap-1 px-4 py-2 rounded-full ${
                                tempFilters.rating === rating.toString()
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              <FaStar className="text-yellow-400 w-3 h-3" />
                              <span>{rating}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sort By */}
                      <div>
                        <h4 className="text-sm font-medium mb-3">Sort By</h4>
                        <select
                          value={tempFilters.sortBy}
                          onChange={(e) => setTempFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                          className="w-full p-3 border rounded-lg text-sm bg-gray-50"
                        >
                          <option value="newest">Newest First</option>
                          <option value="price_low">Price: Low to High</option>
                          <option value="price_high">Price: High to Low</option>
                          <option value="rating_high">Highest Rated</option>
                          <option value="most_sold">Most Sold</option>
                        </select>
                      </div>
                    </div>

                    <div className="sticky bottom-0 pt-4 pb-2 bg-white border-t mt-4">
                      <button
                        onClick={() => {
                          setCurrentFilters(tempFilters);
                          setShowFilterModal(false);
                          fetchProducts(tempFilters);
                        }}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Desktop Filter Form - Keeping the existing one */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    height: { duration: 0.3, ease: "easeInOut" },
                    opacity: { duration: 0.2 }
                  }}
                  className="hidden md:block overflow-hidden"
                >
                  <div className="bg-white rounded-lg shadow-lg mb-6">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Filters</h3>
                        <button
                          onClick={() => {
                            const resetFilters = {
                              minPrice: '',
                              maxPrice: '',
                              rating: '',
                              sortBy: 'newest',
                              platformType: 'b2c'
                            };
                            setTempFilters(resetFilters);
                            setCurrentFilters(resetFilters);
                            setShowFilterModal(false);
                            fetchProducts(resetFilters);
                          }}
                          className="flex items-center gap-1 text-blue-600 text-sm hover:text-blue-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Reset
                        </button>
                      </div>

                      <h3 className="text-lg font-medium mb-4">Filters</h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Price Range */}
                        <div>
                          <h4 className="text-sm font-medium mb-3">Price Range</h4>
                          <div className="flex gap-2 items-center">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                              <input
                                type="number"
                                placeholder="Min"
                                value={tempFilters.minPrice}
                                onChange={(e) => setTempFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                                className="w-full pl-7 pr-3 py-2 border rounded text-sm"
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
                                className="w-full pl-7 pr-3 py-2 border rounded text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Rating */}
                        <div>
                          <h4 className="text-sm font-medium mb-3">Rating</h4>
                          <div className="flex flex-wrap gap-2">
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => setTempFilters(prev => ({
                                  ...prev,
                                  rating: prev.rating === rating.toString() ? '' : rating.toString()
                                }))}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded ${
                                  tempFilters.rating === rating.toString()
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                <FaStar className="text-yellow-400 w-3 h-3" />
                                <span>{rating}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Sort By */}
                        <div>
                          <h4 className="text-sm font-medium mb-3">Sort By</h4>
                          <select
                            value={tempFilters.sortBy}
                            onChange={(e) => setTempFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                            className="w-full p-2 border rounded text-sm"
                          >
                            <option value="newest">Newest First</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="rating_high">Highest Rated</option>
                            <option value="most_sold">Most Sold</option>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setCurrentFilters(tempFilters);
                          setShowFilterModal(false);
                          fetchProducts(tempFilters);
                        }}
                        className="w-full mt-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Subcategories */}
          {subcategories?.length > 0 ? (
            subcategories.map((subcategory, index) => (
              <div key={subcategory.subcategory || index} className="mb-10">
                <h2 className="text-xl font-semibold mb-6 text-gray-800">
                  {subcategory.subcategory || 'Products'}
                </h2>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
                >
                  {subcategory.products?.map((product) => (
                    <motion.div
                      key={product._id}
                      variants={productCardVariants}
                      whileHover="hover"
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      <Link to={`/product/${product._id}`} className="block">
                        <div className="aspect-w-1 aspect-h-1 relative overflow-hidden">
                          <img
                            src={product.images?.[0] || '/placeholder-image.jpg'}
                            alt={product.name || 'Product'}
                            className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {product.name || 'Unnamed Product'}
                          </h3>
                          <div className="mt-2 flex justify-between items-center">
                            <p className="text-lg font-semibold text-gray-900">
                              ₹{product.price || 0}
                              <span className="text-xs text-gray-500 ml-1">
                                per {product.unitType || 'piece'}
                              </span>
                            </p>
                          </div>
                          <div className="mt-2 flex items-center">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(product.rating || 0)
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-1 text-xs text-gray-500">
                              ({product.reviews?.length || 0})
                            </span>
                          </div>
                          <div className="mt-2">
                            <p className={`text-xs ${(product.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                              {(product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found in this category.</p>
            </div>
          )}
    </div>
  );
};

export default CategoryProducts; 