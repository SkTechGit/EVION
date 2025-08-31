const getApiUrl = () => {
  let url = process.env.REACT_APP_API_URL || "https://evion.onrender.com/api";
  if (!url.endsWith("/api")) {
    url = url.replace(/\/$/, "") + "/api";
  }
  return url;
};

const config = {
  apiUrl: getApiUrl(),
};

export default config;
