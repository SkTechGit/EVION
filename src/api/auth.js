import { API_BASE_URL } from '../config';

export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // <-- important for cookies/session
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}