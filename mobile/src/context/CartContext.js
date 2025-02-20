import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from '../config/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Fetch cart items when component mounts or auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartItems();
    }
  }, [isAuthenticated]);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get('/api/cart/getCartItems');
      const items = {};
      
      // Convert array to object for O(1) lookup
      response.data.cart.items.forEach(item => {
        items[item.product._id] = {
          quantity: item.quantity,
          price: item.product.price,
          name: item.product.name,
          image: item.product.images[0]
        };
      });
      
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, product) => {
    try {
      await axios.post('/api/cart/add', { productId, quantity: 1 });
      setCartItems(prev => ({
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
      
      setCartItems(prev => {
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
    return Boolean(cartItems[productId]);
  };

  const getQuantity = (productId) => {
    return cartItems[productId]?.quantity || 0;
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      updateQuantity,
      isInCart,
      getQuantity,
      refreshCart: fetchCartItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext; 