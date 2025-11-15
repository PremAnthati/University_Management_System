const express = require('express');
const Resource = require('../models/Resource');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all resources
router.get('/', auth, async (req, res) => {
  try {
    const resources = await Resource.find({}).populate('assignedTo');
    res.send(resources);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Get resources by type
router.get('/type/:type', auth, async (req, res) => {
  try {
    const resources = await Resource.find({ type: req.params.type }).populate('assignedTo');
    res.send(resources);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Create resource
router.post('/', auth, async (req, res) => {
  try {
    const resource = new Resource(req.body);
    await resource.save();
    res.status(201).send(resource);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Assign resource to student
router.patch('/:id/assign', auth, async (req, res) => {
  try {
    const { studentId } = req.body;
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { assignedTo: studentId, status: 'in_use' },
      { new: true }
    ).populate('assignedTo');
    if (!resource) {
      return res.status(404).send();
    }
    res.send(resource);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Return resource
router.patch('/:id/return', auth, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { assignedTo: null, status: 'available' },
      { new: true }
    );
    if (!resource) {
      return res.status(404).send();
    }
    res.send(resource);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Update resource
router.patch('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!resource) {
      return res.status(404).send();
    }
    res.send(resource);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete resource
router.delete('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).send();
    }
    res.send(resource);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;