import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: {},  // Using object for O(1) lookup
    totalQuantity: 0,
    totalAmount: 0,
  },
  reducers: {
    addToCart: (state, action) => {
      const { productId, price, name, image } = action.payload;
      if (state.items[productId]) {
        state.items[productId].quantity += 1;
      } else {
        state.items[productId] = {
          quantity: 1,
          price,
          name,
          image,
        };
      }
      state.totalQuantity += 1;
      state.totalAmount += price;
    },
    removeFromCart: (state, action) => {
      const { productId, price } = action.payload;
      if (state.items[productId]) {
        state.totalQuantity -= state.items[productId].quantity;
        state.totalAmount -= price * state.items[productId].quantity;
        delete state.items[productId];
      }
    },
    updateQuantity: (state, action) => {
      const { productId, quantity, price } = action.payload;
      if (state.items[productId]) {
        const diff = quantity - state.items[productId].quantity;
        state.items[productId].quantity = quantity;
        state.totalQuantity += diff;
        state.totalAmount += diff * price;
        
        if (quantity <= 0) {
          delete state.items[productId];
        }
      }
    },
    clearCart: (state) => {
      state.items = {};
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer; 