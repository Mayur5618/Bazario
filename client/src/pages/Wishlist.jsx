import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
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
      const wishlistResponse = await axios.get('/api/user/wishlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (wishlistResponse.data.success) {
        dispatch(setWishlistItems(wishlistResponse.data.wishlist));
        
        if (!wishlistResponse.data.wishlist.length) {
          setWishlistProducts([]);
          setLoading(false);
          return;
        }

        const productsResponse = await axios.post('/api/products/bulk', {
          productIds: wishlistResponse.data.wishlist
        });

        if (productsResponse.data.success) {
          setWishlistProducts(productsResponse.data.products);
        }
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to fetch wishlist');
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
      
      const response = await axios.post('/api/user/wishlist/remove', {
        productId
      }, {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {wishlistProducts.length > 0 && (
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      )}

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FaHeart className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-medium text-gray-900 mb-4">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Start adding items you love to your wishlist</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {wishlistProducts.map((product) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
              >
                <div className="relative">
                  <Link to={`/product/${product._id}`}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </Link>
                  
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleRemoveFromWishlist(e, product._id)}
                    disabled={removingItems[product._id]}
                    className={`absolute top-2 right-2 p-2 rounded-full bg-white shadow-md 
                      ${removingItems[product._id] ? 'opacity-50' : 'hover:bg-red-50'}`}
                  >
                    <FaHeart 
                      className={`w-5 h-5 text-red-500 
                        ${removingItems[product._id] && 'animate-pulse'}`}
                    />
                  </motion.button>
                </div>

                <div className="p-4">
                  <Link to={`/product/${product._id}`} className="block">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">₹{product.price}</span>
                      <span className="text-sm text-gray-500">per {product.unitType || 'piece'}</span>
                    </div>
                  </Link>

                  {/* Add to Cart Button */}
                  {product.stock > 0 ? (
                    <AnimatePresence mode="wait">
                      <motion.button
                        key={addedToCart[product._id] ? "added" : "add"}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => handleAddToCart(product._id)}
                        disabled={isAddingToCart[product._id] || addedToCart[product._id]}
                        className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200
                          ${addedToCart[product._id] 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-blue-600 hover:bg-blue-700'} 
                          text-white`}
                      >
                        {isAddingToCart[product._id] ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : addedToCart[product._id] ? (
                          <>
                            <svg 
                              className="w-5 h-5" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>Added to Cart</span>
                          </>
                        ) : (
                          <>
                            <FaShoppingCart />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </motion.button>
                    </AnimatePresence>
                  ) : (
                    <div className="mt-4 text-center py-2 px-4 rounded-lg bg-red-50 text-red-500">
                      Out of Stock
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Wishlist;