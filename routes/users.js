const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const userController = require('../controllers/user'); // Make sure this path is correct

// Debug: log exported functions from controller
console.log('userController keys:', Object.keys(userController));

router.use(authMiddleware);

router.get('/me', userController.getUserProfile);
router.put('/me', userController.updateUserProfile);
router.delete('/me', userController.deleteUserAccount);

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUserById);
router.delete('/:id', userController.deleteUserById);

module.exports = router;
