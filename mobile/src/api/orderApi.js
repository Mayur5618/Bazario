import axios from '../config/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store/store';
import { clearCart } from '../store/slices/cartSlice';

export const createOrder = async (orderData) => {
  try {
    // Validate required fields
    if (!orderData.shippingAddress || !orderData.paymentMethod) {
      throw new Error('Shipping address and payment method are required');
    }

    const response = await axios.post('/api/orders/create', orderData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create order');
    }

    // Clear Redux cart
    store.dispatch(clearCart());

    // Clear cart in backend
    try {
      await axios.delete('/api/cart/clear');
    } catch (error) {
      console.error('Error clearing cart in backend:', error);
    }

    return response.data;
  } catch (error) {
    console.error('Order creation error:', error);
    throw error.response?.data || error;
  }
};

export const getMyOrders = async () => {
  try {
    const response = await axios.get('/api/orders/my-orders');
    return response;
  } catch (error) {
    throw error;
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    const response = await axios.get(`/api/orders/${orderId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

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

  cancelOrder: async (orderId, reason) => {
    try {
      const response = await axios.put(`/api/orders/cancel/${orderId}`, {
        cancellationReason: reason
      });
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