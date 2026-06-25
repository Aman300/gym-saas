const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  checkIn: {
    type: Date,
    default: Date.now,
  },
  checkOut: {
    type: Date,
  },
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
