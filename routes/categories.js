// (implemented by Benjamin Effiong)

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categories');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
