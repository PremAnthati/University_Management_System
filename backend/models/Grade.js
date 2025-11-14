const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  assessmentType: {
    type: String,
    enum: ['quiz', 'midterm', 'final', 'assignment', 'project', 'lab', 'presentation'],
    required: true
  },
  assessmentName: { type: String, required: true }, // e.g., "Quiz 1", "Midterm Exam"
  score: { type: Number, required: true, min: 0 },
  maxScore: { type: Number, required: true, min: 1 },
  weightage: { type: Number, required: true, min: 0, max: 100 }, // Percentage weight in final grade
  grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'I', 'W'],
    required: true
  },
  gradePoints: { type: Number, required: true, min: 0, max: 4 }, // GPA points
  remarks: { type: String },
  submissionDate: { type: Date },
  gradedDate: { type: Date, default: Date.now },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  semester: { type: String, required: true },
  year: { type: Number, required: true },
  status: {
    type: String,
    enum: ['draft', 'published', 'finalized'],
    default: 'draft'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate grades
gradeSchema.index({ student: 1, course: 1, assessmentType: 1, assessmentName: 1 }, { unique: true });

// Update the updatedAt field before saving
gradeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate grade and grade points based on score
gradeSchema.pre('save', function(next) {
  if (this.isModified('score') || this.isNew) {
    const percentage = (this.score / this.maxScore) * 100;

    if (percentage >= 95) {
      this.grade = 'A+';
      this.gradePoints = 4.0;
    } else if (percentage >= 90) {
      this.grade = 'A';
      this.gradePoints = 4.0;
    } else if (percentage >= 85) {
      this.grade = 'A-';
      this.gradePoints = 3.7;
    } else if (percentage >= 80) {
      this.grade = 'B+';
      this.gradePoints = 3.3;
    } else if (percentage >= 75) {
      this.grade = 'B';
      this.gradePoints = 3.0;
    } else if (percentage >= 70) {
      this.grade = 'B-';
      this.gradePoints = 2.7;
    } else if (percentage >= 65) {
      this.grade = 'C+';
      this.gradePoints = 2.3;
    } else if (percentage >= 60) {
      this.grade = 'C';
      this.gradePoints = 2.0;
    } else if (percentage >= 55) {
      this.grade = 'C-';
      this.gradePoints = 1.7;
    } else if (percentage >= 50) {
      this.grade = 'D';
      this.gradePoints = 1.0;
    } else {
      this.grade = 'F';
      this.gradePoints = 0.0;
    }
  }
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);