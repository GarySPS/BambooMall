//middleware>adminMiddleware.js

const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Extract Token
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
     return res.status(401).json({ error: 'Token empty' });
  }

  // 2. Verify Token
  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret_key';
    const decoded = jwt.verify(token, secret);
    
    // --- SECURITY CHECK (UPDATED) ---
    // Your token structure is: { user: { is_admin: true }, ... }
    
    // Check if 'user' object exists AND 'is_admin' is explicitly true
    if (!decoded.user || decoded.user.is_admin !== true) {
       console.log("❌ BLOCKED: User is not admin");
       return res.status(403).json({ error: 'Access Denied: Admins only' });
    }

    // Success!
    req.user = decoded; 
    next();
  } catch (err) {
    console.error("Token Error:", err.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};