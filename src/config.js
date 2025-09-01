// config.js

export const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000" // or your local backend port
    : "https://evion.onrender.com"; // replace with your Render backend URL