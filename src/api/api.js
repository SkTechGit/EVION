import { API_BASE_URL } from '../config';

console.log("🌐 Current hostname:", window.location.hostname);
console.log("🌐 Current protocol:", window.location.protocol);
console.log("🔗 Using backend URL:", API_BASE_URL);

// Example for login:
export async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    // ...existing code...
  } catch (err) {
    console.error("🌐 Network error - Backend server might not be running on:", API_BASE_URL);
    throw new Error("Login failed - please try again");
  }
}
// ...existing code...