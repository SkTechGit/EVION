import axios from "axios";

const getBackendUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    console.log("🔗 Using backend URL from ENV:", process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  return "http://localhost:5002/api"; // fallback for local dev
};

const api = axios.create({
  baseURL: getBackendUrl(),
});

export default api;
