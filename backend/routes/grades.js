const express = require('express');
const router = express.Router();
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const { auth } = require('../middleware/auth');

// Get grades
router.get('/', auth, async (req, res) => {
  try {
    const { student, course, faculty, assessmentType, semester, year, status } = req.query;
    let query = {};

    if (student) query.student = student;
    if (course) query.course = course;
    if (faculty) query.faculty = faculty;
    if (assessmentType) query.assessmentType = assessmentType;
    if (semester) query.semester = semester;
    if (year) query.year = parseInt(year);
    if (status) query.status = status;

    const grades = await Grade.find(query)
      .populate('student', 'name email studentId')
      .populate('course', 'courseCode courseName')
      .populate('faculty', 'name email')
      .populate('gradedBy', 'name')
      .sort({ gradedDate: -1 });

    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get grade by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('student', 'name email studentId')
      .populate('course', 'courseCode courseName')
      .populate('faculty', 'name email')
      .populate('gradedBy', 'name');

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    res.json(grade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new grade
router.post('/', auth, async (req, res) => {
  try {
    const grade = new Grade(req.body);
    const savedGrade = await grade.save();
    const populatedGrade = await Grade.findById(savedGrade._id)
      .populate('student', 'name email studentId')
      .populate('course', 'courseCode courseName')
      .populate('faculty', 'name email')
      .populate('gradedBy', 'name');

    res.status(201).json(populatedGrade);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk create grades
router.post('/bulk', auth, async (req, res) => {
  try {
    const { grades } = req.body;

    const savedGrades = await Grade.insertMany(grades);
    const populatedGrades = await Grade.find({
      _id: { $in: savedGrades.map(g => g._id) }
    })
      .populate('student', 'name email studentId')
      .populate('course', 'courseCode courseName')
      .populate('faculty', 'name email')
      .populate('gradedBy', 'name');

    res.status(201).json(populatedGrades);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update grade
router.put('/:id', auth, async (req, res) => {
  try {
    const grade = await Grade.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('student', 'name email studentId')
      .populate('course', 'courseCode courseName')
      .populate('faculty', 'name email')
      .populate('gradedBy', 'name');

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    res.json(grade);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete grade
router.delete('/:id', auth, async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get grades for a specific student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { semester, year } = req.query;
    let query = { student: req.params.studentId };

    if (semester) query.semester = semester;
    if (year) query.year = parseInt(year);

    const grades = await Grade.find(query)
      .populate('course', 'courseCode courseName credits')
      .populate('faculty', 'name')
      .sort({ gradedDate: -1 });

    // Calculate GPA
    const semesterGrades = grades.filter(g => g.status === 'finalized');
    const totalCredits = semesterGrades.reduce((sum, grade) => sum + grade.course.credits, 0);
    const weightedPoints = semesterGrades.reduce((sum, grade) => sum + (grade.gradePoints * grade.course.credits), 0);
    const gpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : 0;

    res.json({
      studentId: req.params.studentId,
      grades,
      summary: {
        totalCourses: semesterGrades.length,
        totalCredits,
        gpa: parseFloat(gpa)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get grades for a specific course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const grades = await Grade.find({ course: req.params.courseId })
      .populate('student', 'name email studentId')
      .populate('faculty', 'name')
      .sort({ student: 1, assessmentType: 1 });

    // Group by student
    const studentGrades = {};
    grades.forEach(grade => {
      const studentId = grade.student._id.toString();
      if (!studentGrades[studentId]) {
        studentGrades[studentId] = {
          student: grade.student,
          assessments: []
        };
      }
      studentGrades[studentId].assessments.push(grade);
    });

    res.json({
      courseId: req.params.courseId,
      studentGrades: Object.values(studentGrades)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get grade statistics for a course
router.get('/stats/course/:courseId', auth, async (req, res) => {
  try {
    const grades = await Grade.find({
      course: req.params.courseId,
      status: 'finalized'
    });

    const stats = {
      totalStudents: new Set(grades.map(g => g.student.toString())).size,
      gradeDistribution: {},
      averageScore: 0,
      assessments: {}
    };

    // Calculate grade distribution
    grades.forEach(grade => {
      if (!stats.gradeDistribution[grade.grade]) {
        stats.gradeDistribution[grade.grade] = 0;
      }
      stats.gradeDistribution[grade.grade]++;
    });

    // Calculate average score
    const totalScore = grades.reduce((sum, grade) => sum + (grade.score / grade.maxScore * 100), 0);
    stats.averageScore = grades.length > 0 ? (totalScore / grades.length).toFixed(2) : 0;

    // Group by assessment type
    grades.forEach(grade => {
      if (!stats.assessments[grade.assessmentType]) {
        stats.assessments[grade.assessmentType] = [];
      }
      stats.assessments[grade.assessmentType].push(grade);
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Publish grades (change status to published)
router.put('/:id/publish', auth, async (req, res) => {
  try {
    const grade = await Grade.findByIdAndUpdate(
      req.params.id,
      { status: 'published' },
      { new: true }
    )
      .populate('student', 'name email studentId')
      .populate('course', 'courseCode courseName')
      .populate('faculty', 'name email');

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    res.json(grade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Finalize grades (change status to finalized)
router.put('/:id/finalize', auth, async (req, res) => {
  try {
    const grade = await Grade.findByIdAndUpdate(
      req.params.id,
      { status: 'finalized' },
      { new: true }
    )
      .populate('student', 'name email studentId')
      .populate('course', 'courseCode courseName')
      .populate('faculty', 'name email');

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    res.json(grade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;