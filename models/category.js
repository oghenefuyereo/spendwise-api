const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },  // optional user reference for custom categories
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['income', 'expense'], required: true }
}, {
  timestamps: true // optional, adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('category', categorySchema);
