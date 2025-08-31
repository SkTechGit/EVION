import axios from "axios";

const getBackendUrl = () => {
  // Ignore REACT_APP_API_URL and always use Render backend
  const renderBackend = "https://evion.onrender.com/api";
  console.log("🔗 Using Render backend URL:", renderBackend);
  return renderBackend;
};

const baseURL = getBackendUrl();
console.log("🔗 Creating API instance with baseURL:", baseURL);

const api = axios.create({
  baseURL,
});

export default api;
