import axios from "axios";

// Always prefer environment variable
const getBackendUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    console.log("🔗 Using backend URL from ENV:", process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }

  // Default fallback for local development
  return "http://localhost:5002/api";
};

const api = axios.create({
  baseURL: getBackendUrl(),
});

export default api;
