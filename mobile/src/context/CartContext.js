import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from '../config/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch cart items when component mounts or auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/cart/getCartItems');
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (productId, product) => {
    try {
      await axios.post('/api/cart/add', { productId, quantity: 1 });
      setCart(prev => ({
        ...prev,
        [productId]: {
          quantity: 1,
          price: product.price,
          name: product.name,
          image: product.images[0]
        }
      }));
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      await axios.put(`/api/cart/update/${productId}`, { quantity: newQuantity });
      
      setCart(prev => {
        const updated = { ...prev };
        if (newQuantity <= 0) {
          delete updated[productId];
        } else {
          updated[productId] = {
            ...updated[productId],
            quantity: newQuantity
          };
        }
        return updated;
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const isInCart = (productId) => {
    return Boolean(cart[productId]);
  };

  const getQuantity = (productId) => {
    return cart[productId]?.quantity || 0;
  };

  const value = {
    cart,
    loading,
    fetchCart,
    setCart,
    addToCart,
    updateQuantity,
    isInCart,
    getQuantity
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext; 