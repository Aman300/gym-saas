const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['rent', 'utilities', 'salaries', 'maintenance', 'marketing', 'other'],
    default: 'other',
  },
  amount: {
    type: Number,
    required: [true, 'Expense amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  expenseDate: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model('Expense', ExpenseSchema);
