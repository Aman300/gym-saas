const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const Attendance = require('../models/Attendance');
const Plan = require('../models/Plan');
const { protect } = require('../middleware/auth');

// Apply protection
router.use(protect);

// @route   GET /api/reports/dashboard
// @desc    Get dashboard metrics and summaries
// @access  Private
router.get('/dashboard', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // 1. Total Members & Active Count
    const totalMembers = await Member.countDocuments({ tenantId });
    const activeMembers = await Member.countDocuments({ tenantId, status: 'active' });
    const inactiveMembers = totalMembers - activeMembers;

    // 2. Attendance today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const todayCheckIns = await Attendance.countDocuments({
      tenantId,
      checkIn: { $gte: startOfToday, $lte: endOfToday }
    });

    // 3. Monthly Revenue (current calendar month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const revenueAggregation = await Payment.aggregate([
      { $match: { tenantId, paymentDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlyRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

    // 4. Monthly Expenses (current calendar month)
    const expenseAggregation = await Expense.aggregate([
      { $match: { tenantId, expenseDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlyExpenses = expenseAggregation.length > 0 ? expenseAggregation[0].total : 0;

    // 5. Recent members (last 5)
    const recentMembers = await Member.find({ tenantId })
      .populate('planId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Recent payments (last 5)
    const recentPayments = await Payment.find({ tenantId })
      .populate('memberId', 'name memberCode')
      .populate('planId', 'name')
      .sort({ paymentDate: -1 })
      .limit(5);

    // 7. Recent check-ins (last 5)
    const recentCheckIns = await Attendance.find({
      tenantId,
      checkIn: { $gte: startOfToday }
    })
      .populate('memberId', 'name memberCode')
      .sort({ checkIn: -1 })
      .limit(5);

    // 8. Expiring soon count (in next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const expiringSoon = await Member.countDocuments({
      tenantId,
      status: 'active',
      membershipEnd: { $gte: now, $lte: sevenDaysFromNow }
    });

    res.json({
      success: true,
      data: {
        metrics: {
          totalMembers,
          activeMembers,
          inactiveMembers,
          todayCheckIns,
          monthlyRevenue,
          monthlyExpenses,
          monthlyNetProfit: monthlyRevenue - monthlyExpenses,
          expiringSoon,
        },
        recentMembers,
        recentPayments,
        recentCheckIns,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error generating dashboard reports' });
  }
});

// @route   GET /api/reports/analytics
// @desc    Get detailed chart data for analytics
// @access  Private
router.get('/analytics', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // 1. Revenue & Expenses over last 6 months
    const payments = await Payment.find({
      tenantId,
      paymentDate: { $gte: sixMonthsAgo }
    });

    const expenses = await Expense.find({
      tenantId,
      expenseDate: { $gte: sixMonthsAgo }
    });

    // Bucket by month
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        revenue: 0,
        expenses: 0,
      });
    }

    payments.forEach(p => {
      const pDate = new Date(p.paymentDate);
      const match = months.find(m => m.monthNum === pDate.getMonth() && m.year === pDate.getFullYear());
      if (match) match.revenue += p.amount;
    });

    expenses.forEach(e => {
      const eDate = new Date(e.expenseDate);
      const match = months.find(m => m.monthNum === eDate.getMonth() && m.year === eDate.getFullYear());
      if (match) match.expenses += e.amount;
    });

    // 2. Expense Category breakdown
    const categoryAggregation = await Expense.aggregate([
      { $match: { tenantId } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);
    const expensesByCategory = categoryAggregation.map(item => ({
      category: item._id,
      amount: item.total
    }));

    // 3. Plan distribution
    const planAggregation = await Member.aggregate([
      { $match: { tenantId, status: 'active' } },
      { $group: { _id: '$planId', count: { $sum: 1 } } }
    ]);
    
    // Resolve plan names
    const planIds = planAggregation.map(item => item._id);
    const plansInfo = await Plan.find({ _id: { $in: planIds } });

    const membersByPlan = planAggregation.map(item => {
      const planDetails = plansInfo.find(p => p._id.toString() === item._id.toString());
      return {
        planName: planDetails ? planDetails.name : 'Unknown Plan',
        count: item.count
      };
    });

    // 4. Attendance trends (Daily logs for last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const attendances = await Attendance.find({
      tenantId,
      checkIn: { $gte: sevenDaysAgo }
    });

    const dailyAttendance = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('default', { weekday: 'short', day: 'numeric' });
      const dayNum = d.getDate();
      const monthNum = d.getMonth();

      const count = attendances.filter(a => {
        const cDate = new Date(a.checkIn);
        return cDate.getDate() === dayNum && cDate.getMonth() === monthNum;
      }).length;

      dailyAttendance.push({ label, count });
    }

    res.json({
      success: true,
      data: {
        financials: months, // 6 months trend
        expensesByCategory,
        membersByPlan,
        dailyAttendance
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error generating reports' });
  }
});

module.exports = router;
