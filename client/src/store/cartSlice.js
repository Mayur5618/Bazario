// import { createSlice } from '@reduxjs/toolkit';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';
// import api from '../utils/axios';

// const initialState = {
//   items: [],
//   loading: false,
//   error: null
// };

// const cartSlice = createSlice({
//   name: 'cart',
//   initialState,
//   reducers: {
//     setCartItems: (state, action) => {
//       state.items = action.payload;
//     },
//     addCartItem: (state, action) => {
//       state.items.push(action.payload);
//     },
//     removeCartItem: (state, action) => {
//       state.items = state.items.filter(item => item.product._id !== action.payload);
//     },
//     updateCartItemQuantity: (state, action) => {
//       const { productId, quantity } = action.payload;
//       const item = state.items.find(item => item.product._id === productId);
//       if (item) {
//         item.quantity = quantity;
//       }
//     },
//     clearCart: (state) => {
//       state.items = [];
//     }
//   }
// });

// // Thunk actions
// export const fetchCart = () => async (dispatch) => {
//   try {
//     const token = localStorage.getItem('token');
//     const response = await axios.get('/api/cart', {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     dispatch(setCartItems(response.data.cart.items));
//   } catch (error) {
//     toast.error('Failed to fetch cart');
//   }
// };

// // export const addToCart = (productId, quantity) => async (dispatch) => {
// //   try {
// //     const token = localStorage.getItem('token');
// //     const response = await axios.post('/api/cart/add', 
// //       { productId, quantity },
// //       { headers: { Authorization: `Bearer ${token}` }}
// //     );
// //     dispatch(setCartItems(response.data.cart.items));
// //     toast.success('Added to cart successfully!');
// //   } catch (error) {
// //     toast.error(error.response?.data?.message || 'Failed to add to cart');
// //   }
// // };
// export const addToCart = (productId, quantity) => async (dispatch) => {
//     try {
//       const response = await ('/cart/add', { productId, quantity });
      
//       if (response.data.success) {
//         dispatch(setCartItems(response.data.cart.items));
//         toast.success('Added to cart successfully!');
//       }
//     } catch (error) {
//       if (error.response?.status === 401) {
//         toast.error('Please login to add items to cart');
//       } else {
//         toast.error(error.response?.data?.message || 'Failed to add to cart');
//       }
//     }
//   };

// export const removeFromCart = (productId) => async (dispatch) => {
//   try {
//     const token = localStorage.getItem('token');
//     await axios.delete(`/api/cart/remove/${productId}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     dispatch(removeCartItem(productId));
//     toast.success('Item removed from cart');
//   } catch (error) {
//     toast.error('Failed to remove item from cart');
//   }
// };

// export const updateQuantity = (productId, quantity) => async (dispatch) => {
//   try {
//     const token = localStorage.getItem('token');
//     await axios.put(`/api/cart/update/${productId}`,
//       { quantity },
//       { headers: { Authorization: `Bearer ${token}` }}
//     );
//     dispatch(updateCartItemQuantity({ productId, quantity }));
//     toast.success('Quantity updated');
//   } catch (error) {
//     toast.error('Failed to update quantity');
//   }
// };

// export const { setCartItems, addCartItem, removeCartItem, updateCartItemQuantity, clearCart } = cartSlice.actions;

// // Selectors
// export const selectCartItems = state => state.cart.items;
// export const selectCartTotal = state => state.cart.items.reduce(
//   (total, item) => total + (item.product.price * item.quantity), 
//   0
// );
// export const selectCartCount = state => state.cart.items.reduce(
//   (count, item) => count + item.quantity, 
//   0
// );

// export default cartSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    cartSetUp: (state, action) => {
      state.cart = action.payload;
    },
    cartAdd: (state) => {
      state.cart += 1;
    },
    cartRemove: (state) => {
      state.cart -= 1;
    },
    cartItemRemove: (state, action) => {
      state.cart -= action.payload;
    },
  },
});

export const { cartSetUp, cartAdd, cartItemRemove, cartRemove, cartEmpty } =
  cartSlice.actions;
export default cartSlice.reducer;
