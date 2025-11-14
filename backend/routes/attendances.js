const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { auth } = require('../middleware/auth');

// Get student attendance
router.get('/student/:id/attendance', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({ student_id: req.params.id });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get subject-wise attendance
router.get('/student/:id/attendance/:course_id', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({
      student_id: req.params.id,
      course_id: req.params.course_id
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get overall attendance percentage
router.get('/student/:id/attendance-percentage', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({ student_id: req.params.id });
    const totalClasses = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const percentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) : 0;
    res.json({ percentage: parseFloat(percentage), totalClasses, presentCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;