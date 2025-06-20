import axios from '../config/axios';

export const wishlistApi = {
  // Get wishlist items
  getWishlist: async () => {
    try {
      const response = await axios.get('/api/wishlist');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch wishlist');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  // Add to wishlist
  addToWishlist: async (productId) => {
    try {
      const response = await axios.post('/api/wishlist/add', { productId });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to add to wishlist');
      }
      return response.data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (productId) => {
    try {
      const response = await axios.delete(`/api/wishlist/remove/${productId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to remove from wishlist');
      }
      return response.data;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  // Get bulk products for wishlist items
  getWishlistProducts: async (productIds) => {
    try {
      const response = await axios.post('/api/products/bulk', { productIds });
      return response.data;
    } catch (error) {
      console.error('Get wishlist products error:', error);
      throw error;
    }
  },

  // Clear wishlist
  clearWishlist: async () => {
    try {
      const response = await axios.delete('/api/wishlist/clear');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to clear wishlist');
      }
      return response.data;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      throw error;
    }
  }
}; 