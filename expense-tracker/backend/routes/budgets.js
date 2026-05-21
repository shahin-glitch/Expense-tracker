const express = require('express');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/budgets
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = parseInt(month) || now.getMonth() + 1;
    const y = parseInt(year) || now.getFullYear();

    const budgets = await Budget.find({ user: req.user._id, month: m, year: y });

    // Get spending for each budget category
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const spending = await Expense.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$category', spent: { $sum: '$amount' } } }
    ]);

    const spendingMap = spending.reduce((acc, s) => ({ ...acc, [s._id]: s.spent }), {});

    const budgetsWithSpending = budgets.map(b => ({
      ...b.toObject(),
      spent: spendingMap[b.category] || 0,
      remaining: b.amount - (spendingMap[b.category] || 0)
    }));

    res.json({ success: true, budgets: budgetsWithSpending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/budgets
router.post('/', async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;
    const existing = await Budget.findOne({ user: req.user._id, category, month, year });

    let budget;
    if (existing) {
      budget = await Budget.findByIdAndUpdate(existing._id, { amount }, { new: true });
    } else {
      budget = await Budget.create({ user: req.user._id, category, amount, month, year });
    }
    res.status(201).json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
