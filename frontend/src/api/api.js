import axios from "axios";

const getBackendUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    let backendUrl = process.env.REACT_APP_API_URL;
    if (!backendUrl.endsWith("/api")) {
      backendUrl = backendUrl.replace(/\/$/, "") + "/api";
    }
    console.log("🔗 Using backend URL from ENV:", backendUrl);
    return backendUrl;
  }

  // Always use Render backend as default fallback
  const renderBackend = "https://evion.onrender.com/api";
  console.log("🔗 Using fallback Render backend URL:", renderBackend);
  return renderBackend;
};

const baseURL = getBackendUrl();
console.log("🔗 Creating API instance with baseURL:", baseURL);

const api = axios.create({
  baseURL,
});

export default api;
