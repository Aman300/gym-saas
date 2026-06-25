const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Plan price is required'],
    min: [0, 'Price cannot be negative'],
  },
  durationMonths: {
    type: Number,
    required: [true, 'Plan duration in months is required'],
    min: [1, 'Duration must be at least 1 month'],
  },
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Plan', PlanSchema);
