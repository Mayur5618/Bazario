import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProductCard = ({ product }) => {
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

  return (
    <Link 
      to={`/product/${product._id}`} 
      onClick={handleProductView}
      className="product-card"
    >
      {/* ... existing product card content ... */}
    </Link>
  );
};

export default ProductCard; 