const Goal = require('../models/goal');

// Create a new goal
exports.createGoal = async (req, res) => {
  try {
    const { targetamount, currentprogress, deadline } = req.body;
    const user = req.user.userId;

    const goal = new Goal({
      user,
      targetamount,
      currentprogress: currentprogress || 0,
      deadline
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all goals for user
exports.getGoals = async (req, res) => {
  try {
    const user = req.user.userId;
    const goals = await Goal.find({ user });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get goal by ID
exports.getGoalById = async (req, res) => {
  try {
    const user = req.user.userId;
    const goal = await Goal.findOne({ _id: req.params.id, user });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update goal
exports.updateGoal = async (req, res) => {
  try {
    const user = req.user.userId;
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user },
      req.body,
      { new: true }
    );
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete goal
exports.deleteGoal = async (req, res) => {
  try {
    const user = req.user.userId;
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
