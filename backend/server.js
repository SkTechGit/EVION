require('dotenv').config(); // <-- MUST be first
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const chargingStationRoutes = require('./routes/chargingStations');

// ✅ Load environment variables
dotenv.config();

// ✅ Initialize express app
const app = express();

// ✅ Log when the server file is loaded
console.log('✅ Server Started Successfully');

// ✅ Allowed Origins (Frontend URLs)
const allowedOrigins = [
  "https://evion-frontend-aml7.onrender.com", // deployed frontend
  "http://localhost:3000",                   // local dev
  "http://127.0.0.1:3000",                   // alt localhost
  "http://192.168.181.1:3000"                // LAN mobile testing
];

// ✅ Enable CORS dynamically
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman, curl, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ✅ Enable JSON parsing for incoming requests
app.use(express.json());

// ✅ Test middleware for logging incoming requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  console.log('🔎 req.body:', req.body);
  next();
});

// ✅ MongoDB Connection
const MONGO_URI = "mongodb+srv://sk0001:MCEZruaPKQCBiolB@cluster0.zo11rho.mongodb.net/ev_finder?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/charging-stations', chargingStationRoutes);

// ✅ Health Check Route (for Render debugging)
app.get('/api/test', (req, res) => {
  res.json({ message: "✅ Backend is running fine!" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT} and listening on all interfaces`);
});

module.exports = app;
