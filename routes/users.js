const express = require('express');
const router = express.Router();

// Middleware to verify JWT or OAuth token and authenticate the user
const authMiddleware = require('../middleware/auth');

// Controller methods for user operations
const userController = require('../controllers/user');

// Protect all routes below with authentication middleware
router.use(authMiddleware);

// Routes for current logged-in user profile
router.get('/me', userController.getUserProfile);
router.put('/me', userController.updateUserProfile);
router.delete('/me', userController.deleteUserAccount);

// Admin-like CRUD routes for managing users by ID
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUserById);
router.delete('/:id', userController.deleteUserById);

module.exports = router;
