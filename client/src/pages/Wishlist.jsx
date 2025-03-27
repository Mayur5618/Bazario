import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaShoppingCart, FaStar, FaMinus, FaPlus } from 'react-icons/fa';
import { removeFromWishlist, setWishlistItems } from '../store/wishlistSlice';
import { cartAdd } from '../store/cartSlice';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState({});
  const [cartItems, setCartItems] = useState({});
  const [addedToCart, setAddedToCart] = useState({});
  const [isAddingToCart, setIsAddingToCart] = useState({});

  useEffect(() => {
    fetchWishlistProducts();
    fetchCartItems();
  }, []);

  const fetchWishlistProducts = async () => {
    try {
      const response = await axios.get('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        const products = response.data.wishlist || [];
        setWishlistProducts(products);
        dispatch(setWishlistItems(products));
      } else {
        throw new Error(response.data.message || 'Failed to fetch wishlist');
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error(error.message || 'Failed to fetch wishlist');
      setWishlistProducts([]);
      dispatch(setWishlistItems([]));
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    try {
      const response = await axios.get("/api/cart/getCartItems", {
        withCredentials: true,
      });
      
      if (response.data.success) {
        const cartItemsMap = {};
        const addedItemsMap = {};
        
        response.data.cart.items.forEach(item => {
          cartItemsMap[item.product._id] = item;
          addedItemsMap[item.product._id] = true;
        });
        
        setCartItems(cartItemsMap);
        setAddedToCart(addedItemsMap);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const handleUpdateQuantity = async (productId, currentQuantity, stock, newQuantity) => {
    if (newQuantity < 1 || newQuantity > stock) return;
    
    try {
      setIsAddingToCart(prev => ({ ...prev, [productId]: true }));
      
      const response = await axios.post("/api/cart/update", {
        productId,
        quantity: newQuantity
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        await fetchCartItems();
        toast.success(newQuantity > currentQuantity ? "Quantity increased" : "Quantity decreased");
      }
    } catch (error) {
      console.error("Cart update error:", error);
      toast.error(error.response?.data?.message || "Failed to update quantity");
    } finally {
      setIsAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveFromWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (removingItems[productId]) return;

    try {
      setRemovingItems(prev => ({ ...prev, [productId]: true }));
      
      const response = await axios.delete(`/api/wishlist/remove/${productId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        dispatch(removeFromWishlist(productId));
        setWishlistProducts(prev => 
          prev.filter(product => product._id !== productId)
        );
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error("Failed to remove from wishlist");
    } finally {
      setRemovingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCart = async (productId) => {
    if (isAddingToCart[productId]) return;

    try {
      setIsAddingToCart(prev => ({ ...prev, [productId]: true }));

      const response = await axios.post("/api/cart/add", {
        productId,
        quantity: 1
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        dispatch(cartAdd(response.data.item));
        setAddedToCart(prev => ({ ...prev, [productId]: true }));
        await fetchCartItems();
        toast.success("Added to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100/50 to-white py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Wishlist</h2>
        </div>
        
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-4">
              <FaHeart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
            </div>
            <h2 className="text-xl sm:text-2xl font-medium text-gray-900 mb-3 sm:mb-4">Your wishlist is empty</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Start adding items you love to your wishlist</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
              {wishlistProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col h-full">
                    {/* Product Image */}
                    <div className="relative pt-[100%] overflow-hidden rounded-t-lg">
                      <Link to={`/product/${product._id}`}>
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleRemoveFromWishlist(e, product._id)}
                        disabled={removingItems[product._id]}
                        className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full bg-white shadow-md 
                          ${removingItems[product._id] ? 'opacity-50' : 'hover:bg-red-50'}`}
                      >
                        <FaHeart 
                          className={`w-3 h-3 sm:w-4 sm:h-4 text-red-500 
                            ${removingItems[product._id] && 'animate-pulse'}`}
                        />
                      </motion.button>
                    </div>

                    {/* Product Info */}
                    <div className="p-3 sm:p-4 flex flex-col flex-grow">
                      <Link to={`/product/${product._id}`}>
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1 sm:mb-2 line-clamp-2 hover:text-blue-600">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base sm:text-lg font-bold">₹{product.price}</span>
                          <span className="text-[10px] sm:text-xs text-gray-500">per {product.unitType || 'piece'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mb-1 sm:mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, index) => (
                            <FaStar
                              key={index}
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                                index < (product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-600">
                          ({product.reviews?.length || 0})
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] sm:text-xs mb-2 sm:mb-3">
                        <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <span className="text-gray-500">Stock: {product.stock}</span>
                      </div>

                      {/* Add to Cart Section */}
                      {product.stock > 0 && (
                        <div className="mt-auto">
                          {cartItems[product._id] ? (
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1.5 sm:p-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleUpdateQuantity(
                                    product._id,
                                    cartItems[product._id].quantity,
                                    product.stock,
                                    cartItems[product._id].quantity - 1
                                  );
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              >
                                <FaMinus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </button>
                              <span className="font-medium text-xs sm:text-sm">
                                {cartItems[product._id].quantity}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleUpdateQuantity(
                                    product._id,
                                    cartItems[product._id].quantity,
                                    product.stock,
                                    cartItems[product._id].quantity + 1
                                  );
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              >
                                <FaPlus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleAddToCart(product._id);
                              }}
                              disabled={isAddingToCart[product._id]}
                              className="w-full bg-blue-600 text-white py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                            >
                              <FaShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                              {isAddingToCart[product._id] ? 'Adding...' : 'Add to Cart'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;