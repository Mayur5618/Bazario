import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import { removeFromWishlist } from '../store/wishlistSlice';
import { cartAdd } from '../store/cartSlice';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items: wishlistIds } = useSelector((state) => state.wishlist);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItemsMap, setCartItemsMap] = useState({});

  useEffect(() => {
    fetchWishlistProducts();
    fetchCartItems();
  }, [wishlistIds]);

  const fetchWishlistProducts = async () => {
    try {
      if (wishlistIds.length === 0) {
        setWishlistProducts([]);
        setLoading(false);
        return;
      }

      const response = await axios.post('/api/products/bulk', {
        productIds: wishlistIds
      });
      setWishlistProducts(response.data.products);
    } catch (error) {
      toast.error('Failed to fetch wishlist products');
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

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = async (productId) => {
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
      toast.error(error.response?.data?.message || "Failed to add to cart");
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <motion.div
              key={product._id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
            >
              <Link to={`/product/${product._id}`} className="block relative">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveFromWishlist(product._id);
                    }}
                    className="p-2 rounded-full bg-white shadow-md text-red-500 hover:bg-red-50"
                  >
                    <FaHeart className="w-5 h-5" />
                  </motion.button>
                </div>
              </Link>

              <div className="p-4">
                <Link to={`/product/${product._id}`}>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xl font-bold text-gray-900">
                    ₹{product.price}
                  </div>
                  <div className="text-sm text-gray-500">
                    per {product.unitType}
                  </div>
                </div>

                {product.stock > 0 ? (
                  cartItemsMap[product._id] ? (
                    <div className="text-green-600 text-sm font-medium">
                      ✓ Added to Cart
                    </div>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddToCart(product._id)}
                      className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <FaShoppingCart />
                      <span>Add to Cart</span>
                    </motion.button>
                  )
                ) : (
                  <div className="text-red-500 text-sm font-medium">
                    Out of Stock
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist; 