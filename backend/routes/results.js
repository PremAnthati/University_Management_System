const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Student = require('../models/Student');
const { auth } = require('../middleware/auth');
const reportService = require('../services/reportService');

// Get student results
router.get('/student/:id/results', auth, async (req, res) => {
  try {
    const { year, semester } = req.query;
    let query = { student_id: req.params.id };

    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);

    const results = await Result.find(query).populate('course_id', 'courseCode courseName credits');
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get semester results
router.get('/student/:id/results/:semester', auth, async (req, res) => {
  try {
    const results = await Result.find({
      student_id: req.params.id,
      semester: req.params.semester
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Calculate CGPA
router.get('/student/:id/cgpa', auth, async (req, res) => {
  try {
    const results = await Result.find({ student_id: req.params.id });
    let totalCredits = 0;
    let weightedPoints = 0;

    results.forEach(result => {
      totalCredits += result.credits;
      // Convert grade to points (simplified)
      let points = 0;
      switch(result.grade) {
        case 'A': points = 4; break;
        case 'B': points = 3; break;
        case 'C': points = 2; break;
        case 'D': points = 1; break;
        default: points = 0;
      }
      weightedPoints += points * result.credits;
    });

    const cgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : 0;
    res.json({ cgpa: parseFloat(cgpa), totalCredits });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download grade sheet
router.get('/student/:id/grade-sheet', auth, async (req, res) => {
  try {
    const results = await Result.find({ student_id: req.params.id }).populate('course', 'courseCode courseName credits');
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const filePath = await reportService.generateGradeSheet(results, {
      name: student.full_name,
      studentId: student.registration_id,
      department: student.department_id
    });

    res.download(filePath, `grade_sheet_${student.registration_id}.pdf`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;