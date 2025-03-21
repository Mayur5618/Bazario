import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaStar, FaShoppingCart, FaMinus, FaPlus } from 'react-icons/fa';
import { cartAdd, cartRemove, updateCartItemQuantity } from '../store/cartSlice';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';

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

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userData } = useSelector((state) => state.user);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [cartItems, setCartItems] = useState({});

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        
        if (!userData) {
            toast.error("Please login to add items to cart");
            navigate('/login');
            return;
        }

        setIsAddingToCart(true);
        try {
            const response = await axios.post("/api/cart/add", {
                productId: product._id,
                quantity: 1
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                dispatch(cartAdd({
                    product: product,
                    quantity: 1
                }));
                setCartItems(prev => ({
                    ...prev,
                    [product._id]: { product, quantity: 1 }
                }));
                toast.success("Added to cart!");
            }
        } catch (error) {
            console.error("Cart error:", error);
            toast.error(error.response?.data?.message || "Failed to add to cart");
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleUpdateQuantity = async (productId, newQuantity, maxStock) => {
        if (newQuantity < 0 || newQuantity > maxStock) return;
        
        try {
            if (newQuantity === 0) {
                const response = await axios.delete(`/api/cart/remove/${productId}`);
                if (response.data.success) {
                    dispatch(cartRemove(productId));
                    setCartItems(prev => {
                        const newItems = { ...prev };
                        delete newItems[productId];
                        return newItems;
                    });
                    toast.success("Removed from cart");
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
                    toast.success("Cart updated");
                }
            }
        } catch (error) {
            toast.error("Failed to update cart");
        }
    };

    return (
        <motion.div 
            onClick={() => navigate(`/product/${product._id}`)}
            variants={productCardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="cursor-pointer hover:shadow-lg transition-all"
        >
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col hover:border-gray-300">
                {/* Product Image Container */}
                <div className="relative pt-[100%] overflow-hidden rounded-t-lg">
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-medium">Out of Stock</span>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-3 flex flex-col flex-grow border-t border-gray-100">
                    <h3 className="text-base font-medium text-gray-900 mb-1 line-clamp-1 hover:text-blue-600">
                        {product.name}
                    </h3>

                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold">₹{product.price}</span>
                            <span className="text-xs text-gray-500">per {product.unitType || 'piece'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 mb-1">
                        <div className="flex">
                            {[...Array(5)].map((_, index) => (
                                <FaStar
                                    key={index}
                                    className={`w-3 h-3 ${
                                        index < product.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-600">
                            ({product.reviews?.length || 0})
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-auto">
                        <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <span className="text-gray-500">Stock: {product.stock}</span>
                    </div>

                    {/* Add to Cart Section */}
                    {product.stock > 0 && (
                        <div className="mt-2">
                            {cartItems[product._id] ? (
                                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateQuantity(
                                                product._id,
                                                cartItems[product._id].quantity - 1,
                                                product.stock
                                            );
                                        }}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    >
                                        <FaMinus className="w-3 h-3" />
                                    </button>
                                    <span className="font-medium text-sm">
                                        {cartItems[product._id].quantity}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateQuantity(
                                                product._id,
                                                cartItems[product._id].quantity + 1,
                                                product.stock
                                            );
                                        }}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    >
                                        <FaPlus className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCart(e);
                                    }}
                                    disabled={isAddingToCart}
                                    className="w-full bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 text-sm"
                                >
                                    <FaShoppingCart className="w-3 h-3" />
                                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard; 