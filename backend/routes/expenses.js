const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

// Apply protection
router.use(protect);

// @route   GET /api/expenses
// @desc    Get all expenses
// @access  Private
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find({ tenantId: req.tenantId }).sort({ expenseDate: -1 });
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching expenses' });
  }
});

// @route   POST /api/expenses
// @desc    Add a new expense
// @access  Private
router.post('/', async (req, res) => {
  const { title, category, amount, expenseDate, description } = req.body;

  try {
    if (!title || amount === undefined || !category) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (title, category, amount)' });
    }

    const expense = await Expense.create({
      tenantId: req.tenantId,
      title,
      category,
      amount,
      expenseDate: expenseDate || new Date(),
      description,
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error creating expense' });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update an expense
// @access  Private
router.put('/:id', async (req, res) => {
  const { title, category, amount, expenseDate, description } = req.body;

  try {
    let expense = await Expense.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    expense.title = title !== undefined ? title : expense.title;
    expense.category = category !== undefined ? category : expense.category;
    expense.amount = amount !== undefined ? amount : expense.amount;
    expense.expenseDate = expenseDate !== undefined ? new Date(expenseDate) : expense.expenseDate;
    expense.description = description !== undefined ? description : expense.description;

    await expense.save();
    res.json({ success: true, data: expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating expense' });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, message: 'Expense removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting expense' });
  }
});

module.exports = router;
