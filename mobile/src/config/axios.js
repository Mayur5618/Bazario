import axios from 'axios';
import Constants from 'expo-constants';

// Get the development server URL
const getDevelopmentUrl = () => {
  if (__DEV__) {
    return 'http://192.168.37.193:5000'; // Your local IP
  }
  return 'https://your-production-url.com'; // Your production URL
};

const instance = axios.create({
  baseURL: getDevelopmentUrl(),
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
    if (__DEV__) {
      console.log('Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default instance;