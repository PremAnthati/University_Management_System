const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

// General authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).send({ error: 'No token provided. Please authenticate.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');

    // Try to find user in different collections based on role
    let user = null;

    if (decoded.role === 'admin') {
      user = await Admin.findOne({ _id: decoded.id });
    } else if (decoded.role === 'faculty') {
      user = await Faculty.findOne({ _id: decoded.id });
    } else if (decoded.role === 'student') {
      user = await Student.findOne({ _id: decoded.id });
    }

    if (!user) {
      return res.status(401).send({ error: 'User not found. Please authenticate.' });
    }

    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (e) {
    console.error('Authentication error:', e);
    res.status(401).send({ error: 'Invalid token. Please authenticate.' });
  }
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).send({
        error: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.userRole || 'none'}`
      });
    }
    next();
  };
};

// Specific role middlewares
const requireAdmin = requireRole(['admin']);
const requireFaculty = requireRole(['faculty', 'admin']);
const requireStudent = requireRole(['student', 'faculty', 'admin']);

// Combined middleware for different access levels
const authAdmin = [auth, requireAdmin];
const authFaculty = [auth, requireFaculty];
const authStudent = [auth, requireStudent];

module.exports = {
  auth,
  requireRole,
  requireAdmin,
  requireFaculty,
  requireStudent,
  authAdmin,
  authFaculty,
  authStudent
};