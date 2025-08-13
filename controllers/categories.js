const { body, validationResult } = require('express-validator');
const Category = require('../models/category');

// ------------------------
// VALIDATION MIDDLEWARE
// ------------------------
exports.validateCategory = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('type').trim().notEmpty().withMessage('Type is required'),
];

// ------------------------
// CREATE CATEGORY
// ------------------------
exports.createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, type } = req.body;
    const user = req.user.userId;

    const category = new Category({ name, type, user });
    await category.save();

    res.status(201).json(category);
  } catch (err) {
    console.error('Create Category Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// GET ALL CATEGORIES
// ------------------------
exports.getCategories = async (req, res) => {
  try {
    const user = req.user.userId;
    const categories = await Category.find({ $or: [{ user: null }, { user }] });
    res.json(categories);
  } catch (err) {
    console.error('Get Categories Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// GET CATEGORY BY ID
// ------------------------
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
    console.error('Get Category By ID Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// UPDATE CATEGORY
// ------------------------
exports.updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty() && Object.keys(req.body).length > 0)
    return res.status(400).json({ errors: errors.array() });

  try {
    const user = req.user.userId;
    const updates = {};
    const { name, type } = req.body;

    if (name) updates.name = name;
    if (type) updates.type = type;

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: 'At least one field (name or type) is required to update' });

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user },
      updates,
      { new: true }
    );

    if (!category) return res.status(404).json({ message: 'Category not found or not authorized' });

    res.json(category);
  } catch (err) {
    console.error('Update Category Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------
// DELETE CATEGORY
// ------------------------
exports.deleteCategory = async (req, res) => {
  try {
    const user = req.user.userId;
    const category = await Category.findOneAndDelete({ _id: req.params.id, user });

    if (!category) return res.status(404).json({ message: 'Category not found or not authorized' });

    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Delete Category Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
