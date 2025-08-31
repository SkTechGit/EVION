const axios = require('axios');

// Determine backend URL based on environment
const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    // Running in the browser
    if (window.location.hostname === 'localhost') {
      // Local development
      return 'http://localhost:5002';
    } else {
      // Production on Render
      return 'https://evion.onrender.com';
    }
  }
  // Default fallback
  return 'http://localhost:5002';
};

const BACKEND_URL = getBackendUrl();

console.log(`🔗 Using backend URL: ${BACKEND_URL}`);

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  // Optional: timeout and headers
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

module.exports = api;
