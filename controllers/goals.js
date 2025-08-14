const { body, validationResult } = require('express-validator');
const Goal = require('../models/goal');

// ------------------------
// VALIDATION MIDDLEWARE
// ------------------------
exports.validateGoal = [
  body('targetAmount').notEmpty().withMessage('Target amount is required'),
  body('deadline').notEmpty().withMessage('Deadline is required'),
];

// ------------------------
// CREATE A NEW GOAL
// ------------------------
exports.createGoal = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { targetAmount, currentProgress, deadline } = req.body;
    const user = req.user.userId;

    const goal = new Goal({
      user,
      targetAmount,
      currentProgress: currentProgress || 0,
      deadline,
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    console.error('Create Goal Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// GET ALL GOALS FOR USER
// ------------------------
exports.getGoals = async (req, res) => {
  try {
    const user = req.user.userId;
    const goals = await Goal.find({ user });
    res.json(goals);
  } catch (err) {
    console.error('Get Goals Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// GET GOAL BY ID
// ------------------------
exports.getGoalById = async (req, res) => {
  try {
    const user = req.user.userId;
    const goal = await Goal.findOne({ _id: req.params.id, user });

    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    res.json(goal);
  } catch (err) {
    console.error('Get Goal By ID Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// UPDATE GOAL
// ------------------------
exports.updateGoal = async (req, res) => {
  try {
    const user = req.user.userId;
    const updates = {};
    const { targetAmount, currentProgress, deadline } = req.body;

    if (targetAmount !== undefined) updates.targetAmount = targetAmount;
    if (currentProgress !== undefined) updates.currentProgress = currentProgress;
    if (deadline !== undefined) updates.deadline = deadline;

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: 'At least one field is required to update' });

    const goal = await Goal.findOneAndUpdate({ _id: req.params.id, user }, updates, { new: true });

    if (!goal) return res.status(404).json({ message: 'Goal not found or not authorized' });

    res.json(goal);
  } catch (err) {
    console.error('Update Goal Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// DELETE GOAL
// ------------------------
exports.deleteGoal = async (req, res) => {
  try {
    const user = req.user.userId;
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user });

    if (!goal) return res.status(404).json({ message: 'Goal not found or not authorized' });

    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    console.error('Delete Goal Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
