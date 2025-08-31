const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // or your secret
    req.user = decoded; // decoded must contain _id
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};
