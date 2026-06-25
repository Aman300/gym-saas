const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const { protect } = require('../middleware/auth');

// Apply protection middleware
router.use(protect);

// @route   POST /api/attendance/scan
// @desc    Register a check-in or check-out automatically by memberCode
// @access  Private
router.post('/scan', async (req, res) => {
  const { memberCode } = req.body;

  try {
    if (!memberCode) {
      return res.status(400).json({ success: false, message: 'Please provide a member code' });
    }

    // Find the member
    const member = await Member.findOne({ tenantId: req.tenantId, memberCode }).populate('planId', 'name');
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found with this code' });
    }

    // Check membership status / expiry
    const today = new Date();
    const isExpired = new Date(member.membershipEnd) < today;

    if (member.status === 'inactive') {
      return res.status(400).json({
        success: false,
        message: 'Member account is inactive',
        member,
      });
    }

    // Find last check-in in the last 12 hours that hasn't checked out
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const activeSession = await Attendance.findOne({
      tenantId: req.tenantId,
      memberId: member._id,
      checkIn: { $gte: twelveHoursAgo },
      checkOut: { $exists: false },
    });

    if (activeSession) {
      // Check them out
      activeSession.checkOut = new Date();
      await activeSession.save();
      return res.json({
        success: true,
        action: 'checkout',
        message: `${member.name} checked out successfully`,
        data: activeSession,
        member,
        isExpired,
      });
    } else {
      // Check them in
      const newAttendance = await Attendance.create({
        tenantId: req.tenantId,
        memberId: member._id,
        checkIn: new Date(),
      });
      return res.status(201).json({
        success: true,
        action: 'checkin',
        message: `${member.name} checked in successfully`,
        data: newAttendance,
        member,
        isExpired, // Still check in, but let front-end alert if expired
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error scanning attendance' });
  }
});

// @route   GET /api/attendance
// @desc    Get attendance logs
// @access  Private
router.get('/', async (req, res) => {
  const { date } = req.query; // date in format YYYY-MM-DD
  let query = { tenantId: req.tenantId };

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query.checkIn = { $gte: start, $lte: end };
  }

  try {
    const logs = await Attendance.find(query)
      .populate({
        path: 'memberId',
        select: 'name memberCode phone status membershipEnd',
        populate: { path: 'planId', select: 'name' }
      })
      .sort({ checkIn: -1 });

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching attendance logs' });
  }
});

module.exports = router;
