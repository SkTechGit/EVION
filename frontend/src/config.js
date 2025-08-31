// Function to get the backend URL based on current environment

const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5002',
};

export default config;