import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  cart: 0, // This tracks the total quantity
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Initialize cart with existing items
    cartSetUp: (state, action) => {
      state.items = action.payload;
      // Calculate total items
      state.cart = action.payload.reduce((total, item) => total + item.quantity, 0);
    },

    // Add item to cart
    cartAdd: (state) => {
      // Increment only when adding new product
      state.cart += 1;
    },

    // Remove item from cart completely
    cartRemove: (state) => {
      // Decrement only when removing a product completely
      state.cart = Math.max(0, state.cart - 1);
    },

    // Update item quantity
    updateCartItemQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.product._id === productId);
      
      if (item) {
        // Calculate difference to update total cart count
        const difference = quantity - item.quantity;
        item.quantity = quantity;
        state.cart += difference;

        // Remove item if quantity is 0
        if (quantity === 0) {
          state.items = state.items.filter(item => item.product._id !== productId);
        }
      }
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.cart = 0;
    },
    cartItemRemove: (state, action) => {
      const productId = action.payload;
      // Remove item and decrease cart count by 1 (not by quantity)
      state.items = state.items.filter(item => item.product._id !== productId);
      state.cart = Math.max(0, state.cart - 1);
    },
    setCartItems: (state, action) => {
      state.items = action.payload || [];
      // Set cart count to number of unique items
      state.cart = (action.payload || []).length;
    },
  },
});

// Export actions
export const {
  cartSetUp,
  cartAdd,
  cartRemove,
  updateCartItemQuantity,
  clearCart,
  cartItemRemove,
  setCartItems,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart?.items || [];
export const selectCartTotal = (state) => {
  const items = state.cart?.items || [];
  return items.reduce((total, item) => {
    const price = item?.product?.price || 0;
    const quantity = item?.quantity || 0;
    return total + (price * quantity);
  }, 0);
};

export const selectCartItemCount = (state) => state.cart?.cart || 0;

export default cartSlice.reducer;

