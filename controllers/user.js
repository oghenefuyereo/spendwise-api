const User = require('../models/user');
const bcrypt = require('bcrypt');

// Middleware helpers (to use in routes)
const requireAuth = (req, res, next) => {
  if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: Admins only' });
  next();
};

// ------------------------
// GET CURRENT USER PROFILE
// ------------------------
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -googleId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Get User Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// UPDATE CURRENT USER PROFILE
// ------------------------
exports.updateUserProfile = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) {
      const existingUser = await User.findOne({ email: req.body.email, _id: { $ne: req.userId } });
      if (existingUser) return res.status(400).json({ message: 'Email already in use' });
      updates.email = req.body.email;
    }
    if (req.body.password) updates.password = await bcrypt.hash(req.body.password, await bcrypt.genSalt(10));

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password -googleId');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Update User Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// DELETE CURRENT USER ACCOUNT
// ------------------------
exports.deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Delete User Account Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// GET ALL USERS (ADMIN ONLY)
// ------------------------
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -googleId');
    res.json(users);
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// CREATE NEW USER (ADMIN)
// ------------------------
exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const user = new User({ name, email, password: hashedPassword });

    await user.save();
    res.status(201).json({ message: 'User created successfully', user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// GET USER BY ID (ADMIN)
// ------------------------
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -googleId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Get User By ID Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// UPDATE USER BY ID (ADMIN)
// ------------------------
exports.updateUserById = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) {
      const existingUser = await User.findOne({ email: req.body.email, _id: { $ne: req.params.id } });
      if (existingUser) return res.status(400).json({ message: 'Email already in use' });
      updates.email = req.body.email;
    }
    if (req.body.password) updates.password = await bcrypt.hash(req.body.password, await bcrypt.genSalt(10));

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password -googleId');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Update User By ID Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// DELETE USER BY ID (ADMIN)
// ------------------------
exports.deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User By ID Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports.requireAuth = requireAuth;
module.exports.requireAdmin = requireAdmin;
