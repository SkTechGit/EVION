// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!JWT_SECRET) {
  if (NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET is not set. Set it in environment variables before starting the server.');
  } else {
    console.warn('WARNING: JWT_SECRET is not set. Using dev-secret; do NOT use in production.');
  }
}

const DEFAULT_JWT_EXPIRES = '1h';

function signToken(user) {
  const payload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || 'user' // fallback ensures role present in token
  };
  return jwt.sign(payload, JWT_SECRET || 'dev-secret', { expiresIn: DEFAULT_JWT_EXPIRES });
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email));
}

// POST /auth/signup
router.post('/signup', async (req, res) => {
  try {
    let { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });

    email = String(email).trim().toLowerCase();
    name = String(name).trim();
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format.' });
    if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // dev convenience: admin email
    let role = 'user';
    if (email === 'admin@gmail.com') role = 'admin';

    const newUser = new User({ name, email, password, role });
    await newUser.save();

    console.log('DEBUG signup role:', newUser.role);
    const token = signToken(newUser);
    return res.status(201).json({ token, user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    email = String(email).trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // ensure role exists for legacy user
    if (!user.role) {
      user.role = 'user';
      await user.save();
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    console.log('DEBUG login role:', user.role);
    const token = signToken(user);
    return res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
