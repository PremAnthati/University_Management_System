const mongoose = require('mongoose');

const studentDocumentSchema = new mongoose.Schema({
  document_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  document_type: { type: String, enum: ['10th', '12th', 'ID Proof'], required: true },
  file_path: { type: String, required: true },
  uploaded_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudentDocument', studentDocumentSchema);