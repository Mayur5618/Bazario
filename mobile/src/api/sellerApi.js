import axios from '../config/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Review related endpoints
const getReviewStats = async () => {
    try {
        const response = await axios.get('/api/seller/reviews/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching review stats:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Error fetching review statistics'
        };
    }
};

const getLatestReviews = async () => {
    try {
        const response = await axios.get('/api/seller/reviews/latest');
        return response.data;
    } catch (error) {
        console.error('Error fetching latest reviews:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Error fetching latest reviews'
        };
    }
};

const searchProductReviews = async (query) => {
    try {
        const response = await axios.get('/api/seller/reviews/search', {
            params: { query }
        });
        return response.data;
    } catch (error) {
        console.error('Error searching product reviews:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Error searching product reviews'
        };
    }
};

export const sellerApi = {
    // Get dashboard statistics
    getDashboardStats: async () => {
        try {
            const response = await axios.get('/api/seller/dashboard-stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            if (error.response?.data) {
                throw new Error(error.response.data.message || 'Failed to fetch dashboard statistics');
            }
            throw new Error('Network error occurred while fetching dashboard statistics');
        }
    },

    // Get product details
    getProductDetails: async (productId) => {
        try {
            const response = await axios.get(`/api/products/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching product details:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to fetch product details');
            }
            throw new Error('Network error occurred');
        }
    },

    // Get pending orders
    getPendingOrders: async () => {
        try {
            const response = await axios.get('/api/seller/pending-orders');
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
                throw new Error(error.response.data.message || 'Failed to fetch pending orders');
            }
            throw new Error('Network error occurred');
        }
    },

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

    // Get single order details
    getOrderDetails: async (orderId) => {
        try {
            const response = await axios.get(`/api/orders/${orderId}`);
            // Parse the nested objects in the response
            if (response.data.success && response.data.order) {
                const order = response.data.order;
                return {
                    success: true,
                    order: {
                        ...order,
                        buyer: order.buyer || {},
                        items: order.items || [],
                        payment: order.payment || {},
                        shippingAddress: order.shippingAddress || {}
                    }
                };
            }
            return response.data;
        } catch (error) {
            console.error('Error details:', error.response?.data || error.message);
            if (error.response?.data) {
                throw new Error(error.response.data.message || 'Failed to fetch order details');
            }
            throw new Error('Network error occurred');
        }
    },

    // Get customer order history
    getCustomerOrderHistory: async (customerId) => {
        try {
            const response = await axios.get(`/api/orders/customer/${customerId}/history`);
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to fetch customer history');
            }
            throw new Error('Network error occurred');
        }
    },

    // Update order status
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await axios.put(`/api/orders/update-status/${orderId}`, { status });
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
            console.error('Error fetching profile:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error fetching profile'
            };
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
    },

    // Get seller reviews
    getReviews: async (params = {}) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await axios.get(`/api/seller/reviews?${queryString}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to fetch reviews');
            }
            throw new Error('Network error occurred');
        }
    },

    // Get seller's products
    getSellerProducts: async (params = {}) => {
        try {
            const response = await axios.get('/api/seller/products', {
                params: {
                    platformType: params.platformType || 'b2c',
                    limit: params.limit,
                    sort: params.sort
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching seller products:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error fetching seller products'
            };
        }
    },

    replyToReview: async (reviewId, comment) => {
        try {
            const response = await axios.post(`/api/reviews/${reviewId}/reply`, {
                comment
            });
            return response.data;
        } catch (error) {
            console.error('Error replying to review:', error);
            throw {
                message: error.response?.data?.message || 'जवाब देने में समस्या हुई',
                error: error
            };
        }
    },

    // Update product
    updateProduct: async (productId, productData) => {
        try {
            const response = await axios.put(`/api/seller/products/${productId}`, productData);
            return response.data;
        } catch (error) {
            console.error('Error updating product:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to update product');
            }
            throw new Error('Network error occurred');
        }
    },

    // Add this new method
    register: async (registrationData) => {
        try {
            const response = await axios.post('/api/seller/signup', registrationData);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to register');
            }
            throw new Error('Network error occurred');
        }
    },

    // Get seller order statistics
    getOrderStats: async () => {
        try {
            const response = await axios.get('/api/orders/seller-stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching order stats:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to fetch order statistics');
            }
            throw new Error('Network error occurred');
        }
    },

    getReviewStats,
    getLatestReviews,
    searchProductReviews,

    // Get seller's B2B products
    getSellerB2BProducts: async () => {
        try {
            const response = await axios.get('/api/products/seller/b2b-products');
            return response.data;
        } catch (error) {
            console.error('Error fetching B2B products:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error fetching B2B products'
            };
        }
    },

    // Get B2B product details
    getB2BProductDetails: async (productId) => {
        try {
            const response = await axios.get(`/api/products/b2b/products/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching B2B product details:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error fetching B2B product details'
            };
        }
    },

    // Get seller's B2B products by status
    getSellerProductsByStatus: async ({ status }) => {
        try {
            const response = await axios.get('/api/products/seller/b2b-products/status', {
                params: { status }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching B2B products by status:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error fetching B2B products'
            };
        }
    },
}; 