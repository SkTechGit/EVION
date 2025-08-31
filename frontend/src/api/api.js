import axios from "axios";

const getBackendUrl = () => {
  const frontendHostname = window.location.hostname;
  const frontendProtocol = window.location.protocol;
  console.log("🌐 Current hostname:", frontendHostname);
  console.log("🌐 Current protocol:", frontendProtocol);

  // Use REACT_APP_API_URL only if set and not pointing to frontend's hostname/port
  if (
    process.env.REACT_APP_API_URL &&
    !process.env.REACT_APP_API_URL.includes(frontendHostname)
  ) {
    console.log("🔗 Using backend URL from ENV:", process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }

  // fallback only for local development
  console.log("🔗 Using fallback local backend URL: http://localhost:5002/api");
  return "http://localhost:5002/api";
};

const baseURL = getBackendUrl();
console.log("🔗 Creating API instance with baseURL:", baseURL);

const api = axios.create({
  baseURL,
});

export default api;
