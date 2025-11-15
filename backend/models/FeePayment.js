const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
  payment_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  fee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee', required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: mongoose.Schema.Types.Decimal128, required: true },
  payment_mode: { type: String, required: true },
  transaction_id: { type: String, required: true },
  payment_date: { type: Date, default: Date.now },
  receipt_number: { type: String, required: true },
  status: { type: String, enum: ['Success', 'Failed', 'Pending'], default: 'Pending' }
});

module.exports = mongoose.model('FeePayment', feePaymentSchema);