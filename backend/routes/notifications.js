const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// Get all notifications (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { category, student_id, is_read } = req.query;
    let query = {};

    if (category) query.category = category;
    if (student_id) query.student_id = student_id;
    if (is_read !== undefined) query.is_read = is_read === 'true';

    const notifications = await Notification.find(query)
      .populate('student_id', 'full_name registration_id email')
      .sort({ created_at: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get notification by ID (admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('student_id', 'full_name registration_id email');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new notification (admin)
router.post('/', auth, async (req, res) => {
  try {
    const { title, message, category, student_id, year, semester } = req.body;

    const notification = new Notification({
      title,
      message,
      category,
      student_id: student_id || null, // null means broadcast to all students
      year: year ? parseInt(year) : undefined,
      semester: semester ? parseInt(semester) : undefined
    });

    const savedNotification = await notification.save();
    const populatedNotification = await Notification.findById(savedNotification._id)
      .populate('student_id', 'full_name registration_id email');

    res.status(201).json(populatedNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update notification (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('student_id', 'full_name registration_id email');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete notification (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student notifications
router.get('/student/:id/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ student_id: req.params.id }, { student_id: null }]
    }).sort({ created_at: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { is_read: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete notification (student)
router.delete('/notifications/:id', auth, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;