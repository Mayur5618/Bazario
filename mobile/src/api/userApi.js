import axios from '../config/axios';

export const userApi = {
  // ... existing methods

  getShippingAddresses: async () => {
    try {
      const response = await axios.get('/api/shipping-addresses');
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch addresses');
      }
      throw new Error('Network error occurred');
    }
  },

  addShippingAddress: async (addressData) => {
    try {
      const response = await axios.post('/api/shipping-addresses', addressData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to add address');
      }
      throw new Error('Network error occurred');
    }
  },

  deleteShippingAddress: async (addressId) => {
    try {
      const response = await axios.delete(`/api/shipping-addresses/${addressId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to delete address');
      }
      throw new Error('Network error occurred');
    }
  }
}; 