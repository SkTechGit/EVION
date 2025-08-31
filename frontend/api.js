const axios = require('axios');

const BACKEND_URL = 'https://evion.onrender.com';

console.log(`🔗 Using backend URL: ${BACKEND_URL}`);

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

// ...existing code...

module.exports = api;