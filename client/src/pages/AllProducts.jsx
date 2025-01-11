import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { cartAdd } from '../store/cartSlice';
import "../styles/header.css";

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
    sortBy: 'relevance'
  });

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

  // Fetch cart items
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
          query: searchTerm,
          category: filters.category !== 'all' ? filters.category : '',
          sortBy: filters.sortBy
        });

        const response = await axios.get(`/api/search?${queryParams}`);
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
  }, [searchTerm, filters]);

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

  // Handle add to cart
  const handleAddToCart = async (productId) => {
    try {
      if (!userData) {
        toast.error('Please login to add items to cart');
        navigate('/login');
        return;
      }

      const response = await axios.post('/api/cart/add', {
        productId,
        quantity: 1
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        dispatch(cartAdd());
        toast.success('Added to cart');
        // Update local cart items map
        const updatedCart = response.data.cart;
        const newCartItemsMap = {};
        updatedCart.items.forEach(item => {
          newCartItemsMap[item.product._id] = item;
        });
        setCartItemsMap(newCartItemsMap);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  // Handle quantity update
  const handleUpdateQuantity = async (productId, newQuantity, maxStock) => {
    try {
      if (newQuantity < 1) {
        // Remove item from cart
        const response = await axios.delete(`/api/cart/remove/${productId}`, {
          withCredentials: true
        });
        if (response.data.success) {
          const newCartItemsMap = { ...cartItemsMap };
          delete newCartItemsMap[productId];
          setCartItemsMap(newCartItemsMap);
          toast.success('Item removed from cart');
        }
      } else if (newQuantity <= maxStock) {
        // Update quantity
        const response = await axios.put('/api/cart/update', {
          productId,
          quantity: newQuantity
        }, {
          withCredentials: true
        });
        if (response.data.success) {
          const newCartItemsMap = { ...cartItemsMap };
          newCartItemsMap[productId] = response.data.cart.items.find(
            item => item.product._id === productId
          );
          setCartItemsMap(newCartItemsMap);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    }
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <Link to={`/product/${product._id}`}>
              <div className="relative h-48 overflow-hidden rounded-t-lg">
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
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold">₹{product.price}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      per {product.unitSize} {product.unitType}
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Add to Cart Section */}
            <div className="p-4 pt-0">
              {product.stock > 0 ? (
                cartItemsMap[product._id] ? (
                  <div className="flex items-center justify-between bg-gray-50 rounded-md p-2">
                    <button
                      onClick={() => handleUpdateQuantity(
                        product._id,
                        cartItemsMap[product._id].quantity - 1,
                        product.stock
                      )}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      -
                    </button>
                    <span className="font-medium">
                      {cartItemsMap[product._id].quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(
                        product._id,
                        cartItemsMap[product._id].quantity + 1,
                        product.stock
                      )}
                      className="px-3 py-1 bg-green-500 text-white rounded"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Add to Cart
                  </button>
                )
              ) : (
                <div className="text-red-500 text-center py-2 border-2 border-red-500 rounded-md">
                  Out of Stock
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

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