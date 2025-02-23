import axios from '../config/axios';

export const reviewApi = {
  // Check if user can review
  checkUserReview: async (productId) => {
    try {
      const response = await axios.get(`/api/reviews/user/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Check review eligibility error:', error);
      throw error;
    }
  },

  // Create review
  createReview: async (productId, reviewData) => {
    try {
      const response = await axios.post(`/api/reviews/products/${productId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Create review error:', error);
      throw error;
    }
  },

  // Get product reviews
  getProductReviews: async (productId, page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/api/reviews/products/${productId}/reviews/paginated?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get reviews error:', error);
      throw error;
    }
  },

  // Like review
  toggleReviewLike: async (reviewId) => {
    try {
      const response = await axios.post(`/api/reviews/${reviewId}/like`);
      return response.data;
    } catch (error) {
      console.error('Toggle review like error:', error);
      throw error;
    }
  }
}; 