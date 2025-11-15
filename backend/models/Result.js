const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  result_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  semester: { type: Number, required: true },
  year: { type: Number, required: true },
  exam_type: { type: String, enum: ['Mid-term', 'Final'], required: true },
  internal_marks: { type: mongoose.Schema.Types.Decimal128, required: true },
  external_marks: { type: mongoose.Schema.Types.Decimal128, required: true },
  total_marks: { type: mongoose.Schema.Types.Decimal128, required: true },
  grade: { type: String, required: true },
  credits: { type: Number, required: true },
  status: { type: String, enum: ['Pass', 'Fail'], required: true },
  published_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', resultSchema);