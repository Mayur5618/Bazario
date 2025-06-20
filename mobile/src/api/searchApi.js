import axios from '../config/axios';

export const searchApi = {
  getSearchSuggestions: async (query) => {
    try {
      const response = await axios.get('/api/search/suggestions', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('Get suggestions error:', error.response || error);
      throw error;
    }
  },

  getRecentSearches: async () => {
    try {
      console.log('Calling recent searches API');
      const response = await axios.get('/api/search/recent');
      console.log('Recent searches API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get recent searches error:', error.response || error);
      throw error;
    }
  },

  saveSearch: async (query) => {
    try {
      console.log('Saving search:', query);
      const response = await axios.post('/api/search/history', { query });
      console.log('Save search response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Save search error:', error.response || error);
      throw error;
    }
  },

  deleteSearch: async (searchId) => {
    try {
      const response = await axios.delete(`/api/search/history/${searchId}`);
      return response.data;
    } catch (error) {
      console.error('Delete search error:', error.response || error);
      throw error;
    }
  },

  clearSearchHistory: async () => {
    try {
      const response = await axios.delete('/api/search/history');
      return response.data;
    } catch (error) {
      console.error('Clear search history error:', error.response || error);
      throw error;
    }
  }
}; 