import { configureStore } from '@reduxjs/toolkit';
import searchReducer from './searchSlice';
// Import other reducers as needed

export const store = configureStore({
  reducer: {
    search: searchReducer,
    // Add other reducers here
  }
}); 