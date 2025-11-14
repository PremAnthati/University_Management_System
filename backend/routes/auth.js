const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student login
router.post('/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Student login attempt for:', email);

    const student = await Student.findOne({ email });
    console.log('Student found:', !!student);
    if (!student) {
      console.log('No student found with email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Student status:', student.registration_status, 'ID:', student._id);
    if (student.registration_status !== 'Approved') {
      console.log('Student not approved');
      return res.status(403).json({ message: 'Account not approved yet' });
    }

    console.log('Checking password...');
    const isMatch = await bcrypt.compare(password, student.password);
    console.log('Password match result:', isMatch);
    if (!isMatch) {
      console.log('Password does not match for student:', student._id);
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

// Student logout
router.post('/student/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Forgot password
router.post('/student/forgot-password', async (req, res) => {
  // Implementation for forgot password
  res.json({ message: 'Password reset link sent to email' });
});

// Reset password
router.post('/student/reset-password', async (req, res) => {
  // Implementation for reset password
  res.json({ message: 'Password reset successfully' });
});

module.exports = router;