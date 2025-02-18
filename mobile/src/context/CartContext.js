import React, { createContext, useContext, useReducer } from 'react';
import axios from '../config/axios';
import { useAuth } from './AuthContext';

export const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return action.payload;
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item => 
          item.product._id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    case 'CLEAR_CART':
      return { items: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, { items: [] });
  const { user } = useAuth();

  const fetchCart = async () => {
    try {
      const response = await axios.get('/api/cart/getCartItems', {
        headers: {
          Authorization: `Bearer ${user?._id}`
        }
      });
      dispatch({ type: 'SET_CART', payload: response.data.cart });
    } catch (error) {
      console.error('Fetch cart error:', error);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await axios.post('/api/cart/add', 
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${user?._id}`
          }
        }
      );
      dispatch({ type: 'SET_CART', payload: response.data.cart });
      return true;
    } catch (error) {
      console.error('Add to cart error:', error);
      return false;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await axios.put(`/api/cart/update/${productId}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${user?._id}`
          }
        }
      );
      dispatch({ type: 'SET_CART', payload: response.data.cart });
      return true;
    } catch (error) {
      console.error('Update quantity error:', error);
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await axios.delete(`/api/cart/remove/${productId}`, {
        headers: {
          Authorization: `Bearer ${user?._id}`
        }
      });
      dispatch({ type: 'SET_CART', payload: response.data.cart });
      return true;
    } catch (error) {
      console.error('Remove from cart error:', error);
      return false;
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      fetchCart,
      removeFromCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext); 