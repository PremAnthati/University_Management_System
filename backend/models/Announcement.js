const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, enum: ['General', 'Academic', 'Events', 'Emergency', 'Important'], default: 'General' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  targetAudience: {
    type: String,
    enum: ['All', 'Specific Year', 'Specific Semester', 'Specific Department'],
    default: 'All'
  },
  targetYear: { type: Number }, // For year-specific announcements
  targetSemester: { type: Number }, // For semester-specific announcements
  targetDepartment: { type: String }, // For department-specific announcements
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date }, // Optional expiration date
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
announcementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
announcementSchema.index({ isActive: 1, createdAt: -1 });
announcementSchema.index({ targetAudience: 1, targetYear: 1, targetSemester: 1 });
announcementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-expiry

module.exports = mongoose.model('Announcement', announcementSchema);