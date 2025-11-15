const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  facultyId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  designation: {
    type: String,
    enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Instructor'],
    required: true
  },
  specialization: { type: String },
  phone: { type: String },
  officeLocation: { type: String },
  qualifications: [{ type: String }], // Array of degrees/certifications
  experience: { type: Number, default: 0 }, // Years of experience
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // Courses assigned to faculty
  status: { type: String, enum: ['active', 'inactive', 'on_leave'], default: 'active' },
  joiningDate: { type: Date, required: true },
  password: { type: String, required: true }, // For authentication
  role: { type: String, default: 'faculty' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
facultySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Remove password from JSON output
facultySchema.methods.toJSON = function() {
  const facultyObject = this.toObject();
  delete facultyObject.password;
  return facultyObject;
};

module.exports = mongoose.model('Faculty', facultySchema);