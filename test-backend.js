// Test script to check backend connectivity
const axios = require('axios');

const testBackend = async () => {
  const urls = [
    'http://localhost:5000',
    'http://192.168.181.1:5000',
    'http://127.0.0.1:5000'
  ];

  for (const url of urls) {
    try {
      console.log(`🔍 Testing ${url}...`);
      const response = await axios.get(`${url}/api/auth/me`, { timeout: 5000 });
      console.log(`✅ Success! Backend is running on ${url}`);
      console.log(`   Status: ${response.status}`);
      return url;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ Connection refused on ${url}`);
      } else if (error.code === 'ENOTFOUND') {
        console.log(`❌ Host not found on ${url}`);
      } else {
        console.log(`⚠️  Error testing ${url}: ${error.message}`);
      }
    }
  }
  
  console.log('❌ Backend server is not accessible on any tested URL');
  console.log('💡 Make sure the backend server is running with: cd backend && npm start');
  return null;
};

testBackend();
