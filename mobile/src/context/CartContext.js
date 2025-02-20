import React, { createContext, useContext, useState } from 'react';
import axios from '../config/axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cartTotal = cart?.items?.reduce((total, item) => {
    const itemPrice = parseFloat(item?.price || 0);
    const quantity = parseInt(item?.quantity || 0);
    return total + (itemPrice * quantity);
  }, 0) || 0;

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/cart/getCartItems');
      if (response.data.success) {
        setCart(response.data.cart || { items: [] });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.items.find(item => item.product._id === product._id);
      if (existingItem) {
        return {
          ...prevCart,
          items: prevCart.items.map(item =>
            item.product._id === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      }
      return {
        ...prevCart,
        items: [...prevCart.items, { product, quantity }]
      };
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.filter(item => item.product._id !== productId)
    }));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.map(item =>
        item.product._id === productId
          ? { ...item, quantity }
          : item
      )
    }));
  };

  const clearCart = () => {
    setCart({ items: [] });
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        cartTotal, 
        loading,
        error,
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart,
        fetchCart,
        setCart
      }}
    >
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