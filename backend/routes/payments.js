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
  const { memberId, planId, amount, paymentMethod, notes, paymentDate } = req.body;

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

    // Calculate new start/end dates for the member
    const now = new Date();
    let startDate = paymentDate ? new Date(paymentDate) : now;
    
    // If member has a future expiry, extend it
    if (member.membershipEnd && new Date(member.membershipEnd) > now) {
      startDate = new Date(member.membershipEnd);
    }
    
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    // Create payment record
    const payment = await Payment.create({
      tenantId: req.tenantId,
      memberId,
      planId,
      amount,
      paymentMethod,
      paymentDate: paymentDate ? new Date(paymentDate) : now,
      notes,
    });

    // Update member plan details and membership status
    member.planId = planId;
    member.membershipStart = startDate;
    member.membershipEnd = endDate;
    member.membershipStatus = 'paid';
    member.status = 'active';
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
  const { memberId } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  try {
    const query = { tenantId: req.tenantId };
    if (memberId) {
      query.memberId = memberId;
    }

    const total = await Payment.countDocuments(query);

    // Aggregate total revenue for this tenant
    const revenueAggregation = await Payment.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

    const payments = await Payment.find(query)
      .populate('memberId', 'name memberCode email phone')
      .populate('planId', 'name price')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      totalRevenue,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      },
      data: payments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching payments' });
  }
});

module.exports = router;
