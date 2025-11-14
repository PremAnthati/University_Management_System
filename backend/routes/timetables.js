const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const { auth } = require('../middleware/auth');

// Get student timetable
router.get('/student/:id/timetable', auth, async (req, res) => {
  try {
    const student = await require('../models/Student').findById(req.params.id);
    const timetable = await Timetable.find({
      department_id: student.department_id,
      course_id: student.course_id,
      year: student.year,
      semester: student.semester
    });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export timetable
router.get('/timetable/export/:format', auth, async (req, res) => {
  try {
    // Export logic based on format (PDF, Excel, iCal)
    res.json({ message: `Timetable exported as ${req.params.format}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;