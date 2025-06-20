import axios from '../config/axios';

export const reviewApi = {
  // Check if user can review
  checkUserReview: async (productId) => {
    try {
      const response = await axios.get(`/api/reviews/check/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Check review eligibility error:', error);
      throw error;
    }
  },

  // Create review
  createReview: async (productId, reviewData) => {
    try {
      console.log('ReviewAPI - Creating review with data:', {
        productId,
        orderId: reviewData.orderId,
        rating: reviewData.rating,
        hasComment: !!reviewData.comment,
        imagesCount: reviewData.images?.length
      });

      if (!reviewData.orderId) {
        throw new Error('Order ID is required');
      }

      // Create FormData
      const formData = new FormData();
      
      // Convert orderId to string and append it
      formData.append('orderId', String(reviewData.orderId));
      formData.append('rating', String(reviewData.rating));
      
      if (reviewData.comment) {
        formData.append('comment', reviewData.comment);
      }

      // Add images if any
      if (reviewData.images && reviewData.images.length > 0) {
        reviewData.images.forEach((uri, index) => {
          const filename = uri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';

          formData.append('images', {
            uri,
            type,
            name: filename || `image${index}.jpg`,
          });
        });
      }

      // Log FormData for debugging
      console.log('Sending review with orderId:', String(reviewData.orderId));

      const response = await axios.post(
        `/api/reviews/products/${productId}/reviews`,
        formData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('ReviewAPI - Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('ReviewAPI - Error:', error.response?.data || error);
      throw error;
    }
  },

  // Get paginated reviews
  getProductReviews: async (productId, page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/api/reviews/products/${productId}/paginated?page=${page}&limit=${limit}`);
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
  },

  deleteReview: async (reviewId) => {
    try {
      console.log('Deleting review with ID:', reviewId);
      const response = await axios.delete(`/api/reviews/${reviewId}`);
      
      console.log('Delete API Response:', response.data);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          message: 'Review deleted successfully'
        };
      }
      
      throw new Error(response.data.message || 'Failed to delete review');
    } catch (error) {
      console.error('Delete review error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete review'
      };
    }
  }
}; 