import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get the development server URL
const getDevelopmentUrl = () => {
  if (__DEV__) {
    // For both Android and iOS
    return 'http://192.168.145.193:5000';  // Verify this IP is correct
  }
  return 'https://your-production-api.com'; // For production
};

const instance = axios.create({
  baseURL: getDevelopmentUrl(),
  timeout: 30000, // Increase timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Add request interceptor for authentication
instance.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      if (__DEV__) {
        console.log('Request:', {
          url: config.url,
          method: config.method,
          headers: config.headers,
          data: config.data
        });
      }
    } catch (error) {
      console.error('Error adding token to request:', error);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor to log responses during development
instance.interceptors.response.use(
  response => {
    if (__DEV__) {
      console.log('Response:', response.data);
    }
    return response;
  },
  error => {
    if (__DEV__) {
      console.log('Error details:', {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        response: error.response?.data
      });
    }
    
    if (error.code === 'ERR_NETWORK') {
      // Network error handling
      console.log('Server not reachable. Please check if:');
      console.log('1. Backend server is running');
      console.log('2. IP address and port are correct');
      console.log('3. Device and server are on same network');
    }
    
    return Promise.reject(error);
  }
);

export default instance;