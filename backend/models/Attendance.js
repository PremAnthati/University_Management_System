const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  attendance_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Leave'],
    required: true
  },
  marked_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  marked_at: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ student: 1, course: 1, date: 1, classType: 1 }, { unique: true });

// Update the updatedAt field before saving
attendanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);