import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
    baseURL:  'http://localhost:5000',
    withCredentials: true, // Important: This enables sending cookies with requests
    headers: {
      'Content-Type': 'application/json'
    }

    // baseURL: '/api'
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;