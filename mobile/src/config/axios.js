import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get the development server URL
const getDevelopmentUrl = () => {
  if (__DEV__) {
    // For Android Emulator
    if (Platform.OS === 'android') {
      return 'http://192.168.186.193:5000'; // Your local IP address
    }
    
    // For iOS Simulator or Physical Device
    return 'http://192.168.186.193:5000'; // Your local IP address
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

// Add request interceptor to log requests during development
instance.interceptors.request.use(
  config => {
    if (__DEV__) {
      console.log('Request:', {
        url: config.url,
        method: config.method,
        data: config.data
      });
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
    console.log('Error details:', {
      message: error.message,
      code: error.code,
      url: error.config?.url
    });
    
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