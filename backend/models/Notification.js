const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notification_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // NULL for all
  title: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, enum: ['Academic', 'Fees', 'Events', 'General'], required: true },
  year: { type: Number }, // Optional: filter notifications by academic year
  semester: { type: Number }, // Optional: filter notifications by semester
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
notificationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
notificationSchema.index({ recipientType: 1, status: 1, createdAt: -1 });
notificationSchema.index({ 'recipients': 1 });
notificationSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model('Notification', notificationSchema);