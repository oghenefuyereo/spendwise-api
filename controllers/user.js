const User = require('../models/user');
const bcrypt = require('bcrypt');

// Get current user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -googleId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Get User Profile Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update current user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.password, salt);
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password -googleId');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Update User Profile Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete current user account
exports.deleteUserAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Delete User Account Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -googleId');
    res.json(users);
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: 'User created' });
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -googleId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Get User By ID Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user by ID
exports.updateUserById = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.password, salt);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password -googleId');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Update User By ID Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete user by ID
exports.deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User By ID Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
