const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactions');
const auth = require('../middleware/auth');  // renamed to 'auth' for clarity

// Protect all routes below
router.use(auth);

// Create a transaction
router.post('/', transactionController.createTransaction);

// Get all transactions for user
router.get('/', transactionController.getTransactions);

// Get single transaction by ID
router.get('/:id', transactionController.getTransactionById);

// Update transaction by ID
router.put('/:id', transactionController.updateTransaction);

// Delete transaction by ID
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
