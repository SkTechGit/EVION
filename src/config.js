// config.js

const host = window.location.hostname;
export const API_BASE_URL =
  (process.env.REACT_APP_API_BASE_URL && process.env.REACT_APP_API_BASE_URL !== '')
    ? process.env.REACT_APP_API_BASE_URL
    : (host === 'localhost' || host === '127.0.0.1'
        ? 'http://localhost:5002'
        : 'https://evion.onrender.com');
console.log('API_BASE_URL ->', API_BASE_URL);