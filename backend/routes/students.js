const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const StudentDocument = require('../models/StudentDocument');
const Fee = require('../models/Fee');
const FeePayment = require('../models/FeePayment');
const Result = require('../models/Result');
const Timetable = require('../models/Timetable');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const { validateStudentRegistration, handleValidationErrors } = require('../middleware/validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');
const multer = require('multer');
const path = require('path');

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  }
});

// Get all students
router.get('/', auth, async (req, res) => {
  try {
    const { department, year, semester, status } = req.query;
    let query = {};

    if (department) query.department = department;
    if (year) query.year = parseInt(year);
    if (semester) query.semester = semester;
    if (status) query.status = status;

    const students = await Student.find(query)
      .populate('enrolledCourses', 'courseCode courseName')
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('enrolledCourses', 'courseCode courseName department credits')
      .populate('completedCourses.course', 'courseCode courseName');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student self-registration (UC-UDMS-SR)
router.post('/register', validateStudentRegistration, handleValidationErrors, async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone_number,
      date_of_birth,
      gender,
      address,
      city,
      state,
      pincode,
      department_id,
      course_id,
      year,
      semester,
      password
    } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ email });

    if (existingStudent) {
      return res.status(400).json({
        message: 'Student with this email already exists'
      });
    }

    // Generate unique registration ID
    const registration_id = 'REG' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const student = new Student({
      registration_id,
      email,
      password: hashedPassword,
      full_name,
      phone_number,
      date_of_birth,
      gender,
      address,
      city,
      state,
      pincode,
      department_id,
      course_id,
      year,
      semester,
      registration_status: 'Pending'
    });

    const savedStudent = await student.save();

    // Send confirmation email
    try {
      await emailService.sendRegistrationConfirmation(email, {
        full_name,
        registration_id,
        course_id,
        department_id
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      message: 'Registration successful. Please wait for admin approval.',
      registration_id,
      student: savedStudent
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create new student (admin)
router.post('/', auth, async (req, res) => {
  try {
    const { password, ...studentData } = req.body;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const student = new Student({
      ...studentData,
      password: hashedPassword
    });

    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student
router.put('/:id', auth, async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('enrolledCourses', 'courseCode courseName');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete student
router.delete('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending students
router.get('/status/pending', auth, async (req, res) => {
  try {
    const pendingStudents = await Student.find({ registration_status: 'Pending' })
      .sort({ registrationDate: -1 });

    res.json(pendingStudents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve student
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { registration_status: 'Approved', status: 'approved' },
      { new: true }
    ).populate('enrolledCourses', 'courseCode courseName');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject student
router.patch('/:id/reject', auth, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { registration_status: 'Rejected', status: 'rejected' },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enroll student in course (UC-UDMS-CR)
router.post('/:id/enroll/:courseId', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const course = await require('../models/Course').findById(req.params.courseId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if student is already enrolled
    if (student.enrolledCourses.includes(req.params.courseId)) {
      return res.status(400).json({ message: 'Student already enrolled in this course' });
    }

    // Check course capacity
    if (course.enrolledStudents.length >= course.maxStudents) {
      return res.status(400).json({ message: 'Course is full' });
    }

    student.enrolledCourses.push(req.params.courseId);
    course.enrolledStudents.push(req.params.id);

    await student.save();
    await course.save();

    const updatedStudent = await Student.findById(req.params.id)
      .populate('enrolledCourses', 'courseCode courseName department credits');

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unenroll student from course
router.post('/:id/unenroll/:courseId', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const course = await require('../models/Course').findById(req.params.courseId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    student.enrolledCourses = student.enrolledCourses.filter(
      courseId => courseId.toString() !== req.params.courseId
    );

    course.enrolledStudents = course.enrolledStudents.filter(
      studentId => studentId.toString() !== req.params.id
    );

    await student.save();
    await course.save();

    const updatedStudent = await Student.findById(req.params.id)
      .populate('enrolledCourses', 'courseCode courseName department credits');

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's grades (UC-UDMS-VG)
router.get('/:id/grades', auth, async (req, res) => {
  try {
    const { semester, year } = req.query;
    const student = await Student.findById(req.params.id)
      .populate('completedCourses.course', 'courseCode courseName credits');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let grades = student.completedCourses;

    if (semester) {
      grades = grades.filter(grade => grade.semester === semester);
    }

    if (year) {
      grades = grades.filter(grade => grade.year === parseInt(year));
    }

    // Calculate GPA
    const totalCredits = grades.reduce((sum, grade) => sum + grade.course.credits, 0);
    const weightedPoints = grades.reduce((sum, grade) => sum + (grade.gradePoints * grade.course.credits), 0);
    const gpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : 0;

    res.json({
      student: {
        name: student.name,
        studentId: student.studentId,
        department: student.department
      },
      grades,
      summary: {
        totalCourses: grades.length,
        totalCredits,
        gpa: parseFloat(gpa)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's attendance (UC-UDMS-VA)
router.get('/:id/attendance', auth, async (req, res) => {
  try {
    const { courseId, startDate, endDate } = req.query;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let attendanceQuery = { student: req.params.id };

    if (courseId) attendanceQuery.course = courseId;
    if (startDate && endDate) {
      attendanceQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await require('../models/Attendance').find(attendanceQuery)
      .populate('course', 'courseCode courseName')
      .populate('faculty', 'name')
      .sort({ date: -1 });

    // Calculate attendance percentage
    const totalClasses = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const attendancePercentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) : 0;

    res.json({
      student: {
        name: student.name,
        studentId: student.studentId
      },
      attendance,
      summary: {
        totalClasses,
        present: presentCount,
        absent: attendance.filter(a => a.status === 'absent').length,
        late: attendance.filter(a => a.status === 'late').length,
        excused: attendance.filter(a => a.status === 'excused').length,
        attendancePercentage: parseFloat(attendancePercentage)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload document
router.post('/:id/documents', auth, async (req, res) => {
  try {
    const { type, filename, url } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.documents.push({
      type,
      filename,
      url
    });

    await student.save();

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const stats = await Student.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$registration_status', 'Approved'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$registration_status', 'Pending'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$registration_status', 'Rejected'] }, 1, 0] } },
          graduated: { $sum: { $cond: [{ $eq: ['$registration_status', 'Graduated'] }, 1, 0] } },
          withdrawn: { $sum: { $cond: [{ $eq: ['$registration_status', 'Withdrawn'] }, 1, 0] } },
          departments: { $addToSet: '$department' },
          years: { $addToSet: '$year' }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        graduated: 0,
        withdrawn: 0,
        departments: [],
        years: []
      });
    }

    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (student.registration_status !== 'Approved' && student.registration_status !== 'Graduated') {
      return res.status(403).json({ message: 'Account not approved yet' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: student._id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    student.lastLogin = new Date();
    await student.save();

    res.json({
      token,
      student: {
        id: student._id,
        full_name: student.full_name,
        email: student.email,
        registration_id: student.registration_id
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student profile
router.get('/profile/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update student profile
router.put('/profile/:id', auth, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student fees
router.get('/:id/fees', auth, async (req, res) => {
  try {
    const { year, semester } = req.query;
    let query = { student_id: req.params.id };

    // Filter by year/semester if provided
    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);

    const fees = await Fee.find(query).sort({ year: -1, semester: -1 });
    
    // Convert Decimal128 to numbers for easier frontend consumption
    const formattedFees = fees.map(fee => ({
      ...fee.toObject(),
      tuition_fee: parseFloat(fee.tuition_fee.toString()),
      lab_fee: parseFloat(fee.lab_fee.toString()),
      library_fee: parseFloat(fee.library_fee.toString()),
      other_fees: parseFloat(fee.other_fees.toString()),
      total_amount: parseFloat(fee.total_amount.toString()),
      paid_amount: parseFloat(fee.paid_amount.toString()),
      pending_amount: parseFloat(fee.pending_amount.toString())
    }));

    res.json({ data: formattedFees });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get fee payments
router.get('/:id/fee-payments', auth, async (req, res) => {
  try {
    const payments = await FeePayment.find({ student_id: req.params.id });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Process fee payment
router.post('/pay-fee', auth, async (req, res) => {
  try {
    const { fee_id, amount, payment_mode } = req.body;
    const payment = new FeePayment({
      fee_id,
      student_id: req.body.student_id,
      amount,
      payment_mode,
      transaction_id: 'TXN' + Date.now(),
      receipt_number: 'RCP' + Date.now(),
      status: 'Success'
    });
    await payment.save();
    res.json({ message: 'Payment successful', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student results
router.get('/:id/results', auth, async (req, res) => {
  try {
    const { year, semester } = req.query;
    let query = { student_id: req.params.id };

    // Filter by year/semester if provided
    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);

    const results = await Result.find(query)
      .populate('course_id', 'courseCode courseName credits')
      .sort({ year: -1, semester: -1 });

    // Convert Decimal128 to numbers for easier frontend consumption
    const formattedResults = results.map(result => ({
      ...result.toObject(),
      internal_marks: parseFloat(result.internal_marks.toString()),
      external_marks: parseFloat(result.external_marks.toString()),
      total_marks: parseFloat(result.total_marks.toString()),
      credits: result.credits,
      grade: result.grade,
      course_id: result.course_id // Already populated
    }));

    res.json({ data: formattedResults });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get timetable
router.get('/:id/timetable', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const { year, semester } = req.query;

    // Use selected year/semester or default to student's current year/semester
    const selectedYear = year ? parseInt(year) : student.year;
    const selectedSemester = semester ? parseInt(semester) : student.semester;

    const timetable = await Timetable.find({
      department_id: student.department_id,
      course_id: student.course_id,
      year: selectedYear,
      semester: selectedSemester
    });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance
router.get('/:id/attendance', auth, async (req, res) => {
  try {
    const { year, semester } = req.query;
    let query = { student_id: req.params.id };

    // Filter by year/semester if provided
    // Note: Attendance model doesn't have year/semester, so we need to join with courses
    const attendance = await Attendance.find(query)
      .populate('course_id', 'courseCode courseName')
      .populate('marked_by', 'name')
      .sort({ date: -1 });

    // Calculate attendance summary
    const totalClasses = attendance.length;
    const present = attendance.filter(a => a.status === 'Present').length;
    const absent = attendance.filter(a => a.status === 'Absent').length;
    const leave = attendance.filter(a => a.status === 'Leave').length;
    const attendancePercentage = totalClasses > 0 ? Math.round((present / totalClasses) * 100) : 0;

    res.json({
      data: attendance,
      summary: {
        totalClasses,
        present,
        absent,
        leave,
        attendancePercentage
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get notifications
router.get('/:id/notifications', auth, async (req, res) => {
  try {
    const { year, semester } = req.query;
    let query = {
      $or: [{ student_id: req.params.id }, { student_id: null }]
    };

    // Filter notifications by year/semester if provided
    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);

    const notifications = await Notification.find(query).sort({ created_at: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get enrolled courses
router.get('/:id/courses', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const { year, semester } = req.query;

    // Use selected year/semester or default to student's current year/semester
    const selectedYear = year ? parseInt(year) : student.year;
    const selectedSemester = semester ? parseInt(semester) : student.semester;

    // Filter enrolled courses by year/semester
    const courses = await require('../models/Course').find({
      _id: { $in: student.enrolledCourses },
      year: selectedYear,
      semester: selectedSemester
    });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;