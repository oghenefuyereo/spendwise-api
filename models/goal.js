const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  targetamount: { type: Number, required: true },
  currentprogress: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  createdat: { type: Date, default: Date.now }
});

module.exports = mongoose.model('goal', goalSchema);
