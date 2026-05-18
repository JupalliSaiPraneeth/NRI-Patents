import axios from 'axios';

// Dynamically determine the backend URL
// If VITE_API_URL is set in .env, use it.
// Otherwise, construct the URL using the current browser's hostname (local IP or localhost) and port 3000.
// This ensures that if you access the frontend via 192.168.x.x, it tries to hit the backend at 192.168.x.x:3000.
export const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If we are running in development/local environment, use the local backend.
  // Otherwise, use the production Render backend URL.
  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' || 
                  window.location.hostname.startsWith('192.168.');
                  
  if (isLocal) {
    return `http://${window.location.hostname}:3000`;
  }
  
  return 'https://nri-patents-2.onrender.com';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error("❌ API Request Error:", error);
    }
    return Promise.reject(error);
  }
);

// Add a response interceptor for easier debugging
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ API Response [${response.status}]: ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      if (import.meta.env.DEV) {
        console.error(`❌ API Error [${error.response.status}]: ${error.config.url}`, error.response.data);
      }

      // Auto-logout on 401 (expired/invalid token) — skip for login endpoint
      if (error.response.status === 401 && !error.config.url?.includes('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    } else if (error.request) {
      console.error(`❌ API Network Error: No response received from ${error.config.url}`);
    } else {
      console.error('❌ API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
