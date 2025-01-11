import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
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
    clearCart: (state) => {
      state.items = [];
    },
    cartItemRemove: (state, action) => {
      state.cart -= action.payload;
    },
      // Add new reducers for cart items
      setCartItems: (state, action) => {
        state.items = action.payload || [];
      },
      updateCartItemQuantity: (state, action) => {
        const { productId, quantity } = action.payload;
        const item = state.items.find(item => item.product._id === productId);
        if (item) {
          item.quantity = quantity;
        }
      },
  },
});

// Export actions
export const {
  cartSetUp,
  cartAdd,
  cartRemove,
  cartItemRemove,
  setCartItems,
  updateCartItemQuantity,
  clearCart,
} = cartSlice.actions;

// Add selectors
// Add selectors with null checks
export const selectCartItems = (state) => state.cart?.items || [];
export const selectCartTotal = (state) => {
  const items = state.cart?.items || [];
  return items.reduce((total, item) => {
    const price = item?.product?.price || 0;
    const quantity = item?.quantity || 0;
    return total + (price * quantity);
  }, 0);
};

export default cartSlice.reducer;

// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   items: [],
//   cart: 0,
// };

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     cartSetUp: (state, action) => {
//       state.cart = action.payload;
//       state.cart = action.payload.reduce((total, item) => total + item.quantity, 0);
//     },
//     cartAdd: (state,action) => {
//       // state.cart += 1;
//       const { productId, quantity } = action.payload;
//       const item = state.items.find(item => item.product._id === productId);
//       if (item) {
//         item.quantity += quantity; // Increment quantity if item already exists
//       } else {
//         state.items.push({ product: { _id: productId }, quantity }); // Add new item
//       }
//       state.cart += quantity; // Increment total cart count

//     },
//     cartRemove: (state) => {
//       // state.cart -= 1;
//       const productId = action.payload;
//       const itemIndex = state.items.findIndex(item => item.product._id === productId);
//       if (itemIndex !== -1) {
//         const item = state.items[itemIndex];
//         state.cart -= item.quantity; // Decrement total cart count
//         state.items.splice(itemIndex, 1); // Remove item from cart
//       }
 
//     },
//     clearCart: (state) => {
//       state.items = [];
//       state.cart = 0; // Reset cart count
//     },
//     cartItemRemove: (state, action) => {
//       state.cart -= action.payload;
//     },
//       // Add new reducers for cart items
//       setCartItems: (state, action) => {
//         state.items = action.payload || [];
//       },
//       updateCartItemQuantity: (state, action) => {
//         // const { productId, quantity } = action.payload;
//         // const item = state.items.find(item => item.product._id === productId);
//         // if (item) {
//         //   item.quantity = quantity;
//         // }
//         const { productId, quantity } = action.payload;
//         const item = state.items.find(item => item.product._id === productId);
//         if (item) {
//           const difference = quantity - item.quantity; // Calculate the difference
//           item.quantity = quantity; // Update item quantity
//           state.cart += difference; // Update total cart count
//         }
   
//       },
//   },
// });

// // Export actions
// export const {
//   cartSetUp,
//   cartAdd,
//   cartRemove,
//   cartItemRemove,
//   setCartItems,
//   updateCartItemQuantity,
//   clearCart,
// } = cartSlice.actions;