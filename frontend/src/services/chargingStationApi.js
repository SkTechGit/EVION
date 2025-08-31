import axios from 'axios';

// Function to get the current backend URL
const getBackendUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // If running on IP address (not localhost), use the same IP for backend
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}:5002`;
    }
  }
  
  // Default to localhost:5002 since that's where the server is running
  return 'http://localhost:5002';
};

// Create axios instance with current backend URL
const createApiInstance = () => {
  const baseURL = `${getBackendUrl()}/api`;
  console.log('🔗 Creating ChargingStation API instance with baseURL:', baseURL);
  
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Automatically attach token to every request
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Global error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('❌ API Error:', error.response?.data || error.message);
      if (error.code === 'ERR_NETWORK') {
        console.error('🌐 Network error - Backend server might not be running on:', getBackendUrl());
      }
      return Promise.reject(error.response?.data?.error || 'Network error occurred');
    }
  );

  return api;
};

// --- API Functions ---

export const getAllStations = async (filters = {}) => {
  const api = createApiInstance();
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/charging-stations${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStationById = async (id) => {
  const api = createApiInstance();
  try {
    const response = await api.get(`/charging-stations/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createStation = async (stationData) => {
  const api = createApiInstance();
  try {
    const response = await api.post('/charging-stations', stationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStation = async (id, stationData) => {
  const api = createApiInstance();
  try {
    const response = await api.put(`/charging-stations/${id}`, stationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteStation = async (id) => {
  const api = createApiInstance();
  try {
    const response = await api.delete(`/charging-stations/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
