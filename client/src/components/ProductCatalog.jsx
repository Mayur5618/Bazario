import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { cartAdd, cartRemove } from "../store/cartSlice";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/catelog.css";
import "../styles/recentlyViewed.css";
import { addToWishlist, removeFromWishlist, setWishlistItems } from '../store/wishlistSlice';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import ProductCard from './ProductCard';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const [cartItemsMap, setCartItemsMap] = useState({});
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [imageLoading, setImageLoading] = useState({});
  const [removingItems, setRemovingItems] = useState({});
  const [isWishlistLoading, setIsWishlistLoading] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Animation variants for products
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const productVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    show: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  // Fetch cart items when component mounts
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get("/api/cart/getCartItems", {
          withCredentials: true,
        });
        if (response.data.success) {
          const itemsMap = {};
          response.data.cart.items.forEach((item) => {
            itemsMap[item.product._id] = item;
          });
          setCartItemsMap(itemsMap);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    if (userData) {
      fetchCartItems();
    } else {
      setCartItemsMap({});
    }
  }, [userData]);

  // Fetch initial wishlist data
  useEffect(() => {
    const fetchWishlistIfAuthenticated = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // If no token, don't try to fetch wishlist
          return;
        }

        const response = await axios.get('/api/wishlist', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          // Get full product details for wishlist items
          if (response.data.wishlist && response.data.wishlist.length > 0) {
            const productsResponse = await axios.post('/api/products/bulk', {
              productIds: response.data.wishlist
            });

            if (productsResponse.data.success) {
              dispatch(setWishlistItems(productsResponse.data.products));
            }
          } else {
            dispatch(setWishlistItems([]));
          }
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        // Only show error if it's not an auth error
        if (error.response?.status !== 401) {
          toast.error("Unable to fetch wishlist");
        }
      }
    };

    if (userData) {
      fetchWishlistIfAuthenticated();
    } else {
      // Clear wishlist if user is not logged in
      dispatch(setWishlistItems([]));
    }
  }, [userData, dispatch]);

  const handleAddToCart = async (productId) => {
    if (!userData) {
      toast.error("Please login to add items to cart");
      return;
    }

    try {
      const response = await axios.post("/api/cart/add", {
        productId,
        quantity: 1,
      });

      if (response.data.success) {
        dispatch(cartAdd());
        const updatedCart = await axios.get("/api/cart/getCartItems");
        const newItemsMap = {};
        updatedCart.data.cart.items.forEach((item) => {
          newItemsMap[item.product._id] = item;
        });
        setCartItemsMap(newItemsMap);
        toast.success("Added to cart!");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error(error.message || "Failed to add to cart");
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity, stock) => {
    if (!userData) {
      toast.error("Please login to update cart");
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
          toast.success("Item removed from cart");
        }
        return;
      }

      if (newQuantity > stock) {
        toast.error("Cannot exceed available stock");
        return;
      }

      const response = await axios.put(`/api/cart/update/${productId}`, {
        quantity: newQuantity,
      });

      if (response.data.success) {
        const updatedCart = await axios.get("/api/cart/getCartItems");
        const newItemsMap = {};
        updatedCart.data.cart.items.forEach((item) => {
          newItemsMap[item.product._id] = item;
        });
        setCartItemsMap(newItemsMap);
        toast.success(`Quantity updated to ${newQuantity}`);
      }
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  // Check if a product is in wishlist
  const isProductInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId);
  };

  const handleWishlist = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userData) {
      toast.error("Please login to manage wishlist");
      return;
    }

    if (isWishlistLoading[product._id]) return;

    setIsWishlistLoading(prev => ({ ...prev, [product._id]: true }));

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      };

      const isInWishlist = isProductInWishlist(product._id);

      if (!isInWishlist) {
        // Add to wishlist
        const response = await axios.post('/api/wishlist/add', {
          productId: product._id
        }, config);

        if (response.data.success) {
          dispatch(addToWishlist(product));
          toast.success("Added to wishlist");
        }
      } else {
        // Remove from wishlist
        const response = await axios.delete(`/api/wishlist/remove/${product._id}`, config);

        if (response.data.success) {
          dispatch(removeFromWishlist(product._id));
          toast.success("Removed from wishlist");
        }
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error(error.response?.data?.message || "Failed to update wishlist");
    } finally {
      setIsWishlistLoading(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const handleCategoryChange = async (category) => {
    try {
      setLoading(true);
      setSelectedCategory(category);

      const response = await axios.get('/api/products', {
        params: {
          category: category === 'all' ? undefined : category,
          limit: 8,
          featured: true
        }
      });

      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch categories first
        const categoriesResponse = await axios.get('/api/products/categories');
        if (categoriesResponse.data.success) {
          const sortedCategories = categoriesResponse.data.categories.sort((a, b) => a.localeCompare(b));
          setCategories(sortedCategories);
        }

        // Get category from URL if present
        const urlParams = new URLSearchParams(location.search);
        const categoryFromUrl = urlParams.get('category');
        const initialCategory = categoryFromUrl || 'all';
        setSelectedCategory(initialCategory);

        // Fetch products based on initial category
        const productsResponse = await axios.get('/api/products', {
          params: {
            category: initialCategory === 'all' ? undefined : initialCategory,
            featured: true,
            limit: 8
          }
        });

        if (productsResponse.data.success) {
          setProducts(productsResponse.data.products);
        }
      } catch (err) {
        setError('Failed to fetch products');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndProducts();
  }, [location.search]);

  const handleImageLoad = (productId) => {
    setImageLoading(prev => ({
      ...prev,
      [productId]: false
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p className="text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`px-4 py-2 rounded-full transition-all ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          All Products
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-full transition-all ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No products found in this category</p>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
