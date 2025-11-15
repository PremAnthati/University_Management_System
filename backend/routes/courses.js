const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { auth } = require('../middleware/auth');

// Get all courses (public for registration, admin for management)
router.get('/', async (req, res) => {
  try {
    const { department, semester, year, status } = req.query;
    let query = {};

    if (department) query.department = department;
    if (semester) query.semester = semester;
    if (year) query.year = parseInt(year);
    if (status) query.status = status;

    const courses = await Course.find(query)
      .populate('faculty', 'name email')
      .populate('department', 'name code')
      .populate('enrolledStudents', 'full_name registration_id')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get course by ID (admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('faculty', 'name email')
      .populate('enrolledStudents', 'full_name registration_id email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new course (admin)
router.post('/', auth, async (req, res) => {
  try {
    const course = new Course(req.body);
    const savedCourse = await course.save();
    const populatedCourse = await Course.findById(savedCourse._id)
      .populate('faculty', 'name email');

    res.status(201).json(populatedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update course (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('faculty', 'name email')
     .populate('enrolledStudents', 'full_name registration_id');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete course (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get enrolled courses (student)
router.get('/student/:id/courses', auth, async (req, res) => {
  try {
    const student = await require('../models/Student').findById(req.params.id).populate('enrolledCourses');
    res.json(student.enrolledCourses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get course details (student)
router.get('/courses/:id/details', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enroll student in course (admin)
router.post('/:id/enroll/:studentId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const student = await require('../models/Student').findById(req.params.studentId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if student is already enrolled
    if (course.enrolledStudents.includes(req.params.studentId)) {
      return res.status(400).json({ message: 'Student already enrolled in this course' });
    }

    // Check course capacity
    if (course.enrolledStudents.length >= course.maxStudents) {
      return res.status(400).json({ message: 'Course is full' });
    }

    course.enrolledStudents.push(req.params.studentId);
    student.enrolledCourses.push(req.params.id);

    await course.save();
    await student.save();

    const updatedCourse = await Course.findById(req.params.id)
      .populate('faculty', 'name email')
      .populate('enrolledStudents', 'full_name registration_id email');

    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unenroll student from course (admin)
router.post('/:id/unenroll/:studentId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const student = await require('../models/Student').findById(req.params.studentId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    course.enrolledStudents = course.enrolledStudents.filter(
      studentId => studentId.toString() !== req.params.studentId
    );

    student.enrolledCourses = student.enrolledCourses.filter(
      courseId => courseId.toString() !== req.params.id
    );

    await course.save();
    await student.save();

    const updatedCourse = await Course.findById(req.params.id)
      .populate('faculty', 'name email')
      .populate('enrolledStudents', 'full_name registration_id email');

    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;