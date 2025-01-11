import React, { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { cartAdd, cartRemove } from '../store/cartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/catelog.css';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const [cartItemsMap, setCartItemsMap] = useState({});

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
    } else {
      setCartItemsMap({});
    }
  }, [userData]);

  const handleAddToCart = async (productId) => {
    if (!userData) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      const response = await axios.post('/api/cart/add', {
        productId,
        quantity: 1
      });
      
      if (response.data.success) {
        dispatch(cartAdd());
        const updatedCart = await axios.get('/api/cart/getCartItems');
        const newItemsMap = {};
        updatedCart.data.cart.items.forEach(item => {
          newItemsMap[item.product._id] = item;
        });
        setCartItemsMap(newItemsMap);
        toast.success('Added to cart!');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity, stock) => {
    if (!userData) {
      toast.error('Please login to update cart');
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
          toast.success('Item removed from cart');
        }
        return;
      }

      if (newQuantity > stock) {
        toast.error('Cannot exceed available stock');
        return;
      }

      const response = await axios.put(`/api/cart/update/${productId}`, {
        quantity: newQuantity
      });

      if (response.data.success) {
        const updatedCart = await axios.get('/api/cart/getCartItems');
        const newItemsMap = {};
        updatedCart.data.cart.items.forEach(item => {
          newItemsMap[item.product._id] = item;
        });
        setCartItemsMap(newItemsMap);
        toast.success(`Quantity updated to ${newQuantity}`);
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`);
        setProducts(response.data.products);
        setError(null);
      } catch (err) {
        setError('Failed to fetch products');
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'vegetable', name: 'Vegetables' },
    { id: 'Home-Cooked Food', name: 'Home Cooked Food' },
    { id: 'Traditional-Pickles', name: 'Traditional Pickles' },
    { id: 'Seasonal Foods', name: 'Seasonal Foods' }
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
    <div className="container mx-auto px-4 py-8">
      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Product Categories</h2>
        <div className="flex flex-wrap gap-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full text-sm ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div 
            key={product._id} 
            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
          >
            {/* Product Image */}
            <Link to={`/product/${product._id}`}>
              <div className="h-48 overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>

            {/* Product Details */}
            <div className="p-4">
              {/* Product Name */}
              <Link to={`/product/${product._id}`}>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {product.name}
                </h3>
              </Link>

              {/* Price and Unit Section */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xl font-bold">₹{product.price}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    per {product.unitSize} {product.unitType}
                  </span>
                </div>
              </div>

              {/* Add to Cart Section */}
              {product.stock > 0 ? (
                <AnimatePresence mode="wait">
                  {cartItemsMap[product._id] ? (
                    <motion.div
                      key="quantity-controls"
                      className="flex items-center border-2 border-red-600 justify-between rounded-md overflow-hidden"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "backOut" }}
                    >
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateQuantity(
                          product._id,
                          cartItemsMap[product._id].quantity - 1,
                          product.stock
                        )}
                        className="px-6 py-1 bg-red-600 text-white font-medium text-xl"
                      >
                        -
                      </motion.button>
                      
                      <div className="relative flex items-center justify-center min-w-[60px]">
                        <AnimatePresence mode="wait">
                          {/* Background Pulse */}
                          <motion.div
                            key={`pulse-${cartItemsMap[product._id].quantity}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                              scale: [1, 1.5],
                              opacity: [0.3, 0],
                            }}
                            transition={{
                              duration: 0.4,
                              ease: "easeOut",
                            }}
                            className="absolute inset-0 bg-red-100 rounded-full"
                          />
                          
                          {/* Quantity Number */}
                          <motion.span
                            key={cartItemsMap[product._id].quantity}
                            initial={{ scale: 0.5, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.5, y: -20, opacity: 0 }}
                            transition={{ 
                              duration: 0.3,
                              ease: "backOut"
                            }}
                            className="absolute font-medium text-lg z-10"
                          >
                            {cartItemsMap[product._id].quantity}
                          </motion.span>
                        </AnimatePresence>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateQuantity(
                          product._id,
                          cartItemsMap[product._id].quantity + 1,
                          product.stock
                        )}
                        className="px-6 py-1 bg-red-600 text-white font-medium text-xl"
                      >
                        +
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="add-button"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "backOut" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddToCart(product._id)}
                      className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 overflow-hidden"
                    >
                      <motion.span
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        Add to Cart
                      </motion.span>
                    </motion.button>
                  )}
                </AnimatePresence>
              ) : (
                <div className="text-red-500 text-center py-2">
                  Out of Stock
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCatalog;