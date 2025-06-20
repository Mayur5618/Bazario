import axios from '../config/axios';

export const productApi = {
  // Search products
  searchProducts: async (query) => {
    try {
      const response = await axios.get(`/api/products/search?query=${query}`);
      return response.data;
    } catch (error) {
      console.error('Search products error:', error);
      throw error;
    }
  },

  // Get popular products
  getPopularProducts: async () => {
    try {
      const response = await axios.get('/api/products/popular');
      return response.data;
    } catch (error) {
      console.error('Get popular products error:', error);
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get product error:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    try {
      const response = await axios.get(`/api/products/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Get products by category error:', error);
      throw error;
    }
  },

  // Get products by category with subcategory grouping
  getProductsByCategoryAndSubcategory: async (category, city) => {
    try {
      const response = await axios.get(`/api/products/category/${category}`, {
        params: { city }
      });
      return response.data;
    } catch (error) {
      console.error('Get products by category and subcategory error:', error);
      throw error;
    }
  }
}; 