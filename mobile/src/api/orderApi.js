import axios from '../config/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  },

  // Get seller orders
  getSellerOrders: async () => {
    try {
      const response = await axios.get('/api/orders/seller-orders');
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch seller orders');
      }
      throw new Error('Network error occurred');
    }
  },

  // Get order details by ID
  getOrderById: async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Get order details error:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await axios.put(`/api/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }
}; 