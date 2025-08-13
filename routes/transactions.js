const express = require('express'); 
const router = express.Router();
const { body, validationResult } = require('express-validator');
const transactionController = require('../controllers/transactions');
const auth = require('../middleware/auth');  

// Protect all routes
router.use(auth);

// Validation middleware for transactions
const validateTransaction = [
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Amount must be a number'),
  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type must be either "income" or "expense"'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid ID'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// Routes

// Create a transaction
router.post('/', validateTransaction, transactionController.createTransaction);

// Get all transactions for the logged-in user
router.get('/', transactionController.getTransactions);

// Get a single transaction by ID
router.get('/:id', transactionController.getTransactionById);

// Update a transaction by ID
router.put('/:id', validateTransaction, transactionController.updateTransaction);

// Delete a transaction by ID
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
