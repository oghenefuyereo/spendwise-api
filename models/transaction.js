const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'category', required: true },
  description: { type: String, trim: true, default: '' },
  date: { type: Date, default: Date.now }
});

// Export the model with lowercase collection name for consistency
module.exports = mongoose.model('transaction', transactionSchema);
