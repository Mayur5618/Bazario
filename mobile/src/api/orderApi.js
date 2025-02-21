import axios from '../config/axios';

export const orderApi = {
  getMyOrders: async () => {
    try {
      const response = await axios.get('/api/orders/my-orders', {
        params: {
          sort: 'status',
        }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch orders');
      }
      throw new Error('Network error occurred');
    }
  },

  getOrderDetails: async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch order details');
      }
      throw new Error('Network error occurred');
    }
  },

  cancelOrder: async (orderId) => {
    try {
      const response = await axios.put(`/api/orders/cancel/${orderId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to cancel order');
      }
      throw new Error('Network error occurred');
    }
  }
}; 