import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaShoppingCart, FaMinus, FaPlus, FaFilter, FaStar } from 'react-icons/fa';
import { BiSortAlt2 } from 'react-icons/bi';
import { MdOutlineAttachMoney } from 'react-icons/md';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
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

// Update the filter modal animation variants
const filterModalVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

const AllProducts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);
  const [cartItemsMap, setCartItemsMap] = useState({});
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: null,
    ratings: null,
    category: new URLSearchParams(location.search).get('category') || null,
    sortBy: null,
    platformType: 'b2c'
  });
  const toastId = useRef(null);
  const [isAddingToCart, setIsAddingToCart] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [cartItem, setCartItem] = useState(null);

  /////////////////////////////////////////////////////////////////
  const { category } = useParams();
  // const [products, setProducts] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [cartItems, setCartItems] = useState({});
  // const [isAddingToCart, setIsAddingToCart] = useState({});
  // const userData = useSelector((state) => state.user.userData);
  // const dispatch = useDispatch();
  // const navigate = useNavigate();

  // Create a ref to store the current toast ID
  // const toastId = React.useRef(null);
  const toastDuration = 2000; // Duration for success messages

  // Fetch categories first
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Add platformType to the categories request
        const response = await axios.get('/api/products/categories', {
          params: { platformType: 'b2c' }
        });
        
        if (response.data.success && response.data.categories) {
          const validCategories = response.data.categories.filter(cat => cat); // Filter out null/empty categories
          setCategories(validCategories);
          // Set first category as active by default
          if (validCategories.length > 0) {
            setActiveCategory(validCategories[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  // Fetch products by category
  const fetchProductsByCategory = async (category) => {
    try {
      const response = await axios.get('/api/products/filtered', {
        params: {
          category,
          platformType: 'b2c',
          limit: 8 // Limit products per category
        }
      });
      
      if (response.data.success) {
        setProductsByCategory(prev => ({
          ...prev,
          [category]: response.data.products
        }));
      }
    } catch (error) {
      console.error(`Error fetching products for ${category}:`, error);
    }
  };

  // Fetch products for all categories
  useEffect(() => {
    const fetchAllCategoryProducts = async () => {
      try {
        if (categories.length > 0) {
          await Promise.all(
            categories.map(category => fetchProductsByCategory(category))
          );
        }
      } catch (error) {
        console.error('Error fetching category products:', error);
        toast.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchAllCategoryProducts();
  }, [categories]);

  // Handle category navigation
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    // Scroll to category section
    document.getElementById(category)?.scrollIntoView({ behavior: 'smooth' });
  };

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
          setCartItemsMap(cartItemsMap);
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

  // Add fetchCartItem function
  const fetchCartItem = async (productId) => {
    try {
      const response = await axios.get("/api/cart/getCartItems", {
        withCredentials: true,
      });
      if (response.data.success) {
        const foundItem = response.data.cart.items.find(
          item => item.product._id === productId
        );
        setCartItem(foundItem);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  // Update handleAddToCart function
  const handleAddToCart = async (productId) => {
    if (!userData) {
      toast.error("Please login to add items to cart");
      navigate('/login');
      return;
    }

    setIsAddingToCart(prev => ({ ...prev, [productId]: true }));
    try {
      const response = await axios.post("/api/cart/add", {
        productId,
        quantity: 1
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        const product = (filteredProducts || products).find(p => p._id === productId);
        dispatch(cartAdd({
          product,
          quantity: 1
        }));
        
        // Fetch updated cart item
        const updatedCart = await axios.get("/api/cart/getCartItems", {
          withCredentials: true
        });
        const updatedItem = updatedCart.data.cart.items.find(
          item => item.product._id === productId
        );
        setCartItem(updatedItem);
        toast.success("Added to cart!");
      }
    } catch (error) {
      console.error("Cart error:", error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Add handleUpdateQuantity function
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (!userData) {
      toast.error("Please login to update cart");
      return;
    }

    try {
      if (newQuantity < 1) {
        dispatch(cartRemove(productId));
        const response = await axios.delete(`/api/cart/remove/${productId}`);
        if (response.data.success) {
          setCartItem(null);
          toast.success("Item removed from cart");
        }
        return;
      }

      const product = (filteredProducts || products).find(p => p._id === productId);
      if (newQuantity > product.stock) {
        toast.error("Cannot exceed available stock");
        return;
      }

      const response = await axios.put(`/api/cart/update/${productId}`, {
        quantity: newQuantity,
      });

      if (response.data.success) {
        const updatedCart = await axios.get("/api/cart/getCartItems", {
          withCredentials: true
        });
        const updatedItem = updatedCart.data.cart.items.find(
          item => item.product._id === productId
        );
        setCartItem(updatedItem);
        toast.success(`Quantity updated to ${newQuantity}`);
      }
    } catch (error) {
      toast.error("Failed to update quantity");
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

  // Fetch initial products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products', {
        params: {
          platformType: 'b2c' // Always include platformType
        }
      });
      
      if (response.data.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch filtered products
  const fetchFilteredProducts = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      queryParams.append('platformType', 'b2c');
      
      if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        queryParams.append('minPrice', filters.minPrice);
        queryParams.append('maxPrice', filters.maxPrice);
      }
      if (filters.minRating !== null) {
        queryParams.append('minRating', filters.minRating);
      }
      if (filters.category && filters.category !== 'all') {
        queryParams.append('category', filters.category);
      }
      if (filters.sortBy) {
        queryParams.append('sortBy', filters.sortBy);
      }
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      queryParams.append('page', currentPage);

      console.log('Query params:', queryParams.toString());
      const response = await axios.get(`/api/products/filtered?${queryParams}`);
      
      if (response.data.success) {
        setFilteredProducts(response.data.products);
        setTotalPages(response.data.totalPages || 1);
        setShowFilterModal(false); // Close the filter modal after successful fetch
      }
    } catch (error) {
      console.error('Error fetching filtered products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Filter effect
  useEffect(() => {
    const hasActiveFilters = 
        filters.minPrice !== undefined || 
        filters.maxPrice !== undefined || 
        filters.minRating !== null || 
        (filters.category !== null && filters.category !== 'all') || 
        filters.sortBy !== null || 
        searchTerm;

    if (hasActiveFilters) {
        fetchFilteredProducts();
    } else {
        setFilteredProducts(null);
    }
  }, [filters, searchTerm, currentPage]);

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

  // Update the Filter Modal component
  const ProductFilter = ({ initialFilters, onApplyFilter }) => {
    const [localFilters, setLocalFilters] = useState({
        priceRange: initialFilters?.priceRange || [0, 5000],
        ratings: initialFilters?.ratings || null,
        category: initialFilters?.category || null,
        sortBy: initialFilters?.sortBy || null,
        platformType: initialFilters?.platformType || 'b2c'
    });

    const [priceRange, setPriceRange] = useState(initialFilters?.priceRange || [0, 5000]);

    const handleReset = () => {
        setPriceRange([0, 5000]);
        setLocalFilters({
            priceRange: null,
            ratings: null,
            category: null,
            sortBy: null,
            platformType: 'b2c'
        });
        if (typeof onApplyFilter === 'function') {
            onApplyFilter({
                platformType: 'b2c'
            });
        }
    };

    const handleApply = () => {
        if (typeof onApplyFilter !== 'function') {
            console.error('onApplyFilter is not a function');
            return;
        }

        const formattedFilters = {
            platformType: 'b2c'
        };

        // Only include price range if it's different from default
        if (priceRange[0] !== 0 || priceRange[1] !== 5000) {
            formattedFilters.minPrice = priceRange[0];
            formattedFilters.maxPrice = priceRange[1];
        }

        // Add rating if selected
        if (localFilters.ratings !== null) {
            formattedFilters.minRating = localFilters.ratings;
        }

        // Add category if selected and not 'all'
        if (localFilters.category && localFilters.category !== 'all') {
            formattedFilters.category = localFilters.category;
        }

        // Add sort option if selected
        if (localFilters.sortBy) {
            formattedFilters.sortBy = localFilters.sortBy;
        }

        onApplyFilter(formattedFilters);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={(e) => {
                e.stopPropagation();
                if (typeof onApplyFilter === 'function') {
                    onApplyFilter(null);
                }
            }}
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg p-6 w-full max-w-md"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Filter Products</h2>
                    <button onClick={handleReset} className="text-gray-500 hover:text-gray-700">
                        ×
                    </button>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                    <h3 className="font-medium mb-2">Price Range</h3>
                    <div className="px-2">
                        <Slider
                            range
                            min={0}
                            max={5000}
                            value={priceRange}
                            onChange={(value) => setPriceRange(value)}
                        />
                        <div className="flex justify-between mt-2 text-sm text-gray-600">
                            <span>₹{priceRange[0]}</span>
                            <span>₹{priceRange[1]}</span>
                        </div>
                    </div>
                </div>

                {/* Ratings */}
                <div className="mb-6">
                    <h3 className="font-medium mb-2">Maximum Rating</h3>
                    <div className="flex gap-2">
                        {[0, 1, 2, 3, 4, 5].map((rating) => (
                            <button
                                key={rating}
                                onClick={() => setLocalFilters(prev => ({ ...prev, ratings: rating }))}
                                className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                                    localFilters.ratings === rating
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                            >
                                {rating} <FaStar className={rating === 0 ? 'hidden' : ''} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                    <h3 className="font-medium mb-2">Category</h3>
                    <select
                        value={localFilters.category || 'all'}
                        onChange={(e) => setLocalFilters(prev => ({ 
                            ...prev, 
                            category: e.target.value === 'all' ? null : e.target.value 
                        }))}
                        className="w-full p-2 border rounded-lg"
                    >
                        <option value="all">All Categories</option>
                        {categories?.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort By */}
                <div className="mb-6">
                    <h3 className="font-medium mb-2">Sort By</h3>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: 'newest', label: 'Newest' },
                            { value: 'price_asc', label: 'Price: Low to High' },
                            { value: 'price_desc', label: 'Price: High to Low' },
                            { value: 'rating', label: 'Highest Rated' },
                            { value: 'most_sold', label: 'Most Sold' }
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setLocalFilters(prev => ({ 
                                    ...prev, 
                                    sortBy: option.value 
                                }))}
                                className={`px-3 py-1 rounded-full ${
                                    localFilters.sortBy === option.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={handleReset}
                        className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Apply
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
  };

  // Update active category when URL changes
  useEffect(() => {
    const categoryFromUrl = new URLSearchParams(location.search).get('category');
    if (categoryFromUrl) {
      setActiveCategory(categoryFromUrl);
      setFilters(prev => ({
        ...prev,
        category: categoryFromUrl
      }));
    }
  }, [location.search]);

  // Fetch products based on category filter
  useEffect(() => {
    if (filters.category) {
      fetchFilteredProducts();
    }
  }, [filters.category]);

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Category Navigation */}
        <div className="sticky top-0 bg-white z-10 shadow-sm mb-6 pb-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">
                    {filteredProducts ? 'Filtered Products' : 'All Products'}
                </h1>
                <div className="flex gap-2">
                    {filteredProducts && (
                        <button
                            onClick={() => {
                                setFilters({
                                    priceRange: null,
                                    ratings: null,
                                    category: null,
                                    sortBy: null,
                                    platformType: 'b2c'
                                });
                                setFilteredProducts(null);
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            Clear Filters
                        </button>
                    )}
                    <button
                        onClick={() => setShowFilterModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        <FaFilter />
                        Filter
                    </button>
                </div>
            </div>

            {!filteredProducts && (
                <div className="flex overflow-x-auto hide-scrollbar">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => handleCategoryClick(category)}
                            className={`whitespace-nowrap px-4 py-2 mr-2 rounded-full transition-colors ${
                                activeCategory === category
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {loading ? (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        ) : filteredProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <motion.div
                            key={product._id}
                            layout
                            className="bg-white rounded-lg shadow-sm overflow-hidden"
                        >
                            <Link to={`/product/${product._id}`}>
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="font-semibold">{product.name}</h3>
                                    <p className="text-gray-600">₹{product.price}</p>
                                    <div className="flex items-center mt-2">
                                        <span className="flex items-center">
                                            {product.rating} <FaStar className="text-yellow-400 ml-1" />
                                        </span>
                                        <span className="text-gray-500 text-sm ml-2">
                                            ({product.numReviews} reviews)
                                        </span>
                                    </div>
                                </div>
                            </Link>
                            <div className="p-4 pt-0">
                                {cartItemsMap[product._id] ? (
                                    <div className="flex items-center justify-between">
                                        {/* Cart quantity controls */}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleAddToCart(product._id)}
                                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                                        disabled={isAddingToCart[product._id]}
                                    >
                                        {isAddingToCart[product._id] ? (
                                            <div className="flex items-center justify-center">
                                                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                                            </div>
                                        ) : (
                                            'Add to Cart'
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-500 text-lg">No products found matching your filters</p>
                    </div>
                )}
            </div>
        ) : (
            categories.map((category) => (
                <div key={category} id={category} className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">{category}</h2>
                        <Link 
                            to={`/category/${category}`}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                            View All →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.filter(p => p.category === category).map((product) => (
                            <div key={product._id} className="bg-white rounded-lg shadow p-4">
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                />
                                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-xl font-bold">₹{product.price} <span className="text-sm text-gray-500">per</span></div>
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                className={`w-4 h-4 ${
                                                    star <= (product.rating || 0)
                                                        ? "text-yellow-400"
                                                        : "text-gray-300"
                                                }`}
                                            />
                                        ))}
                                        <span className="ml-1 text-gray-600">
                                            {product.rating || 0} ({product.reviews?.length || 0})
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                    <span className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                    <span>Stock: {product.stock}</span>
                                </div>
                                {product.stock > 0 ? (
                                    <AnimatePresence mode="wait">
                                        {cartItemsMap[product._id] ? (
                                            <motion.div
                                                key="quantity-controls"
                                                className="flex items-center border-2 border-blue-600 justify-between rounded-lg overflow-hidden"
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleUpdateQuantity(product._id, cartItemsMap[product._id].quantity - 1)}
                                                    className="px-4 py-2 bg-blue-600 text-white font-medium text-xl"
                                                >
                                                    -
                                                </motion.button>
                                                <span className="font-medium text-lg">
                                                    {cartItemsMap[product._id].quantity}
                                                </span>
                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleUpdateQuantity(product._id, cartItemsMap[product._id].quantity + 1)}
                                                    className="px-4 py-2 bg-blue-600 text-white font-medium text-xl"
                                                    disabled={cartItemsMap[product._id].quantity >= product.stock}
                                                >
                                                    +
                                                </motion.button>
                                            </motion.div>
                                        ) : (
                                            <motion.button
                                                key="add-button"
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleAddToCart(product._id)}
                                                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                                disabled={isAddingToCart[product._id]}
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
                                ) : (
                                    <div className="text-red-500 text-center py-3 bg-red-50 rounded-lg">
                                        Out of Stock
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))
        )}

        <AnimatePresence>
            {showFilterModal && (
                <ProductFilter
                    initialFilters={filters}
                    onApplyFilter={(newFilters) => {
                        if (newFilters === null) {
                            // If clicked outside modal, just close it
                            setShowFilterModal(false);
                            return;
                        }
                        // Update filters and fetch products
                        setFilters(prev => ({
                            ...prev,
                            ...newFilters
                        }));
                        setShowFilterModal(false);
                    }}
                />
            )}
        </AnimatePresence>
    </div>
);
};

// Add this CSS to your stylesheet
const styles = `
.hide-scrollbar::-webkit-scrollbar {
    display: none;
}
.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
`;

export default AllProducts;