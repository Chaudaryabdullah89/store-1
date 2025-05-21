import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://apna-backend.vercel.app/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log('Making request:', {
        url: config.url,
        method: config.method,
        data: config.data,
        headers: config.headers
      });
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('Response received:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
    }
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });

      // Handle authentication errors
      if (error.response.status === 401) {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Show error message
        toast.error('Your session has expired. Please login again.');
        
        // Redirect to login page
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Handle forbidden errors
      if (error.response.status === 403) {
        toast.error('You do not have permission to access this resource');
        return Promise.reject(error);
      }

      // Handle validation errors
      if (error.response.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          Object.values(errors).forEach(error => {
            toast.error(error[0]);
          });
        }
        return Promise.reject(error);
      }

      // Handle server errors
      if (error.response.status >= 500) {
        toast.error('Server error. Please try again later.');
        return Promise.reject(error);
      }

      // Show error message from server
      const errorMessage = error.response.data.message || 'An error occurred';
      toast.error(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      toast.error('No response from server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      toast.error('Error setting up request. Please try again.');
    }

    return Promise.reject(error);
  }
);

export default api; 