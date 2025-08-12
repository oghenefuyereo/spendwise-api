const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  // Check if authorization header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  // Extract the token from the header
  const token = authHeader.split(' ')[1];

  try {
    // Verify token and decode payload
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info to request for downstream handlers
    req.user = { userId: decoded.userId };

    next();
  } catch (err) {
    // Token is invalid or expired
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
