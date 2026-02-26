// /server/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // 1. Check if the authorization header exists and is formatted correctly
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Extract the token from the header (Format: "Bearer eyJhbGci...")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token using our secret key
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'fallback_super_secret_key_for_dev'
      );

      // 4. Attach the decoded user information to the request object.
      // Remember in authRoutes.js we signed the token with { userId: user._id, username: ... }
      req.user = {
        userId: decoded.userId,
        username: decoded.username
      };

      // 5. Pass control to the next middleware or route handler
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed or expired.' });
    }
  }

  // If no token was found in the headers at all
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
};

module.exports = { protect };