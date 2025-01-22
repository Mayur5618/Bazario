import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FaShoppingCart, FaMinus, FaPlus, FaCheck } from 'react-icons/fa';
import { cartAdd, cartRemove, updateCartItemQuantity } from '../store/cartSlice';

// Cool animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
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
  initial: { scale: 0 },
  animate: { 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  },
  tap: { scale: 0.95 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2
    }
  }
};

const quantityControlsVariants = {
  initial: { 
    opacity: 0,
    scale: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  exit: {
    opacity: 0,
    scale: 0,
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

const loadingContainerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const loadingDotVariants = {
  initial: {
    y: 0,
    scale: 1
  },
  animate: {
    y: [-10, 0],
    scale: [1, 1.2, 1],
    transition: {
      repeat: Infinity,
      duration: 0.8
    }
  }
};

const CategoryProducts = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState({});
  const [isAddingToCart, setIsAddingToCart] = useState({});
  const userData = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Create a ref to store the current toast ID
  const toastId = React.useRef(null);
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.h1 
          className="text-3xl font-bold text-gray-800 mb-8 capitalize"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {category.replace(/-/g, ' ')}
        </motion.h1>

        {loading ? (
          <motion.div 
            className="flex justify-center space-x-2 py-20"
            variants={loadingContainerVariants}
            animate="animate"
          >
            {[1, 2, 3].map((dot) => (
              <motion.div
                key={dot}
                className="w-3 h-3 bg-blue-600 rounded-full"
                variants={loadingDotVariants}
                initial="initial"
                animate="animate"
              />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {products.map((product) => (
              <motion.div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                variants={productCardVariants}
                whileHover="hover"
                layout
              >
                <motion.img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                />

                <div className="p-4">
                  <motion.h3 
                    className="text-lg font-semibold text-gray-800 mb-2"
                    layout
                  >
                    {product.name}
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600 text-sm mb-4 line-clamp-2"
                    layout
                  >
                    {product.description}
                  </motion.p>
                  
                  <motion.div 
                    className="flex justify-between items-center mb-4"
                    layout
                  >
                    <span className="text-xl font-bold text-gray-900">
                      ₹{product.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </span>
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {cartItems[product._id] ? (
                      <motion.div
                        key="quantity-controls"
                        className="flex items-center justify-between rounded-lg overflow-hidden"
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
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts; 