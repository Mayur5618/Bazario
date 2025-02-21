import { createSlice } from '@reduxjs/toolkit';

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    recentSearches: [],
    trendingSearches: [
      'Roti-Sabji-kadhi',
      'Marathi Aachar',
      'Home Made Food',
      'Traditional Pickles',
      'Organic Products'
    ],
    popularProducts: [],
    isLoading: false,
    error: null
  },
  reducers: {
    addToRecentSearches: (state, action) => {
      const newSearch = action.payload;
      // Remove if already exists and add to front
      state.recentSearches = [
        newSearch,
        ...state.recentSearches.filter(search => search !== newSearch)
      ].slice(0, 5); // Keep only last 5 searches
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    setPopularProducts: (state, action) => {
      state.popularProducts = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const {
  addToRecentSearches,
  clearRecentSearches,
  setPopularProducts,
  setLoading,
  setError
} = searchSlice.actions;

export default searchSlice.reducer; 