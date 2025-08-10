const Transaction = require('../models/transaction');

// Create new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;
    const user = req.user.userId;

    const transaction = new Transaction({
      user,
      amount,
      type,
      category,
      description,
      date: date || new Date()
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all transactions for logged-in user
exports.getTransactions = async (req, res) => {
  try {
    const user = req.user.userId;
    const transactions = await Transaction.find({ user }).populate('category');
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get transaction by ID (only if belongs to user)
exports.getTransactionById = async (req, res) => {
  try {
    const user = req.user.userId;
    const transaction = await Transaction.findOne({ _id: req.params.id, user }).populate('category');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update transaction by ID
exports.updateTransaction = async (req, res) => {
  try {
    const user = req.user.userId;
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user },
      req.body,
      { new: true }
    );
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete transaction by ID
exports.deleteTransaction = async (req, res) => {
  try {
    const user = req.user.userId;
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
