const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const { auth, requireFaculty } = require('../middleware/auth');

// Get faculty profile
router.get('/profile', [auth, requireFaculty], async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.user._id)
      .populate('courses', 'courseCode courseName department credits');

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get courses assigned to faculty
router.get('/courses', [auth, requireFaculty], async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.user._id)
      .populate('courses', 'courseCode courseName department credits enrolledStudents semester year');

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json(faculty.courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get students enrolled in a course
router.get('/courses/:courseId/students', [auth, requireFaculty], async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('enrolledStudents', 'full_name email registration_id phone_number academicInfo');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if faculty is assigned to this course
    if (course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to view students for this course' });
    }

    res.json(course.enrolledStudents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get detailed student information
router.get('/students/:studentId', [auth, requireFaculty], async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId)
      .populate('department_id', 'name')
      .populate('course_id', 'courseCode courseName')
      .populate('enrolledCourses', 'courseCode courseName')
      .populate('completedCourses.course', 'courseCode courseName');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if faculty teaches any of the student's courses
    const facultyCourses = await Course.find({ faculty: req.user._id });
    const facultyCourseIds = facultyCourses.map(course => course._id.toString());
    const studentEnrolledCourseIds = student.enrolledCourses.map(course => course._id.toString());

    const hasCommonCourse = facultyCourseIds.some(courseId => studentEnrolledCourseIds.includes(courseId));

    if (!hasCommonCourse) {
      return res.status(403).json({ message: 'You are not authorized to view this student\'s details' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post grades for students
router.post('/grades', [auth, requireFaculty], async (req, res) => {
  try {
    const { studentId, courseId, assessmentType, assessmentName, score, maxScore, weightage, remarks, semester, year } = req.body;

    // Verify faculty is assigned to this course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to post grades for this course' });
    }

    // Verify student is enrolled in this course
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const isEnrolled = student.enrolledCourses.some(course => course.toString() === courseId);
    if (!isEnrolled) {
      return res.status(400).json({ message: 'Student is not enrolled in this course' });
    }

    const grade = new Grade({
      student: studentId,
      course: courseId,
      faculty: req.user._id,
      assessmentType,
      assessmentName,
      score: parseFloat(score),
      maxScore: parseFloat(maxScore),
      weightage: parseFloat(weightage),
      remarks,
      semester,
      year: parseInt(year),
      gradedBy: req.user._id
    });

    const savedGrade = await grade.save();
    const populatedGrade = await Grade.findById(savedGrade._id)
      .populate('student', 'full_name email registration_id')
      .populate('course', 'courseCode courseName')
      .populate('faculty', 'name email')
      .populate('gradedBy', 'name');

    res.status(201).json(populatedGrade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk post grades
router.post('/grades/bulk', [auth, requireFaculty], async (req, res) => {
  try {
    const { courseId, assessmentType, assessmentName, maxScore, weightage, grades, semester, year } = req.body;

    // Verify faculty is assigned to this course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to post grades for this course' });
    }

    const gradeRecords = grades.map(gradeData => ({
      student: gradeData.studentId,
      course: courseId,
      faculty: req.user._id,
      assessmentType,
      assessmentName,
      score: parseFloat(gradeData.score),
      maxScore: parseFloat(maxScore),
      weightage: parseFloat(weightage),
      remarks: gradeData.remarks,
      semester,
      year: parseInt(year),
      gradedBy: req.user._id
    }));

    const savedGrades = await Grade.insertMany(gradeRecords);
    const populatedGrades = await Grade.find({
      _id: { $in: savedGrades.map(g => g._id) }
    })
      .populate('student', 'full_name email registration_id')
      .populate('course', 'courseCode courseName')
      .populate('faculty', 'name email')
      .populate('gradedBy', 'name');

    res.status(201).json(populatedGrades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get grades for a course (faculty view)
router.get('/courses/:courseId/grades', [auth, requireFaculty], async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to view grades for this course' });
    }

    const grades = await Grade.find({ course: req.params.courseId })
      .populate('student', 'full_name email registration_id')
      .sort({ student: 1, assessmentType: 1, gradedDate: -1 });

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
      course: course,
      studentGrades: Object.values(studentGrades)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark attendance for a course
router.post('/attendance', [auth, requireFaculty], async (req, res) => {
  try {
    const { courseId, date, attendanceData } = req.body;

    // Verify faculty is assigned to this course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to mark attendance for this course' });
    }

    const attendanceRecords = [];

    for (const record of attendanceData) {
      // Check if attendance already exists for this student, course, date
      const existingAttendance = await Attendance.findOne({
        student: record.studentId,
        course: courseId,
        date: new Date(date)
      });

      if (!existingAttendance) {
        attendanceRecords.push({
          student: record.studentId,
          course: courseId,
          faculty: req.user._id,
          date: new Date(date),
          status: record.status,
          remarks: record.remarks,
          markedBy: req.user._id
        });
      }
    }

    const savedRecords = await Attendance.insertMany(attendanceRecords);
    const populatedRecords = await Attendance.find({
      _id: { $in: savedRecords.map(r => r._id) }
    })
      .populate('student', 'full_name email registration_id')
      .populate('course', 'courseCode courseName')
      .populate('faculty', 'name email')
      .populate('markedBy', 'name');

    res.status(201).json(populatedRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance records for a course
router.get('/courses/:courseId/attendance', [auth, requireFaculty], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to view attendance for this course' });
    }

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const attendance = await Attendance.find({
      course: req.params.courseId,
      ...dateFilter
    })
      .populate('student', 'full_name email registration_id')
      .populate('faculty', 'name')
      .sort({ date: -1, student: 1 });

    // Group by date
    const attendanceByDate = {};
    attendance.forEach(record => {
      const dateKey = record.date.toISOString().split('T')[0];
      if (!attendanceByDate[dateKey]) {
        attendanceByDate[dateKey] = {
          date: record.date,
          records: []
        };
      }
      attendanceByDate[dateKey].records.push(record);
    });

    res.json({
      course: course,
      attendanceByDate: Object.values(attendanceByDate)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance summary for a course
router.get('/courses/:courseId/attendance-summary', [auth, requireFaculty], async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to view attendance for this course' });
    }

    const attendance = await Attendance.find({ course: req.params.courseId })
      .populate('student', 'full_name email registration_id');

    // Calculate attendance summary per student
    const studentSummary = {};
    attendance.forEach(record => {
      const studentId = record.student._id.toString();
      if (!studentSummary[studentId]) {
        studentSummary[studentId] = {
          student: record.student,
          totalClasses: 0,
          present: 0,
          absent: 0,
          leave: 0,
          percentage: 0
        };
      }
      studentSummary[studentId].totalClasses++;
      if (record.status === 'Present') studentSummary[studentId].present++;
      else if (record.status === 'Absent') studentSummary[studentId].absent++;
      else if (record.status === 'Leave') studentSummary[studentId].leave++;
    });

    // Calculate percentages
    Object.values(studentSummary).forEach(summary => {
      summary.percentage = summary.totalClasses > 0
        ? ((summary.present / summary.totalClasses) * 100).toFixed(2)
        : 0;
    });

    res.json({
      course: course,
      summary: Object.values(studentSummary),
      totalClasses: attendance.length > 0 ? new Set(attendance.map(a => a.date.toISOString())).size : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;