import axios from 'axios';

// Function to get the current backend URL
const getBackendUrl = () => {
  try {
    // If running on IP address, use the same IP for backend
    if (typeof window !== 'undefined' && window.location.hostname) {
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:5002`;
      }
    }
  } catch (error) {
    console.log('Could not determine hostname, using default');
  }
  
  // Default to localhost:5002 since that's where the server is running
  return 'http://localhost:5002';
};

const api = axios.create({
  baseURL: `${getBackendUrl()}/api`,
});

export default api;
