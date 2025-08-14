const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const userController = require('../controllers/user');

// ------------------------
// Validation Middleware
// ------------------------
const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const updateUserValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// ------------------------
// Validation Result Handler
// ------------------------
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

// ------------------------
// Apply Auth Middleware
// ------------------------
router.use(authMiddleware);

// ------------------------
// Current User Routes
// ------------------------
router.get('/me', userController.getUserProfile);
router.put('/me', updateUserValidation, validate, userController.updateUserProfile);
router.delete('/me', userController.deleteUserAccount);

// ------------------------
// General User Routes (No Admin Required)
// ------------------------
router.get('/', userController.getAllUsers);
router.post('/', createUserValidation, validate, userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', updateUserValidation, validate, userController.updateUserById);
router.delete('/:id', userController.deleteUserById);

module.exports = router;
