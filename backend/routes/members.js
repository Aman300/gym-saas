const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Plan = require('../models/Plan');
const { protect } = require('../middleware/auth');

// Apply protection middleware to all member routes
router.use(protect);

// Helper function to generate unique member code
const generateMemberCode = async (tenantId) => {
  let isUnique = false;
  let code = '';
  while (!isUnique) {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digit code
    code = `GYM-${randomNum}`;
    const existing = await Member.findOne({ tenantId, memberCode: code });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
};

// @route   GET /api/members
// @desc    Get all members for the gym with filters
// @access  Private
router.get('/', async (req, res) => {
  const { status, search, membershipStatus } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  let query = { tenantId: req.tenantId };

  if (status) {
    if (status === 'expired') {
      query.membershipEnd = { $lt: new Date() };
    } else {
      query.status = status;
    }
  }
  if (membershipStatus) {
    query.membershipStatus = membershipStatus;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { memberCode: { $regex: search, $options: 'i' } },
    ];
  }

  try {
    const total = await Member.countDocuments(query);
    const members = await Member.find(query)
      .populate('planId', 'name price')
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      },
      data: members
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching members' });
  }
});

// @route   POST /api/members
// @desc    Create a new gym member
// @access  Private
router.post('/', async (req, res) => {
  const { name, email, phone, gender, dob, planId, membershipStart, status, membershipStatus, emergencyContact } = req.body;

  try {
    if (!name || !phone || !planId) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (name, phone, planId)' });
    }

    // Check if membership plan exists
    const plan = await Plan.findOne({ _id: planId, tenantId: req.tenantId });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Auto-generate code
    const memberCode = await generateMemberCode(req.tenantId);

    // Calculate end date based on plan duration
    const startDate = membershipStart ? new Date(membershipStart) : new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    const member = await Member.create({
      tenantId: req.tenantId,
      name,
      email,
      phone,
      gender,
      dob,
      membershipStart: startDate,
      membershipEnd: endDate,
      planId,
      status: status || 'active',
      membershipStatus: membershipStatus || 'unpaid',
      memberCode,
      emergencyContact,
    });

    const populated = await Member.findById(member._id).populate('planId', 'name price');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error creating member' });
  }
});

// @route   PUT /api/members/:id
// @desc    Update gym member details
// @access  Private
router.put('/:id', async (req, res) => {
  const { name, email, phone, gender, dob, planId, status, membershipStatus, membershipStart, membershipEnd, emergencyContact } = req.body;

  try {
    let member = await Member.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // If plan changed, recalculate end date (optional, or manual update is allowed)
    if (planId && planId.toString() !== member.planId.toString()) {
      const plan = await Plan.findOne({ _id: planId, tenantId: req.tenantId });
      if (!plan) {
        return res.status(404).json({ success: false, message: 'New Plan not found' });
      }
      member.planId = planId;
      // Re-calculate end date based on current start date or today
      const startDate = membershipStart ? new Date(membershipStart) : member.membershipStart;
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + plan.durationMonths);
      member.membershipEnd = endDate;
    }

    member.name = name !== undefined ? name : member.name;
    member.email = email !== undefined ? email : member.email;
    member.phone = phone !== undefined ? phone : member.phone;
    member.gender = gender !== undefined ? gender : member.gender;
    member.dob = dob !== undefined ? dob : member.dob;
    member.status = status !== undefined ? status : member.status;
    member.membershipStatus = membershipStatus !== undefined ? membershipStatus : member.membershipStatus;
    member.emergencyContact = emergencyContact !== undefined ? emergencyContact : member.emergencyContact;

    if (membershipStart) member.membershipStart = new Date(membershipStart);
    if (membershipEnd) member.membershipEnd = new Date(membershipEnd);

    await member.save();
    const populated = await Member.findById(member._id).populate('planId', 'name price');

    res.json({ success: true, data: populated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating member' });
  }
});

// @route   DELETE /api/members/:id
// @desc    Delete gym member
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const member = await Member.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting member' });
  }
});

module.exports = router;
