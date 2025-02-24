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
  },

  getReview: async (reviewId) => {
    try {
      console.log('Fetching review with ID:', reviewId);
      // सही API endpoint का उपयोग
      const response = await axios.get(`/api/reviews/reviews/${reviewId}`);
      
      console.log('Review API Response:', response.data);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          review: {
            rating: response.data.review.rating,
            comment: response.data.review.comment,
            images: response.data.review.images || [],
            // अन्य फील्ड्स जो आपको चाहिए
          }
        };
      }
      
      throw new Error(response.data.message || 'Review not found');
    } catch (error) {
      console.error('Get review error details:', error.response || error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch review'
      };
    }
  },

  editReview: async (reviewId, reviewData) => {
    try {
      const response = await axios.patch(`/api/reviews/${reviewId}`, reviewData);
      
      if (response.data.success) {
        return {
          success: true,
          review: response.data.review
        };
      }
      
      throw new Error(response.data.message || 'Failed to update review');
    } catch (error) {
      console.error('Edit review error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update review'
      };
    }
  }
}; 