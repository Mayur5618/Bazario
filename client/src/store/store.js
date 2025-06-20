// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './authSlice';
// import userReducer from './userSlice';

// const store = configureStore({
//   reducer: {
//     user: userReducer,
//   },
// });

// export default store;

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userSlice from './userSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import cartSlice from './cartSlice';
import wishlistReducer from './wishlistSlice';
import searchReducer from './searchSlice';

// import themeSlice from './theme/themeSlice';
// import cartSlice from './cart/cartSlice';

// Combine all reducers
const rootReducer = combineReducers({
    user: userSlice,
    cart: cartSlice,
    wishlist: wishlistReducer,
    search: searchReducer,
    // theme: themeSlice,
    // cart: cartSlice,
});

// Configuration for redux-persist
const persistConfig = {
    key: "root", // Key for the persisted state
    storage, // Use local storage
    version: 1,
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the Redux store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }), // Disable serializable check for non-serializable values
});

// Create a persistor for the store
export const persistor = persistStore(store);

export default { store, persistor };