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
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.userId = payload.userId;
    next();
  });
}

// JWT generation helper (can also move to authController)
function generateJwt(user) {
  return jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
}

// Register a new user with validation
router.post('/register', registerValidation, validate, authController.register);

// Login user with validation
router.post('/login', loginValidation, validate, authController.login);

// Get current logged-in user's profile (protected)
router.get('/me', authenticateJwt, authController.getUserProfile);

// Update current logged-in user's profile (protected)
router.put('/me', authenticateJwt, updateValidation, validate, authController.updateUserProfile);

// Delete current logged-in user's account (protected)
router.delete('/me', authenticateJwt, authController.deleteUserAccount);

// Passport Google OAuth routes

// Step 1: Redirect user to Google for authentication
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Step 2: Google redirects here after user consents
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/google/failure' }),
  (req, res) => {
    // Successful authentication
    const token = generateJwt(req.user);
    res.json({ token, user: req.user });
  }
);

// Failure redirect or response for Google OAuth
router.get('/google/failure', (req, res) => {
  res.status(401).json({ message: 'Google authentication failed' });
});

// Optional: keep your existing POST /google if you want tokenId based Google auth from client
router.post('/google', authController.googleAuth);

module.exports = router;
