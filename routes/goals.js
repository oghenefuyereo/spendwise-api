const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goals');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', goalController.createGoal);
router.get('/', goalController.getGoals);
router.get('/:id', goalController.getGoalById);
router.put('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);

module.exports = router;
