import { configureStore } from '@reduxjs/toolkit';
import wishlistReducer from './wishlistSlice';
import cartReducer from './cartSlice';
import searchReducer from './searchSlice';
import userReducer from './userSlice';
// Import other reducers as needed

export const store = configureStore({
  reducer: {
    wishlist: wishlistReducer,
    cart: cartReducer,
    search: searchReducer,
    user: userReducer,
    // Add other reducers here
  },
  // Add middleware to handle any async actions if needed
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
}); 