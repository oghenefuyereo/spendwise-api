const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/auth');

const JWT_SECRET = process.env.JWT_SECRET;

// Validation middleware for register
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Validation middleware for login
const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Validation middleware for updating user
const updateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Middleware to check validation results
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// JWT authentication middleware
function authenticateJwt(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ message: 'Invalid or expired token' });
    req.userId = payload.userId;
    next();
  });
}

// Helper to generate JWT token
function generateJwt(user) {
  return jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
}

// Routes

// Register a new user
router.post('/register', registerValidation, validate, authController.register);

// Login user
router.post('/login', loginValidation, validate, authController.login);

// Get logged-in user's profile (JWT protected)
router.get('/me', authenticateJwt, authController.getUserProfile);

// Update logged-in user's profile (JWT protected)
router.put('/me', authenticateJwt, updateValidation, validate, authController.updateUserProfile);

// Delete logged-in user's account (JWT protected)
router.delete('/me', authenticateJwt, authController.deleteUserAccount);

// Passport Google OAuth routes

// Redirect user to Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/google/failure' }),
  (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Google authentication failed' });
      }
      const token = generateJwt(req.user);
      res.json({ token, user: req.user });
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// OAuth failure handler
router.get('/google/failure', (req, res) => {
  res.status(401).json({ message: 'Google authentication failed' });
});

// TokenId-based Google OAuth (client sends id token for verification)
router.post('/google', authController.googleAuth);

module.exports = router;
