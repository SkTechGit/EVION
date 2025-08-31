import axios from "axios";

const getBackendUrl = () => {
  const frontendHostname = window.location.hostname;
  const frontendProtocol = window.location.protocol;
  console.log("🌐 Current hostname:", frontendHostname);
  console.log("🌐 Current protocol:", frontendProtocol);

  if (process.env.REACT_APP_API_URL) {
    let backendUrl = process.env.REACT_APP_API_URL;
    if (!backendUrl.endsWith("/api")) {
      backendUrl = backendUrl.replace(/\/$/, "") + "/api";
    }
    if (backendUrl.includes(frontendHostname)) {
      console.warn(
        "⚠️ Backend URL matches frontend hostname. This may be expected in production, but ensure backend is running on correct port."
      );
    }
    console.log("🔗 Using backend URL from ENV:", backendUrl);
    return backendUrl;
  }

  // Use Render backend as default fallback
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
