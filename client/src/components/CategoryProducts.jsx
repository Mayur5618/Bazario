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

  if (loading) {
    return <div className="animate-pulse grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
      ))}
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-4">
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

      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.3, ease: "easeInOut" },
              opacity: { duration: 0.2 }
            }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-lg shadow-lg mb-6">
              <div className="p-4">
                <div className="flex justify-end items-center mb-2">
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
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Clear All
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
        )}
      </AnimatePresence>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found in this category.</p>
        </div>
      ) : (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: {
                duration: 0.4,
                staggerChildren: 0.05
              }
            }
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4"
        >
          {products.map((product) => (
            <motion.div
              key={product._id}
              variants={{
                hidden: { 
                  opacity: 0,
                  y: 20
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    damping: 15,
                    stiffness: 300,
                    duration: 0.4
                  }
                }
              }}
              whileHover={{
                y: -5,
                transition: {
                  duration: 0.2
                }
              }}
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
                  <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 line-clamp-1">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm sm:text-base font-bold">₹{product.price}</span>
                      <span className="text-[10px] sm:text-xs text-gray-500">per {product.unitType || 'piece'}</span>
                    </div>
                  </div>

                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex">
                        {[...Array(5)].map((_, index) => (
                          <FaStar
                            key={index}
                            className={`w-2 h-2 sm:w-3 sm:h-3 ${
                              index < (product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-600">
                        ({product.reviews?.length || 0})
                      </span>
                    </div>

                  <div className="flex items-center justify-between text-[10px] sm:text-xs">
                    <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <span className="text-gray-500">Stock: {product.stock}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CategoryProducts; 