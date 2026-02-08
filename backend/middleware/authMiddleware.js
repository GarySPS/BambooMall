//middleware>authMiddleware.js

const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // 2. Check if token exists
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  // 3. Verify token
  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret_key';
    const decoded = jwt.verify(token, secret);
    
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};