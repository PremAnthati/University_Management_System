const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  timetable_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },
  day_of_week: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  subject_name: { type: String, required: true },
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  room_number: { type: String, required: true },
  class_type: { type: String, enum: ['Lecture', 'Lab', 'Tutorial'], required: true }
});

module.exports = mongoose.model('Timetable', timetableSchema);