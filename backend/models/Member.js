const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  dob: {
    type: Date,
  },
  membershipStart: {
    type: Date,
    default: Date.now,
  },
  membershipEnd: {
    type: Date,
    required: [true, 'Membership end date is required'],
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  membershipStatus: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid',
  },
  memberCode: {
    type: String,
    required: true,
  },
  emergencyContact: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create index on tenantId + memberCode to make sure member codes are unique per gym tenant
MemberSchema.index({ tenantId: 1, memberCode: 1 }, { unique: true });

module.exports = mongoose.model('Member', MemberSchema);
