import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    setCartItems: (state, action) => {
      state.items = action.payload;
    },
    addCartItem: (state, action) => {
      state.items.push(action.payload);
    },
    updateCartItemQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.product._id === productId);
      if (item) {
        item.quantity = quantity;
      }
    },
    removeCartItem: (state, action) => {
      state.items = state.items.filter(item => item.product._id !== action.payload);
    }
  }
});

export const { 
  setCartItems, 
  addCartItem, 
  updateCartItemQuantity, 
  removeCartItem 
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => 
  state.cart.items.reduce((total, item) => 
    total + (item.product.price * item.quantity), 0
  );

export default cartSlice.reducer;