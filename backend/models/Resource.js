const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['equipment', 'lab', 'stationery'], required: true },
  description: { type: String },
  quantity: { type: Number, required: true },
  available: { type: Number, required: true },
  location: { type: String },
  status: { type: String, enum: ['available', 'in_use', 'maintenance'], default: 'available' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Resource', resourceSchema);