import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaStar } from 'react-icons/fa';
import { cartAdd } from '../store/cartSlice';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userData } = useSelector((state) => state.user);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const handleAddToCart = async (e) => {
        e.stopPropagation(); // Prevent navigation when clicking the button
        
        if (!userData) {
            toast.error("Please login to add items to cart");
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
                toast.success("Added to cart!");
            }
        } catch (error) {
            console.error("Cart error:", error);
            toast.error(error.response?.data?.message || "Failed to add to cart");
        } finally {
            setIsAddingToCart(false);
        }
    };

    return (
        <div 
            onClick={() => navigate(`/product/${product._id}`)}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
        >
            {/* Product Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                    }}
                />
            </div>

            {/* Product Info */}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {product.name}
                </h3>

                {/* Price and Unit */}
                <div className="flex items-baseline mb-2">
                    <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                    <span className="text-sm text-gray-600 ml-2">per {product.unitType || 'pack'}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                                key={star}
                                className={`w-4 h-4 ${
                                    star <= (product.rating || 0) 
                                        ? "text-yellow-400" 
                                        : "text-gray-300"
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                        {product.rating || 0} ({product.reviews?.length || 0})
                    </span>
                </div>

                {/* Stock Status */}
                <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm ${
                        product.stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                    {product.stock > 0 && (
                        <span className="text-sm text-gray-600">
                            Stock: {product.stock}
                        </span>
                    )}
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || product.stock <= 0}
                    className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors
                        ${product.stock > 0 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-gray-400 cursor-not-allowed'
                        } ${isAddingToCart ? 'opacity-75 cursor-wait' : ''}`}
                >
                    {isAddingToCart 
                        ? 'Adding...' 
                        : product.stock > 0 
                            ? 'Add to Cart'
                            : 'Out of Stock'
                    }
                </button>
            </div>
        </div>
    );
};

export default ProductCard; 