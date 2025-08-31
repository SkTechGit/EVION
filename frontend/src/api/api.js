import axios from "axios";

// Decide backend URL based on environment
const getBackendUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Default to local backend in dev
  return "http://localhost:5002/api";
};

const api = axios.create({
  baseURL: getBackendUrl(),
});

export default api;
