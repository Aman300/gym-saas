const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Member = require('../models/Member');
const Plan = require('../models/Plan');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

// Middleware to ensure user is superadmin
const requireSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Super Admin role required' });
  }
};

// Apply protection to all superadmin routes
router.use(protect);
router.use(requireSuperAdmin);

// @route   GET /api/superadmin/dashboard
// @desc    Get system global metrics
// @access  Private (Super Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    const totalTenants = await Tenant.countDocuments();
    const activeTenants = await Tenant.countDocuments({ isActive: true });
    
    // Aggregated members count
    const totalMembers = await Member.countDocuments();
    
    // Aggregated global payments volume
    const paymentSumResult = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = paymentSumResult[0]?.total || 0;

    const recentTenants = await Tenant.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        totalTenants,
        activeTenants,
        totalMembers,
        totalRevenue,
        recentTenants
      }
    });
  } catch (error) {
    console.error('Error fetching superadmin dashboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/superadmin/tenants
// @desc    Get all tenants with aggregated counts/volumes
// @access  Private (Super Admin only)
router.get('/tenants', async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    
    const enrichedTenants = await Promise.all(tenants.map(async (tenant) => {
      const membersCount = await Member.countDocuments({ tenantId: tenant._id });
      const usersCount = await User.countDocuments({ tenantId: tenant._id });
      
      const paymentsSum = await Payment.aggregate([
        { $match: { tenantId: tenant._id } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const expensesSum = await Expense.aggregate([
        { $match: { tenantId: tenant._id } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      return {
        _id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        address: tenant.address || '—',
        phone: tenant.phone || '—',
        isActive: tenant.isActive,
        subscriptionPlan: tenant.subscriptionPlan,
        subscriptionStatus: tenant.subscriptionStatus,
        subscriptionStart: tenant.subscriptionStart,
        subscriptionEnd: tenant.subscriptionEnd,
        createdAt: tenant.createdAt,
        membersCount,
        usersCount,
        revenue: paymentsSum[0]?.total || 0,
        expenses: expensesSum[0]?.total || 0
      };
    }));

    res.json({
      success: true,
      data: enrichedTenants
    });
  } catch (error) {
    console.error('Error fetching tenants listing:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/superadmin/tenants
// @desc    Create a new Tenant and its primary Owner
// @access  Private (Super Admin only)
router.post('/tenants', async (req, res) => {
  const { gymName, ownerName, email, password, address, phone, subscriptionPlan, durationMonths } = req.body;

  try {
    if (!gymName || !ownerName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide gym name, owner name, email and password' });
    }

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'A user with this email address already exists' });
    }

    // Generate unique slug for the gym tenant
    const slug = gymName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let finalSlug = slug;
    let count = 1;
    while (await Tenant.findOne({ slug: finalSlug })) {
      finalSlug = `${slug}-${count}`;
      count++;
    }

    const plan = subscriptionPlan || 'trial';
    const months = parseInt(durationMonths, 10) || (plan === 'trial' ? 1 : 12);
    const subscriptionEnd = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);

    // Create Tenant
    const tenant = await Tenant.create({
      name: gymName,
      slug: finalSlug,
      address,
      phone,
      isActive: true,
      subscriptionPlan: plan,
      subscriptionStatus: plan === 'trial' ? 'trialing' : 'active',
      subscriptionStart: new Date(),
      subscriptionEnd
    });

    // Create Owner User
    const owner = await User.create({
      tenantId: tenant._id,
      name: ownerName,
      email,
      password,
      role: 'owner',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Tenant and owner user created successfully',
      data: {
        tenant,
        owner: {
          id: owner._id,
          name: owner.name,
          email: owner.email,
          role: owner.role
        }
      }
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/superadmin/tenants/:id
// @desc    Update Tenant details or isActive status
// @access  Private (Super Admin only)
router.put('/tenants/:id', async (req, res) => {
  const { name, address, phone, isActive, subscriptionPlan, subscriptionStatus, subscriptionEnd } = req.body;

  try {
    let tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Update fields
    if (name !== undefined) tenant.name = name;
    if (address !== undefined) tenant.address = address;
    if (phone !== undefined) tenant.phone = phone;
    if (isActive !== undefined) tenant.isActive = isActive;
    if (subscriptionPlan !== undefined) tenant.subscriptionPlan = subscriptionPlan;
    if (subscriptionStatus !== undefined) tenant.subscriptionStatus = subscriptionStatus;
    if (subscriptionEnd !== undefined) tenant.subscriptionEnd = subscriptionEnd;

    await tenant.save();

    res.json({
      success: true,
      message: 'Tenant details updated successfully',
      data: tenant
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/superadmin/tenants/:id
// @desc    Cascading delete of Tenant and all sub-resources
// @access  Private (Super Admin only)
router.delete('/tenants/:id', async (req, res) => {
  try {
    const tenantId = req.params.id;
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Delete cascading resources
    await User.deleteMany({ tenantId });
    await Member.deleteMany({ tenantId });
    await Plan.deleteMany({ tenantId });
    await Attendance.deleteMany({ tenantId });
    await Payment.deleteMany({ tenantId });
    await Expense.deleteMany({ tenantId });

    // Finally delete tenant
    await Tenant.findByIdAndDelete(tenantId);

    res.json({
      success: true,
      message: 'Tenant and all cascading gym resources deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
