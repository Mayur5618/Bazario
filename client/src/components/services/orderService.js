import axios from 'axios';
import axiosInstance from '../utils/axiosConfig';

const API_URL = '/api/orders';

export const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    try {
      const response = await axiosInstance.post('/orders/create', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get buyer's orders
  getMyOrders: async () => {
    try {
      const response = await axiosInstance.get('/orders/my-orders-details');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single order details
  getOrderDetails: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/details/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    try {
      const response = await axiosInstance.put(`/orders/cancel/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};