import axios from '../config/axios';

export const wishlistApi = {
  // Get wishlist items
  getWishlist: async () => {
    try {
      const response = await axios.get('/api/user/wishlist');
      return response.data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  // Add to wishlist
  addToWishlist: async (productId) => {
    try {
      const response = await axios.post('/api/user/wishlist/add', { productId });
      return response.data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (productId) => {
    try {
      const response = await axios.post('/api/user/wishlist/remove', { productId });
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

  clearWishlist: async () => {
    const response = await axios.delete('/api/wishlist/clear');
    return response.data;
  }
}; 