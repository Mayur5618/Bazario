// Create new slice for search functionality
import { createSlice } from '@reduxjs/toolkit';

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    recentSearches: [],
  },
  reducers: {
    addToRecentSearches: (state, action) => {
      const newSearch = action.payload;
      state.recentSearches = [
        newSearch,
        ...state.recentSearches.filter(search => search !== newSearch)
      ].slice(0, 5); // Keep only last 5 searches
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
  },
});

export const { addToRecentSearches, clearRecentSearches } = searchSlice.actions;
export default searchSlice.reducer; 