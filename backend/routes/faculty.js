const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const { auth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get all faculty
router.get('/', auth, async (req, res) => {
  try {
    const { department, status } = req.query;
    let query = {};

    if (department) query.department = department;
    if (status) query.status = status;

    const faculty = await Faculty.find(query)
      .populate('courses', 'courseCode courseName')
      .sort({ createdAt: -1 });

    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get faculty by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('courses', 'courseCode courseName department credits');

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new faculty
router.post('/', auth, async (req, res) => {
  try {
    const { password, ...facultyData } = req.body;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const faculty = new Faculty({
      ...facultyData,
      password: hashedPassword
    });

    const savedFaculty = await faculty.save();
    res.status(201).json(savedFaculty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update faculty
router.put('/:id', auth, async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('courses', 'courseCode courseName');

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json(faculty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete faculty
router.delete('/:id', auth, async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Remove faculty reference from courses
    await Course.updateMany(
      { faculty: req.params.id },
      { $unset: { faculty: 1 } }
    );

    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign course to faculty
router.post('/:id/courses/:courseId', auth, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    const course = await Course.findById(req.params.courseId);

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if course is already assigned to another faculty
    if (course.faculty) {
      return res.status(400).json({ message: 'Course already assigned to another faculty' });
    }

    // Assign course to faculty
    faculty.courses.push(req.params.courseId);
    course.faculty = req.params.id;

    await faculty.save();
    await course.save();

    const updatedFaculty = await Faculty.findById(req.params.id)
      .populate('courses', 'courseCode courseName department credits');

    res.json(updatedFaculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove course from faculty
router.delete('/:id/courses/:courseId', auth, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    const course = await Course.findById(req.params.courseId);

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Remove course from faculty
    faculty.courses = faculty.courses.filter(
      courseId => courseId.toString() !== req.params.courseId
    );
    course.faculty = undefined;

    await faculty.save();
    await course.save();

    const updatedFaculty = await Faculty.findById(req.params.id)
      .populate('courses', 'courseCode courseName department credits');

    res.json(updatedFaculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get faculty workload (courses assigned)
router.get('/:id/workload', auth, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('courses', 'courseCode courseName department credits enrolledStudents');

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    const workload = {
      faculty: faculty.name,
      totalCourses: faculty.courses.length,
      totalStudents: faculty.courses.reduce((total, course) => total + course.enrolledStudents.length, 0),
      courses: faculty.courses
    };

    res.json(workload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;