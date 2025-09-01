// config.js

export const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5002" // local backend port
    : "https://evion-backend-aml7.onrender.com"; // deployed backend URL