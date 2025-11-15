const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  fee_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  semester: { type: Number, required: true },
  year: { type: Number, required: true },
  tuition_fee: { type: mongoose.Schema.Types.Decimal128, required: true },
  lab_fee: { type: mongoose.Schema.Types.Decimal128, required: true },
  library_fee: { type: mongoose.Schema.Types.Decimal128, required: true },
  other_fees: { type: mongoose.Schema.Types.Decimal128, required: true },
  total_amount: { type: mongoose.Schema.Types.Decimal128, required: true },
  paid_amount: { type: mongoose.Schema.Types.Decimal128, default: 0 },
  pending_amount: { type: mongoose.Schema.Types.Decimal128, required: true },
  status: { type: String, enum: ['Paid', 'Pending', 'Partial'], default: 'Pending' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Fee', feeSchema);