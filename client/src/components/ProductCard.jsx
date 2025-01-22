import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { cartAdd, cartRemove, updateCartItemQuantity } from '../store/cartSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleProductView = () => {
    // Get existing recently viewed products
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    
    // Check if product already exists in recently viewed
    const exists = recentlyViewed.some(item => item._id === product._id);
    
    if (!exists) {
      // Add new product to the beginning of the array
      const updatedRecentlyViewed = [
        {
          _id: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          unit: product.unit,
          rating: product.rating,
          numReviews: product.numReviews,
          inStock: product.inStock,
          timestamp: Date.now()
        },
        ...recentlyViewed
      ].slice(0, 6); // Keep only the 6 most recent items
      
      // Save back to localStorage
      localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecentlyViewed));
    }
  };

  // Add to cart
  const handleAddToCart = () => {
    dispatch(cartAdd({ product, quantity: 1 }));
  };

  // Update quantity
  const handleQuantityChange = (productId, newQuantity) => {
    dispatch(updateCartItemQuantity({ productId, quantity: newQuantity }));
  };

  // Remove from cart
  const handleRemoveFromCart = (productId) => {
    dispatch(cartRemove(productId));
  };

  return (
    <Link 
      to={`/product/${product._id}`} 
      onClick={handleProductView}
      className="product-card"
    >
      {/* ... existing product card content ... */}
      <div>
        {/* Product details */}
        {isInCart ? (
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleQuantityChange(product._id, quantity - 1)}
              className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded"
            >
              -
            </button>
            <span>{quantity}</span>
            <button 
              onClick={() => handleQuantityChange(product._id, quantity + 1)}
              className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded"
            >
              +
            </button>
          </div>
        ) : (
          <button 
            onClick={handleAddToCart}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add to Cart
          </button>
        )}
      </div>
    </Link>
  );
};

export default ProductCard; 