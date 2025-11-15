const mongoose = require('mongoose');

const courseMaterialSchema = new mongoose.Schema({
  material_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  title: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['document', 'presentation', 'video', 'link', 'assignment', 'quiz', 'other'],
    required: true
  },
  fileUrl: { type: String }, // For uploaded files
  fileName: { type: String }, // Original filename
  fileSize: { type: Number }, // File size in bytes
  externalLink: { type: String }, // For external links
  isVisible: { type: Boolean, default: true },
  downloadCount: { type: Number, default: 0 },
  tags: [{ type: String }], // Tags for categorization
  uploadedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  semester: { type: String },
  year: { type: Number },
  dueDate: { type: Date }, // For assignments
  maxMarks: { type: Number }, // For assignments/quizzes
  instructions: { type: String } // Additional instructions
});

// Compound index to prevent duplicate materials
courseMaterialSchema.index({ course: 1, title: 1, type: 1 }, { unique: true });

// Update the updatedAt field before saving
courseMaterialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CourseMaterial', courseMaterialSchema);