import React, { createContext, useContext, useState } from 'react';
import { wishlistApi } from '../api/wishlistApi';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  const addToWishlist = async (productId) => {
    try {
      await wishlistApi.addToWishlist(productId);
      setWishlistItems(prev => [...prev, productId]);
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistApi.removeFromWishlist(productId);
      setWishlistItems(prev => prev.filter(id => id !== productId));
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };

  const getWishlist = async () => {
    try {
      const response = await wishlistApi.getWishlist();
      if (response.success && response.wishlist) {
        setWishlistItems(response.wishlist);
        return response;
      }
      return { wishlist: [] };
    } catch (error) {
      console.error('Error in getWishlist:', error);
      throw error;
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      getWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}; 