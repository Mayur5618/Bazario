import React, { createContext, useContext, useState } from 'react';
import axios from '../config/axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(false);

  // Get cart items
  const getCart = async () => {
    try {
      const response = await axios.get('/api/cart/getCartItems');
      if (response.data.success) {
        const cartObject = response.data.cart.items.reduce((acc, item) => {
          acc[item.product._id] = item;
          return acc;
        }, {});
        setCartItems(cartObject);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems({});
    }
  };

  // Add to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/cart/add', {
        productId,
        quantity
      });

      if (response.data.success) {
        await getCart(); // Refresh cart after adding
        return true;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      setLoading(true);
      if (quantity < 1) {
        await axios.delete(`/api/cart/remove/${productId}`);
      } else {
        await axios.put(`/api/cart/update/${productId}`, { quantity });
      }
      await getCart(); // Refresh cart after update
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      getCart,
      addToCart,
      updateQuantity
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

export default CartProvider; 