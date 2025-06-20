import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: {},
    total: 0,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items[product._id];
      
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.subtotal = existingItem.quantity * existingItem.price;
      } else {
        state.items[product._id] = {
          product,
          quantity,
          price: product.price,
          subtotal: product.price * quantity,
          seller: product.seller
        };
      }
      
      // Recalculate total
      state.total = Object.values(state.items).reduce(
        (sum, item) => sum + item.subtotal,
        0
      );
    },
    
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items[productId];
      
      if (item) {
        item.quantity = quantity;
        item.subtotal = item.price * quantity;
        
        // Recalculate total
        state.total = Object.values(state.items).reduce(
          (sum, item) => sum + item.subtotal,
          0
        );
      }
    },
    
    removeFromCart: (state, action) => {
      const productId = action.payload;
      delete state.items[productId];
      
      // Recalculate total
      state.total = Object.values(state.items).reduce(
        (sum, item) => sum + item.subtotal,
        0
      );
    },
    
    clearCart: (state) => {
      state.items = {};
      state.total = 0;
    }
  }
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.total;

export default cartSlice.reducer;