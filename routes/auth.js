const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/auth');

const JWT_SECRET = process.env.JWT_SECRET;

// ------------------------
// Validation middleware
// ------------------------
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Middleware to handle validation errors
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

// ------------------------
// JWT helpers & middleware
// ------------------------
function generateJwt(user) {
  return jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
}

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

// ------------------------
// Routes
// ------------------------

// Register
router.post('/register', registerValidation, validate, authController.register);

// Login
router.post('/login', loginValidation, validate, async (req, res, next) => {
  try {
    // Use existing login controller
    await authController.login(req, res);
    // login controller should return token
  } catch (err) {
    next(err);
  }
});

// Get current user
router.get('/me', authenticateJwt, authController.getUserProfile);

// Update user
router.put('/me', authenticateJwt, updateValidation, validate, authController.updateUserProfile);

// Delete user
router.delete('/me', authenticateJwt, authController.deleteUserAccount);

// ------------------------
// Passport Google OAuth
// ------------------------

// Redirect to Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/google/failure' }),
  (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Google authentication failed' });

      // Normalize user object
      const user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      };

      const token = generateJwt(req.user);
      res.json({ token, user });
    } catch (err) {
      console.error('Google OAuth callback error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// OAuth failure
router.get('/google/failure', (req, res) => {
  res.status(401).json({ message: 'Google authentication failed' });
});

// TokenId-based Google login
router.post('/google', authController.googleAuth);

module.exports = router;
