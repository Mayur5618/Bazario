import axios from '../config/axios';

export const sellerApi = {
    // Get all orders for seller
    getSellerOrders: async () => {
        try {
            const response = await axios.get('/api/orders/seller-orders');
            // Parse the nested objects in the response
            if (response.data.success && response.data.orders) {
                const parsedOrders = response.data.orders.map(order => ({
                    ...order,
                    buyer: order.buyer || {},
                    items: order.items || [],
                    payment: order.payment || {},
                    shippingAddress: order.shippingAddress || {}
                }));
                return {
                    success: true,
                    orders: parsedOrders
                };
            }
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to fetch seller orders');
            }
            throw new Error('Network error occurred');
        }
    },

    // Update order status
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await axios.put(`/api/orders/${orderId}/status`, { status });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to update order status');
            }
            throw new Error('Network error occurred');
        }
    },

    // Get seller profile
    getProfile: async () => {
        try {
            const response = await axios.get('/api/seller/profile');
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to fetch seller profile');
            }
            throw new Error('Network error occurred');
        }
    },

    // Update seller profile
    updateProfile: async (profileData) => {
        try {
            const response = await axios.put('/api/seller/profile', profileData);
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to update seller profile');
            }
            throw new Error('Network error occurred');
        }
    }
}; 