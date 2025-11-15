const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  description: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  credits: { type: Number, required: true, min: 1, max: 6 },
  semester: { type: String, required: true }, // e.g., "Fall 2024", "Spring 2025"
  year: { type: Number, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  maxStudents: { type: Number, required: true, default: 50 },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  prerequisites: [{ type: String }], // Array of course codes
  schedule: {
    days: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
    startTime: { type: String, required: true }, // e.g., "09:00"
    endTime: { type: String, required: true }, // e.g., "10:30"
    classroom: { type: String }
  },
  status: { type: String, enum: ['active', 'inactive', 'cancelled'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Course', courseSchema);