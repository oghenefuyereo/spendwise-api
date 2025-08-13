const { body, validationResult } = require('express-validator');
const Transaction = require('../models/transaction');

// ------------------------
// VALIDATION MIDDLEWARE
// ------------------------
exports.validateTransaction = [
  body('amount').notEmpty().withMessage('Amount is required'),
  body('type').notEmpty().withMessage('Type is required'),
  body('category').notEmpty().withMessage('Category is required'),
];

// ------------------------
// CREATE NEW TRANSACTION
// ------------------------
exports.createTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { amount, type, category, description, date } = req.body;
    const user = req.user.userId;

    const transaction = new Transaction({
      user,
      amount,
      type,
      category,
      description: description || '',
      date: date || new Date(),
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    console.error('Create Transaction Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// GET ALL TRANSACTIONS FOR USER
// ------------------------
exports.getTransactions = async (req, res) => {
  try {
    const user = req.user.userId;
    const transactions = await Transaction.find({ user }).populate('category');
    res.json(transactions);
  } catch (err) {
    console.error('Get Transactions Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// GET TRANSACTION BY ID
// ------------------------
exports.getTransactionById = async (req, res) => {
  try {
    const user = req.user.userId;
    const transaction = await Transaction.findOne({ _id: req.params.id, user }).populate('category');

    if (!transaction) return res.status(404).json({ message: 'Transaction not found or not authorized' });

    res.json(transaction);
  } catch (err) {
    console.error('Get Transaction By ID Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// UPDATE TRANSACTION
// ------------------------
exports.updateTransaction = async (req, res) => {
  try {
    const user = req.user.userId;
    const updates = {};
    const { amount, type, category, description, date } = req.body;

    if (amount !== undefined) updates.amount = amount;
    if (type !== undefined) updates.type = type;
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (date !== undefined) updates.date = date;

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: 'At least one field is required to update' });

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user },
      updates,
      { new: true }
    ).populate('category');

    if (!transaction) return res.status(404).json({ message: 'Transaction not found or not authorized' });

    res.json(transaction);
  } catch (err) {
    console.error('Update Transaction Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// DELETE TRANSACTION
// ------------------------
exports.deleteTransaction = async (req, res) => {
  try {
    const user = req.user.userId;
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user });

    if (!transaction) return res.status(404).json({ message: 'Transaction not found or not authorized' });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Delete Transaction Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
