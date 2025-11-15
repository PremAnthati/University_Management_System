const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const { auth } = require('../middleware/auth');

// Get attendance records
router.get('/', auth, async (req, res) => {
  try {
    const { student, course, faculty, date, status, classType } = req.query;
    let query = {};

    if (student) query.student = student;
    if (course) query.course = course;
    if (faculty) query.faculty = faculty;
    if (date) query.date = new Date(date);
    if (status) query.status = status;
    if (classType) query.classType = classType;

    const attendance = await Attendance.find(query)
      .populate('student', 'full_name email registration_id')
      .populate('course', 'courseCode courseName')
      .populate('faculty', 'name email')
      .populate('markedBy', 'name')
      .sort({ date: -1, createdAt: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('student', 'full_name email registration_id')
      .populate('course', 'courseCode courseName')
      .populate('faculty', 'name email')
      .populate('markedBy', 'name');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark attendance for a class
router.post('/', auth, async (req, res) => {
  try {
    const { studentId, courseId, facultyId, date, status, classType, duration, remarks } = req.body;

    // Check if attendance already exists for this student, course, date, and class type
    const existingAttendance = await Attendance.findOne({
      student: studentId,
      course: courseId,
      date: new Date(date),
      classType: classType || 'lecture'
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this class' });
    }

    const attendance = new Attendance({
      student: studentId,
      course: courseId,
      faculty: facultyId,
      date: new Date(date),
      status,
      classType: classType || 'lecture',
      duration: duration || 60,
      remarks,
      markedBy: facultyId // Assuming faculty marks their own attendance
    });

    const savedAttendance = await attendance.save();
    const populatedAttendance = await Attendance.findById(savedAttendance._id)
      .populate('student', 'full_name email registration_id')
      .populate('course', 'courseCode courseName')
      .populate('faculty', 'name email')
      .populate('markedBy', 'name');

    res.status(201).json(populatedAttendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk mark attendance for a class
router.post('/bulk', auth, async (req, res) => {
  try {
    const { courseId, facultyId, date, classType, attendanceData } = req.body;

    const attendanceRecords = [];

    for (const record of attendanceData) {
      // Check if attendance already exists
      const existing = await Attendance.findOne({
        student: record.studentId,
        course: courseId,
        date: new Date(date),
        classType: classType || 'lecture'
      });

      if (!existing) {
        attendanceRecords.push({
          student: record.studentId,
          course: courseId,
          faculty: facultyId,
          date: new Date(date),
          status: record.status,
          classType: classType || 'lecture',
          duration: record.duration || 60,
          remarks: record.remarks,
          markedBy: facultyId
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
    res.status(400).json({ message: error.message });
  }
});

// Update attendance record
router.put('/:id', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('student', 'full_name email registration_id')
      .populate('course', 'courseCode courseName')
      .populate('faculty', 'name email')
      .populate('markedBy', 'name');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete attendance record
router.delete('/:id', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance summary for a student in a course
router.get('/summary/student/:studentId/course/:courseId', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({
      student: req.params.studentId,
      course: req.params.courseId
    }).sort({ date: 1 });

    const totalClasses = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const absentCount = attendance.filter(a => a.status === 'Absent').length;
    const lateCount = attendance.filter(a => a.status === 'Leave').length;
    const excusedCount = attendance.filter(a => a.status === 'excused').length;

    const attendancePercentage = totalClasses > 0 ? ((presentCount + excusedCount) / totalClasses * 100).toFixed(2) : 0;

    res.json({
      studentId: req.params.studentId,
      courseId: req.params.courseId,
      totalClasses,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      excused: excusedCount,
      attendancePercentage: parseFloat(attendancePercentage),
      records: attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get overall attendance summary for a student (across all courses for a semester/year)
router.get('/summary/student/:studentId', auth, async (req, res) => {
  try {
    const { year, semester } = req.query;
    let query = { student_id: req.params.studentId };

    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);

    const attendance = await Attendance.find(query)
      .populate('course_id', 'courseCode courseName')
      .sort({ date: 1 });

    const totalClasses = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const absentCount = attendance.filter(a => a.status === 'Absent').length;
    const lateCount = attendance.filter(a => a.status === 'Leave').length;
    const excusedCount = attendance.filter(a => a.status === 'excused').length;

    const attendancePercentage = totalClasses > 0 ? ((presentCount + excusedCount) / totalClasses * 100).toFixed(2) : 0;

    res.json({
      studentId: req.params.studentId,
      year: year ? parseInt(year) : null,
      semester: semester ? parseInt(semester) : null,
      totalClasses,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      excused: excusedCount,
      attendancePercentage: parseFloat(attendancePercentage),
      records: attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance report for a course
router.get('/report/course/:courseId', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

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
      .sort({ date: 1, student: 1 });

    // Group by student
    const studentAttendance = {};
    attendance.forEach(record => {
      const studentId = record.student._id.toString();
      if (!studentAttendance[studentId]) {
        studentAttendance[studentId] = {
          student: record.student,
          records: []
        };
      }
      studentAttendance[studentId].records.push(record);
    });

    res.json({
      courseId: req.params.courseId,
      dateRange: { startDate, endDate },
      studentAttendance: Object.values(studentAttendance)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;