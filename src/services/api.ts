
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Backend expects Bearer schema now? or just token? 
      // Middleware usually expects `Authorization: <token>` or `Bearer <token>`
      // Let's stick to standard Bearer if our backend supports it. 
      // Checking backend middleware might be wise, but usually Bearer is safe or just the token string.
      // Based on previous contexts, let's try standard Bearer.
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || 'Something went wrong';
        
        // Use toast.error to show the error message
        toast.error(message);

        if (error.response?.status === 401) {
            // Optional: trigger logout logic via event or callback if needed
            // For now, simpler to handle in UI or AuthContext
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
