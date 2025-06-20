import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with dynamic base URL
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // You can handle successful responses here
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          toast.error('Please login to continue');
          window.location.href = '/login';
          break;
        
        case 403:
          // Forbidden
          toast.error('You do not have permission to perform this action');
          break;
        
        case 404:
          // Not found
          toast.error('Resource not found');
          break;
        
        case 422:
          // Validation error
          const validationErrors = error.response.data.errors;
          if (validationErrors) {
            Object.values(validationErrors).forEach(error => {
              toast.error(error);
            });
          }
          break;
        
        case 500:
          // Server error
          toast.error('Internal server error. Please try again later.');
          break;
        
        default:
          // Other errors
          toast.error(error.response.data.message || 'Something went wrong');
      }
    } else if (error.request) {
      // Request made but no response received
      toast.error('No response from server. Please check your internet connection.');
    } else {
      // Error in request configuration
      toast.error('Error in request configuration');
    }

    return Promise.reject(error);
  }
);

// API methods
const apiService = {
  // Auth endpoints
  auth: {
    login: (data) => api.post('/auth/signin', data),
    register: (data) => api.post('/auth/signup', data),
    logout: () => api.post('/auth/signout'),
    verifyToken: () => api.get('/auth/verify'),
    sendOtp: (data) => api.post('/auth/send-otp', data),
    verifyOtp: (data) => api.post('/auth/verify-otp', data)
  },

  // Cart endpoints
  cart: {
    add: (data) => api.post('/cart/add', data),
    get: () => api.get('/cart'),
    update: (data) => api.put('/cart/update', data),
    remove: (productId) => api.delete(`/cart/remove/${productId}`),
    clear: () => api.delete('/cart/clear')
  },

  // Product endpoints
  products: {
    getAll: (params) => api.get('/products', { params }),
    getOne: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    addReview: (id, data) => api.post(`/products/${id}/reviews`, data)
  },

  // Order endpoints
  orders: {
    create: (data) => api.post('/orders', data),
    getAll: () => api.get('/orders'),
    getOne: (id) => api.get(`/orders/${id}`),
    update: (id, data) => api.put(`/orders/${id}`, data),
    cancel: (id) => api.put(`/orders/${id}/cancel`)
  },

  // User profile endpoints
  profile: {
    get: () => api.get('/profile'),
    update: (data) => api.put('/profile', data),
    updatePassword: (data) => api.put('/profile/password', data)
  },

  // Wishlist endpoints
  wishlist: {
    get: () => api.get('/wishlist'),
    add: (data) => api.post('/wishlist/add', data),
    remove: (productId) => api.delete(`/wishlist/remove/${productId}`),
    clear: () => api.delete('/wishlist/clear')
  }
};

export default apiService;

// Usage example:
/*
import api from '../utils/axios';

// In your components:
try {
  // Login
  const response = await api.auth.login({ 
    mobileno: '1234567890', 
    password: 'password123' 
  });

  // Add to cart
  await api.cart.add({ 
    productId: '123', 
    quantity: 1 
  });

  // Get products
  const products = await api.products.getAll({ 
    page: 1, 
    limit: 10 
  });

  // Create order
  await api.orders.create({
    items: [...],
    shippingAddress: {...}
  });

} catch (error) {
  // Error handling is done by interceptor
  console.error('Operation failed:', error);
}
*/