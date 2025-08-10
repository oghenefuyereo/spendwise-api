const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },  // user-defined categories optional
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['income', 'expense'], required: true }
});

module.exports = mongoose.model('category', categorySchema);
