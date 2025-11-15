const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { auth } = require('../middleware/auth');

// Get all departments (public for registration)
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('headOfDepartment', 'name email')
      .sort({ departmentName: 1 });

    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get department by ID
router.get('/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('headOfDepartment', 'name email');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new department (admin)
router.post('/', auth, async (req, res) => {
  try {
    const department = new Department(req.body);
    const savedDepartment = await department.save();
    const populatedDepartment = await Department.findById(savedDepartment._id)
      .populate('headOfDepartment', 'name email');

    res.status(201).json(populatedDepartment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update department (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('headOfDepartment', 'name email');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete department (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;