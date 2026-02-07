// middleware/adminMiddleware.js

module.exports = function (req, res, next) {
  // 1. Check if authMiddleware found a user
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2. Check the "Badge" for Admin status
  if (req.user.is_admin === true) {
    next(); // Pass! Enter the Vault.
  } else {
    // Stop! Regular users get blocked here.
    return res.status(403).json({ error: 'Access Denied: Admins Only.' });
  }
};