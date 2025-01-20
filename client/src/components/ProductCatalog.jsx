import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { cartAdd, cartRemove } from "../store/cartSlice";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/catelog.css";
import "../styles/recentlyViewed.css";
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const [cartItemsMap, setCartItemsMap] = useState({});
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [imageLoading, setImageLoading] = useState({});

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

  const handleWishlist = (e, productId) => {
    e.preventDefault();
    
    if (!userData) {
      toast.error("Please login to manage wishlist");
      return;
    }

    if (wishlistItems.includes(productId)) {
      dispatch(removeFromWishlist(productId));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishlist(productId));
      toast.success("Added to wishlist");
    }
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/products${
            selectedCategory !== "all" ? `?category=${selectedCategory}` : ""
          }`
        );
        setProducts(response.data.products);
        setError(null);
      } catch (err) {
        setError("Failed to fetch products");
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const handleImageLoad = (productId) => {
    setImageLoading(prev => ({
      ...prev,
      [productId]: false
    }));
  };

  const categories = [
    { id: "all", name: "All Products" },
    { id: "vegetable", name: "Vegetables" },
    { id: "Home-Cooked Food", name: "Home Cooked Food" },
    { id: "Traditional-Pickles", name: "Traditional Pickles" },
    { id: "Seasonal Foods", name: "Seasonal Foods" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
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
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
              selectedCategory === category.id
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
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

                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {product.name}
                  </h3>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="text-gray-900 font-medium">₹{product.price}</p>
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
              </Link>

              {/* Wishlist Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleWishlist(e, product._id);
                }}
                className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  {wishlistItems.includes(product._id) ? (
                    <FaHeart className="w-6 h-6 text-red-500" />
                  ) : (
                    <FaRegHeart className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProductCatalog;
