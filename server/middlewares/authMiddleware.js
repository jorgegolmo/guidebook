// server/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // Normalize and extract token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }

  // Fail fast on missing secret to avoid silent insecure fallback
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET environment variable is not set.');
    return res.status(500).json({ message: 'Server misconfiguration: authentication not available.' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    // Keep the same shape used by routes: req.user.userId
    req.user = {
      userId: decoded.userId,
      username: decoded.username
    };
    return next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed or expired.' });
  }
};

module.exports = { protect };