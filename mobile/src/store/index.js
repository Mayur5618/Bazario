import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import cartReducer from './slices/cartSlice';
import searchReducer from './searchSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    search: searchReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false
    })
});

// For debugging
if (__DEV__) {
  console.log('Initial State:', store.getState());
}

export default store;

// Define RootState and AppDispatch types
/** @type {import('@reduxjs/toolkit').ThunkDispatch} */
export const AppDispatch = store.dispatch;

/** @type {ReturnType<typeof store.getState>} */
export const RootState = store.getState;