const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  targetAmount: { type: Number, required: true },
  currentProgress: { type: Number, default: 0 },
  deadline: { type: Date, required: true }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } // automatic createdAt and updatedAt
});

module.exports = mongoose.model('goal', goalSchema);
