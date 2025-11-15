const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Leave'],
    required: true
  },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

// Update the updatedAt field before saving
attendanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);