import axios from 'axios';

// Function to get the current backend URL
const getBackendUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    console.log('🌐 Current hostname:', hostname);
    console.log('🌐 Current protocol:', protocol);
    
    // If running on IP address (not localhost), use the same IP for backend
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const backendUrl = `${protocol}//${hostname}:5002`;
      console.log('🔗 Using backend URL:', backendUrl);
      return backendUrl;
    }
  }
  
  // Default to localhost:5002 since that's where the server is running
  const defaultUrl = 'http://localhost:5002';
  console.log('🔗 Using default backend URL:', defaultUrl);
  return defaultUrl;
};

// Create axios instance with current backend URL
const createApiInstance = () => {
  const baseURL = `${getBackendUrl()}/api`;
  console.log('🔗 Creating API instance with baseURL:', baseURL);
  
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add request interceptor to include auth token
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Add response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('❌ API Error:', error.response?.data || error.message);
      if (error.code === 'ERR_NETWORK') {
        console.error('🌐 Network error - Backend server might not be running on:', getBackendUrl());
      }
      throw error.response?.data?.error || 'Network error occurred';
    }
  );

  return api;
};

// Export functions that use the dynamic API instance
export const login = async (email, password) => {
  try {
    const api = createApiInstance();
    console.log('🔐 Attempting login for:', email);
    const response = await api.post('/auth/login', { email, password });
    console.log('✅ Login successful, token received:', !!response.data.token);
    return response.data;
  } catch (error) {
    console.error('❌ Login failed:', error);
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.error || 'Login failed';
      console.error('   Status:', error.response.status);
      console.error('   Error:', errorMessage);
      throw new Error(errorMessage);
    } else if (error.request) {
      // Network error
      console.error('   Network error:', error.message);
      throw new Error('Network error - please check your connection');
    } else {
      // Other error
      console.error('   Other error:', error.message);
      throw new Error('Login failed - please try again');
    }
  }
};

export const signup = async (name, email, password) => {
  try {
    const api = createApiInstance();
    const response = await api.post('/auth/signup', { name, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to signup. Please try again.';
  }
};

export const getCurrentUser = async () => {
  try {
    const api = createApiInstance();
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to get user data.';
  }
};

// Backward compatibility exports
export const post = async (url, data) => {
  const api = createApiInstance();
  const response = await api.post(url, data);
  return response.data;
};

export const get = async (url) => {
  const api = createApiInstance();
  const response = await api.get(url);
  return response.data;
};

// Default export for backward compatibility
const api = createApiInstance();
export default api; 