const Goal = require('../models/goal');

// ------------------------
// CREATE A NEW GOAL
// ------------------------
exports.createGoal = async (req, res) => {
  try {
    const { targetamount, currentprogress, deadline } = req.body;
    const user = req.user.userId;

    if (!targetamount || !deadline) {
      return res.status(400).json({ message: 'Target amount and deadline are required' });
    }

    const goal = new Goal({
      user,
      targetamount,
      currentprogress: currentprogress || 0,
      deadline
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
    const { targetamount, currentprogress, deadline } = req.body;

    if (!targetamount && !currentprogress && !deadline) {
      return res.status(400).json({ message: 'At least one field is required to update' });
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user },
      { targetamount, currentprogress, deadline },
      { new: true }
    );

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
