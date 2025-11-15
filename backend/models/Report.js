const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['student_registration', 'resource_usage', 'inventory', 'general'], required: true },
  content: { type: String, required: true },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  generatedAt: { type: Date, default: Date.now },
  filters: { type: Object }, // For storing filter criteria
});

module.exports = mongoose.model('Report', reportSchema);