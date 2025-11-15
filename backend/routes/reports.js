const express = require('express');
const Report = require('../models/Report');
const Student = require('../models/Student');
const Resource = require('../models/Resource');
const Inventory = require('../models/Inventory');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all reports
router.get('/', auth, async (req, res) => {
  try {
    const reports = await Report.find({}).populate('generatedBy');
    res.send(reports);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Generate student registration report
router.post('/student-registration', auth, async (req, res) => {
  try {
    const { filters } = req.body;
    let query = {};
    if (filters) {
      if (filters.status) query.status = filters.status;
      if (filters.department) query.department = filters.department;
    }

    const students = await Student.find(query);
    const content = `Student Registration Report\nTotal Students: ${students.length}\n\nDetails:\n${students.map(s => `${s.name} - ${s.status} - ${s.department}`).join('\n')}`;

    const report = new Report({
      title: 'Student Registration Report',
      type: 'student_registration',
      content,
      generatedBy: req.admin._id,
      filters
    });
    await report.save();
    res.status(201).send(report);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Generate resource usage report
router.post('/resource-usage', auth, async (req, res) => {
  try {
    const resources = await Resource.find({}).populate('assignedTo');
    const content = `Resource Usage Report\nTotal Resources: ${resources.length}\n\nDetails:\n${resources.map(r => `${r.name} - ${r.status} - Assigned to: ${r.assignedTo ? r.assignedTo.name : 'None'}`).join('\n')}`;

    const report = new Report({
      title: 'Resource Usage Report',
      type: 'resource_usage',
      content,
      generatedBy: req.admin._id
    });
    await report.save();
    res.status(201).send(report);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Generate inventory report
router.post('/inventory', auth, async (req, res) => {
  try {
    const inventory = await Inventory.find({});
    const content = `Inventory Report\nTotal Items: ${inventory.length}\n\nDetails:\n${inventory.map(i => `${i.itemName} - ${i.quantity} - ${i.status}`).join('\n')}`;

    const report = new Report({
      title: 'Inventory Report',
      type: 'inventory',
      content,
      generatedBy: req.admin._id
    });
    await report.save();
    res.status(201).send(report);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete report
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).send();
    }
    res.send(report);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;