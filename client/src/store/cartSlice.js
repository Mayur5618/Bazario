import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  cart: 0, // Total number of items in cart
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
    cartAdd: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.product._id === product._id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
      
      // Update total cart count
      state.cart += quantity;
    },

    // Remove item from cart completely
    cartRemove: (state, action) => {
      const productId = action.payload;
      const itemIndex = state.items.findIndex(item => item.product._id === productId);
      
      if (itemIndex !== -1) {
        // Subtract the quantity from total cart count
        state.cart -= state.items[itemIndex].quantity;
        // Remove item from array
        state.items.splice(itemIndex, 1);
      }
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
      state.cart -= action.payload;
    },
    setCartItems: (state, action) => {
      state.items = action.payload || [];
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

