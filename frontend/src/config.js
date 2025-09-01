// src/config.js

// Use environment variable if available, otherwise fallback
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5002"
    : "https://evion.onrender.com");

console.log("🌐 API_BASE_URL ->", API_BASE_URL);
