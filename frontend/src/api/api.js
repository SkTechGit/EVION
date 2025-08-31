import axios from 'axios';

// Function to get the current backend URL
const getBackendUrl = () => {
  try {
    if (typeof window !== 'undefined' && window.location.hostname) {
      const hostname = window.location.hostname;

      // 👉 If running locally, use localhost backend
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5002';
      }

      // 👉 Otherwise, use deployed backend (Render)
      return 'https://evion.onrender.com';
    }
  } catch (error) {
    console.log('Could not determine hostname, using default');
  }
  
  // Fallback (local dev)
  return 'http://localhost:5002';
};

const api = axios.create({
  baseURL: `${getBackendUrl()}/api`,
});

export default api;
