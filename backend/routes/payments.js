const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Member = require('../models/Member');
const Plan = require('../models/Plan');
const { protect } = require('../middleware/auth');

// Apply protection
router.use(protect);

// @route   POST /api/payments
// @desc    Record a new payment for a member
// @access  Private
router.post('/', async (req, res) => {
  const { memberId, planId, amount, paymentMethod, notes } = req.body;

  try {
    if (!memberId || !planId || amount === undefined || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (memberId, planId, amount, paymentMethod)' });
    }

    // Verify member exists
    const member = await Member.findOne({ _id: memberId, tenantId: req.tenantId });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Verify plan exists
    const plan = await Plan.findOne({ _id: planId, tenantId: req.tenantId });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Membership plan not found' });
    }

    // Create payment record
    const payment = await Payment.create({
      tenantId: req.tenantId,
      memberId,
      planId,
      amount,
      paymentMethod,
      notes,
    });

    // Mark member membershipStatus as 'paid'
    member.membershipStatus = 'paid';
    await member.save();

    const populated = await Payment.findById(payment._id)
      .populate('memberId', 'name memberCode email phone')
      .populate('planId', 'name price');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error recording payment' });
  }
});

// @route   GET /api/payments
// @desc    Get all payment transactions
// @access  Private
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find({ tenantId: req.tenantId })
      .populate('memberId', 'name memberCode email phone')
      .populate('planId', 'name price')
      .sort({ paymentDate: -1 });

    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching payments' });
  }
});

module.exports = router;
