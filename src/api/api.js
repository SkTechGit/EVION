import { API_BASE_URL } from '../config';

console.log("🌐 Current hostname:", window.location.hostname);
console.log("🌐 Current protocol:", window.location.protocol);
console.log("🔗 Using backend URL:", API_BASE_URL);

export async function login(email, password) {
  try {
    console.log('🔐 Attempting login for:', email);
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // important for cookie/session auth
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => null);
      console.error('❌ API Error:', res.status, body);
      throw new Error(`API error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('api.js: ❌', err && err.message ? err.message : err);
    if (/Network Error|Failed to fetch|NetworkError|ECONNREFUSED|timed out/i.test(err && err.message ? err.message : '')) {
      console.error('🌐 Network error - Backend server might not be running or URL is incorrect:', API_BASE_URL);
      throw new Error('Network error occurred');
    }
    throw new Error(err && err.message ? err.message : 'Unknown API error');
  }
}