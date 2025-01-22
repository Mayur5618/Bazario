import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaShoppingCart, FaMinus, FaPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { cartAdd, cartRemove, updateCartItemQuantity } from '../store/cartSlice';
import "../styles/header.css";
import { useParams } from 'react-router-dom';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
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
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: { 
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: "easeInOut"
    }
  }
};

const quantityControlsVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const AllProducts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);
  const [cartItemsMap, setCartItemsMap] = useState({});
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'relevance',
    query: ''
  });
  const toastId = useRef(null);
  const [isAddingToCart, setIsAddingToCart] = useState({});

  /////////////////////////////////////////////////////////////////
  const { category } = useParams();
  // const [products, setProducts] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState({});
  // const [isAddingToCart, setIsAddingToCart] = useState({});
  // const userData = useSelector((state) => state.user.userData);
  // const dispatch = useDispatch();
  // const navigate = useNavigate();

  // Create a ref to store the current toast ID
  // const toastId = React.useRef(null);
  const toastDuration = 2000; // Duration for success messages

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`/api/products/category/${category}`);
        setProducts(response.data.products);
      } catch (error) {
        toast.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

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
  /////////////////////////////////////////////////////////////////

  // Get category and search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const queryParam = params.get('query');

    if (categoryParam) {
      setFilters(prev => ({ ...prev, category: categoryParam }));
    }
    if (queryParam) {
      setSearchTerm(queryParam);
    }
  }, [location.search]);

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
    }
  }, [userData]);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length >= 2) {
        try {
          const response = await axios.get(`/api/search/suggestions?query=${searchTerm}`);
          setSearchSuggestions(response.data.suggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSearchSuggestions([]);
        }
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          ...filters,
          category: filters.category !== 'all' ? filters.category : '',
        });

        const response = await axios.get(`/api/products?${queryParams}`);
        setProducts(response.data.products);
        setError(null);
      } catch (error) {
        setError('Failed to fetch products');
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Update URL with search query
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set('query', value);
    } else {
      params.delete('query');
    }
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setFilters(prev => ({ ...prev, category }));
    
    // Update URL with category
    const params = new URLSearchParams(location.search);
    if (category !== 'all') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  // const showToastMessage = (product, quantity, action, isLoading = false) => {
  //   const message = (
  //     <div className="flex items-center gap-3">
  //       <div className="relative w-12 h-12 flex-shrink-0">
  //         <img 
  //           src={product.images[0]} 
  //           alt={product.name} 
  //           className="w-full h-full rounded-md object-cover"
  //         />
  //       </div>
  //       <div className="flex-1">
  //         <p className="font-medium text-gray-800 line-clamp-1">{product.name}</p>
  //         <div className="flex items-center gap-2">
  //           {isLoading ? (
  //             <>
  //               <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  //               <span className="text-sm text-blue-600">Adding to cart...</span>
  //             </>
  //           ) : (
  //             <p className="text-sm text-green-600 flex items-center gap-2">
  //               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  //               </svg>
  //               Added to cart!
  //             </p>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   );

  //   if (toastId.current) {
  //     toast.dismiss(toastId.current);
  //   }

  //   toastId.current = isLoading ? 
  //     toast.loading(message, { position: 'top-right' }) : 
  //     toast.success(message, { 
  //       position: 'top-right',
  //       duration: 2000,
  //     });
  // };

  // const handleAddToCart = async (productId) => {
  //   if (!userData) {
  //     navigate('/login');
  //     return;
  //   }

  //   const product = products.find(p => p._id === productId);
    
  //   try {
  //     setIsAddingToCart(prev => ({ ...prev, [productId]: true }));
  //     showToastMessage(product, 1, 'add', true);

  //     const response = await axios.post('/api/cart/add', {
  //       productId,
  //       quantity: 1
  //     }, {
  //       withCredentials: true
  //     });

  //     if (response.data.success) {
  //       dispatch(cartAdd({ product, quantity: 1 }));
  //       setCartItemsMap(prev => ({
  //         ...prev,
  //         [productId]: { product, quantity: 1 }
  //       }));
  //       showToastMessage(product, 1, 'add', false);
  //     }
  //   } catch (error) {
  //     toast.error("Failed to add item to cart", { id: toastId.current });
  //   } finally {
  //     setIsAddingToCart(prev => ({ ...prev, [productId]: false }));
  //   }
  // };

  // const handleUpdateQuantity = async (productId, newQuantity, maxStock) => {
  //   if (!userData) return;
    
  //   const product = products.find(p => p._id === productId);
    
  //   try {
  //     if (newQuantity === 0) {
  //       const response = await axios.delete(`/api/cart/remove/${productId}`, {
  //         withCredentials: true
  //       });
  //       if (response.data.success) {
  //         dispatch(cartRemove(productId));
  //         setCartItemsMap(prev => {
  //           const newMap = { ...prev };
  //           delete newMap[productId];
  //           return newMap;
  //         });
  //         showToastMessage(product, 0, 'remove', false);
  //       }
  //     } else if (newQuantity <= maxStock) {
  //       const response = await axios.put(`/api/cart/update/${productId}`, {
  //         quantity: newQuantity
  //       }, {
  //         withCredentials: true
  //       });
  //       if (response.data.success) {
  //         dispatch(updateCartItemQuantity({ productId, quantity: newQuantity }));
  //         setCartItemsMap(prev => ({
  //           ...prev,
  //           [productId]: { ...prev[productId], quantity: newQuantity }
  //         }));
  //         showToastMessage(product, newQuantity, 'update', false);
  //       }
  //     }
  //   } catch (error) {
  //     toast.error("Failed to update cart");
  //   }
  // };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">
          {filters.category !== 'all' 
            ? `${filters.category} Products`
            : searchTerm 
              ? `Results for "${searchTerm}"`
              : 'All Products'
          }
        </h1>

        {/* Search and Filter Bar */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                autoComplete="off"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSearchTerm(suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="vegetable">Vegetables</option>
            <option value="Home-Cooked Food">Home Cooked Food</option>
            <option value="Traditional-Pickles">Traditional Pickles</option>
            <option value="Seasonal Foods">Seasonal Foods</option>
          </select>

          {/* Sort Filter */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            className="px-6 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="relevance">Most Relevant</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-gray-600">
        Found {products.length} {products.length === 1 ? 'product' : 'products'}
      </div>

      {/* Products Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <AnimatePresence>
          {products.map((product) => (
            <motion.div
              key={product._id}
              variants={productCardVariants}
              whileHover="hover"
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <Link to={`/product/${product._id}`}>
                <div className="relative h-48">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-all duration-300 
                      ${product.stock <= 0 ? "opacity-50 grayscale" : ""}`}
                  />
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600">₹{product.price}</p>
                </div>
              </Link>
              
              {/* Cart Controls */}
              {/* <div className="p-4 pt-0">
                <AnimatePresence mode="wait">
                  {cartItemsMap[product._id] ? (
                    <motion.div
                      key="quantity-controls"
                      variants={quantityControlsVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="flex items-center justify-between bg-white border rounded-lg p-2"
                    >
                      <button
                        onClick={() => handleUpdateQuantity(
                          product._id,
                          cartItemsMap[product._id].quantity - 1,
                          product.stock
                        )}
                        className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">
                        {cartItemsMap[product._id].quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(
                          product._id,
                          cartItemsMap[product._id].quantity + 1,
                          product.stock
                        )}
                        disabled={cartItemsMap[product._id].quantity >= product.stock}
                        className={`w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-full transition-colors
                          ${cartItemsMap[product._id].quantity >= product.stock 
                            ? 'text-gray-400 cursor-not-allowed hover:bg-transparent' 
                            : ''
                          }`}
                      >
                        +
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="add-to-cart"
                      variants={buttonVariants}
                      initial="initial"
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => handleAddToCart(product._id)}
                      disabled={isAddingToCart[product._id] || product.stock <= 0}
                      className={`
                        w-full py-2 text-center rounded-lg
                        transition-all duration-200
                        ${product.stock <= 0 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }
                      `}
                    >
                      {isAddingToCart[product._id] ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Adding...</span>
                        </div>
                      ) : (
                        <span>Add to Cart</span>
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div> */}
               <AnimatePresence mode="wait">
                    {cartItems[product._id] ? (
                      <motion.div
                        key="quantity-controls"
                        className="flex items-center justify-between rounded-lg overflow-hidden w-[95%] mx-auto"
                        variants={quantityControlsVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <motion.button
                          variants={buttonVariants}
                          whileTap="tap"
                          whileHover="hover"
                          onClick={() => handleUpdateQuantity(
                            product._id,
                            cartItems[product._id].quantity - 1,
                            product.stock
                          )}
                          className="px-4 py-2 bg-blue-600 text-white rounded-l-lg"
                        >
                          <FaMinus />
                        </motion.button>
                        <motion.span 
                          className="font-medium px-4"
                          layout
                        >
                          {cartItems[product._id].quantity}
                        </motion.span>
                        <motion.button
                          variants={buttonVariants}
                          whileTap="tap"
                          whileHover="hover"
                          onClick={() => handleUpdateQuantity(
                            product._id,
                            cartItems[product._id].quantity + 1,
                            product.stock
                          )}
                          className="px-4 py-2 bg-blue-600 text-white rounded-r-lg"
                          disabled={cartItems[product._id].quantity >= product.stock}
                        >
                          <FaPlus />
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="add-button"
                        variants={buttonVariants}
                        initial="initial"
                        animate="animate"
                        whileTap="tap"
                        whileHover="hover"
                        onClick={() => handleAddToCart(product._id)}
                        disabled={isAddingToCart[product._id] || product.stock === 0}
                        className="w-full h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
                      >
                        {isAddingToCart[product._id] ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <>
                            <FaShoppingCart />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </motion.button>
                    )}
                  </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* No Results */}
      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            No products found {searchTerm && `for "${searchTerm}"`}
            {filters.category !== 'all' && ` in ${filters.category}`}
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilters({
                category: 'all',
                minPrice: '',
                maxPrice: '',
                sortBy: 'relevance'
              });
              navigate(location.pathname);
            }}
            className="text-blue-500 hover:text-blue-600"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default AllProducts;