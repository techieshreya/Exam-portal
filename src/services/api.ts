import axios from 'axios';

export const api = axios.create({
  baseURL: "https://unisphere-api.clusterider.tech/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
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

// Add a response interceptor to handle errors and responses
api.interceptors.response.use(
  (response) => {
    // If the response has a data.data structure, return just the data
    if (response.data && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    // Handle errors, including authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Don't redirect here, let the ProtectedRoute handle it
    }
    
    // Extract error message from the response if available
    const errorMessage = error.response?.data?.error?.message || error.message;
    const enhancedError = new Error(errorMessage);
    enhancedError.stack = error.stack;
    return Promise.reject(enhancedError);
  }
);
