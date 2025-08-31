// Test script to debug login issues
const axios = require('axios');

const testLogin = async () => {
  const baseURL = 'http://localhost:5000'; // Change this to your backend URL if different
  
  try {
    console.log('🔍 Testing login functionality...');
    
    // Test 1: Check if server is running
    console.log('\n1. Testing server connectivity...');
    try {
      const healthCheck = await axios.get(`${baseURL}/api/auth/me`, { timeout: 5000 });
      console.log('✅ Server is running and responding');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server is not running or not accessible');
        console.log('💡 Make sure to start the backend with: cd backend && npm start');
        return;
      } else if (error.response?.status === 401) {
        console.log('✅ Server is running (401 is expected for /me without auth)');
      } else {
        console.log('⚠️  Server responded with:', error.response?.status);
      }
    }
    
    // Test 2: Test login with sample credentials
    console.log('\n2. Testing login with sample credentials...');
    const testCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    try {
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, testCredentials, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      console.log('✅ Login successful!');
      console.log('   Token received:', loginResponse.data.token ? 'Yes' : 'No');
      console.log('   User data:', loginResponse.data.user ? 'Yes' : 'No');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('❌ Login failed: Invalid credentials (expected for test@example.com)');
        console.log('   Error:', error.response.data.error);
      } else {
        console.log('❌ Login failed with error:', error.message);
        if (error.response) {
          console.log('   Status:', error.response.status);
          console.log('   Data:', error.response.data);
        }
      }
    }
    
    // Test 3: Test signup (to create a test user)
    console.log('\n3. Testing signup functionality...');
    const testUser = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123'
    };
    
    try {
      const signupResponse = await axios.post(`${baseURL}/api/auth/signup`, testUser, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      console.log('✅ Signup successful!');
      console.log('   Test user created:', testUser.email);
      
      // Test 4: Test login with the newly created user
      console.log('\n4. Testing login with newly created user...');
      const loginTestResponse = await axios.post(`${baseURL}/api/auth/login`, {
        email: testUser.email,
        password: testUser.password
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      console.log('✅ Login with new user successful!');
      console.log('   Token:', loginTestResponse.data.token ? 'Received' : 'Missing');
      
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.error.includes('already exists')) {
        console.log('ℹ️  Test user already exists, trying to login...');
        
        // Try to login with existing user
        try {
          const loginTestResponse = await axios.post(`${baseURL}/api/auth/login`, {
            email: testUser.email,
            password: testUser.password
          }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
          });
          
          console.log('✅ Login with existing user successful!');
        } catch (loginError) {
          console.log('❌ Login failed:', loginError.response?.data?.error || loginError.message);
        }
      } else {
        console.log('❌ Signup failed:', error.response?.data?.error || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testLogin();
