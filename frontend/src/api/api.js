import axios from "axios";

// ✅ Backend URL on Render
const BACKEND_URL = "https://evion.onrender.com";

console.log("🔗 Using backend URL:", BACKEND_URL);

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Example login function
export const login = async (email, password) => {
  try {
    console.log("🔐 Attempting login for:", email);
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("❌ API Error:", error.response.data);
      throw new Error(error.response.data.error || "Login failed");
    } else if (error.request) {
      console.error("🌐 Network error - Backend might be down:", BACKEND_URL);
      throw new Error("Network error occurred");
    } else {
      console.error("⚠️ Other error:", error.message);
      throw new Error("Login failed - please try again");
    }
  }
};
