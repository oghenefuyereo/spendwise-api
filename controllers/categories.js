const Category = require('../models/category');

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    const user = req.user.userId; // optional if user-defined categories

    const category = new Category({ name, type, user });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all categories for user
exports.getCategories = async (req, res) => {
  try {
    const user = req.user.userId;
    // Return categories where user is null (default) or belongs to user
    const categories = await Category.find({
      $or: [{ user: null }, { user }]
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const user = req.user.userId;
    const category = await Category.findOne({
      _id: req.params.id,
      $or: [{ user: null }, { user }]
    });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const user = req.user.userId;
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user },
      req.body,
      { new: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found or not authorized' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const user = req.user.userId;
    const category = await Category.findOneAndDelete({ _id: req.params.id, user });
    if (!category) return res.status(404).json({ message: 'Category not found or not authorized' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
