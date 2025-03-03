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
    if (userData) {
      fetchWishlistData();
    }
  }, [userData]);

  const fetchWishlistData = async () => {
    try {
      const response = await axios.get('/api/user/wishlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        // Get full product details for wishlist items
        const productsResponse = await axios.post('/api/products/bulk', {
          productIds: response.data.wishlist
        });

        if (productsResponse.data.success) {
          dispatch(setWishlistItems(productsResponse.data.products));
        }
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to fetch wishlist");
    }
  };

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
        const response = await axios.post('/api/user/wishlist/add', {
          productId: product._id
        }, config);

        if (response.data.success) {
          dispatch(addToWishlist(product));
          toast.success("Added to wishlist");
        }
      } else {
        // Remove from wishlist
        const response = await axios.post('/api/user/wishlist/remove', {
          productId: product._id
        }, config);

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams(location.search);
        const category = searchParams.get('category');
        
        console.log('Fetching products with category:', category);
        
        const response = await axios.get('/api/products/filtered', {
          params: {
            category: category || '',
            platformType: 'b2c',
            limit: 20
          }
        });

        console.log('API Response:', response.data);

        if (response.data.success) {
          setProducts(response.data.products);
        } else {
          setError('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.response?.data?.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search]);

  const handleImageLoad = (productId) => {
    setImageLoading(prev => ({
      ...prev,
      [productId]: false
    }));
  };

  const categories = [
    { id: "all", name: "All Products" },
    { id: "vegetables", name: "Vegetables" },
    { id: "home-cooked", name: "Home Cooked Food" },
    { id: "pickles", name: "Traditional Pickles" },
    { id: "seasonal", name: "Seasonal Foods" },
  ];

  const handleCategoryClick = (categoryId) => {
    if (categoryId === 'all') {
      navigate('/products');
    } else {
      navigate(`/products?category=${categoryId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Category Tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              new URLSearchParams(location.search).get('category') === category.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.search}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit="hidden"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          {products.map((product) => (
            <motion.div
              key={product._id}
              variants={productVariants}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="relative">
                <Link to={`/product/${product._id}`}>
                  <div className="relative h-48 rounded-t-lg overflow-hidden">
                    {/* Loading Skeleton */}
                    {(!product.images[0] || imageLoading[product._id] !== false) && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                    )}
                    
                    {/* Product Image */}
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        imageLoading[product._id] === false ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => handleImageLoad(product._id)}
                    />
                  </div>
                </Link>
                
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleWishlist(e, product)}
                  disabled={isWishlistLoading[product._id]}
                  className={`absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white 
                    transition-colors ${isWishlistLoading[product._id] ? 'opacity-50' : ''}`}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    {isProductInWishlist(product._id) ? (
                      <FaHeart className={`w-6 h-6 text-red-500 
                        ${isWishlistLoading[product._id] && 'animate-pulse'}`} 
                      />
                    ) : (
                      <FaRegHeart className={`w-6 h-6 text-gray-400 
                        ${isWishlistLoading[product._id] && 'animate-pulse'}`} 
                      />
                    )}
                  </div>
                </motion.button>
              </div>

              <div className="p-4">
                <Link to={`/product/${product._id}`}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 font-bold">₹{product.price}</p>
                    <p className="text-sm text-gray-500">per {product.unitSize} {product.unitType}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center">
                      <span className="text-sm text-yellow-500">★ {product.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">
                        ({product.reviews?.length || 0})
                      </span>
                    </div>
                    <p className={`text-sm font-medium ${
                      product.stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
      {products.length === 0 && (
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
