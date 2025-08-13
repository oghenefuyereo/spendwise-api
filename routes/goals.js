const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const goalController = require('../controllers/goals');
const authMiddleware = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Validation middleware
const validateGoal = [
  body('targetAmount')
    .optional()
    .isNumeric()
    .withMessage('Target amount must be a number'),
  body('currentProgress')
    .optional()
    .isNumeric()
    .withMessage('Current progress must be a number'),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// Routes

// Create a new goal
router.post('/', validateGoal, goalController.createGoal);

// Get all goals for the logged-in user
router.get('/', goalController.getGoals);

// Get a goal by ID
router.get('/:id', goalController.getGoalById);

// Update a goal by ID
router.put('/:id', validateGoal, goalController.updateGoal);

// Delete a goal by ID
router.delete('/:id', goalController.deleteGoal);

module.exports = router;
