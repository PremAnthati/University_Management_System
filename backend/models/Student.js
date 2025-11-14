const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  registration_id: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  full_name: { type: String, required: true },
  phone_number: { type: String, required: true },
  date_of_birth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },
  profile_photo: { type: String },
  registration_status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Graduated', 'Withdrawn'], default: 'Pending' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  // Additional fields for functionality
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String }
  },
  academicInfo: {
    gpa: { type: Number, min: 0, max: 4, default: 0 },
    totalCredits: { type: Number, default: 0 },
    major: { type: String },
    minor: { type: String }
  },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  completedCourses: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    grade: { type: String },
    gradePoints: { type: Number },
    semester: { type: String },
    year: { type: Number }
  }],
  documents: [{
    type: { type: String, enum: ['transcript', 'id_card', 'certificate', 'other'] },
    filename: { type: String },
    url: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Legacy fields for backward compatibility
  name: { type: String },
  department: { type: String },
  status: { type: String }, // Keep for compatibility, but use registration_status
  registrationDate: { type: Date, default: Date.now },
  role: { type: String, default: 'student' },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true }
});

// Update the updatedAt field before saving
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Remove password from JSON output
studentSchema.methods.toJSON = function() {
  const studentObject = this.toObject();
  delete studentObject.password;
  return studentObject;
};

module.exports = mongoose.model('Student', studentSchema);