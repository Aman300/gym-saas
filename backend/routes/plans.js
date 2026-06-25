const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const { protect } = require('../middleware/auth');

// Apply protection middleware to all plan routes
router.use(protect);

// @route   GET /api/plans
// @desc    Get all plans for the gym
// @access  Private
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find({ tenantId: req.tenantId });
    res.json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching plans' });
  }
});

// @route   POST /api/plans
// @desc    Create a new membership plan
// @access  Private (Owner/Manager only preferred, we will allow all authenticated staff for simplicity)
router.post('/', async (req, res) => {
  const { name, price, durationMonths, description } = req.body;

  try {
    if (!name || price === undefined || !durationMonths) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const plan = await Plan.create({
      tenantId: req.tenantId,
      name,
      price,
      durationMonths,
      description,
    });

    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error creating plan' });
  }
});

// @route   PUT /api/plans/:id
// @desc    Update a membership plan
// @access  Private
router.put('/:id', async (req, res) => {
  const { name, price, durationMonths, description, isActive } = req.body;

  try {
    let plan = await Plan.findOne({ _id: req.params.id, tenantId: req.tenantId });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Membership plan not found' });
    }

    plan.name = name !== undefined ? name : plan.name;
    plan.price = price !== undefined ? price : plan.price;
    plan.durationMonths = durationMonths !== undefined ? durationMonths : plan.durationMonths;
    plan.description = description !== undefined ? description : plan.description;
    plan.isActive = isActive !== undefined ? isActive : plan.isActive;

    await plan.save();

    res.json({ success: true, data: plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating plan' });
  }
});

// @route   DELETE /api/plans/:id
// @desc    Delete a membership plan
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const plan = await Plan.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Membership plan not found' });
    }

    res.json({ success: true, message: 'Plan removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting plan' });
  }
});

module.exports = router;
