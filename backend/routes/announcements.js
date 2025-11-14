const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { auth } = require('../middleware/auth');

// Get all announcements (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { category, priority, targetAudience, isActive } = req.query;
    let query = {};

    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (targetAudience) query.targetAudience = targetAudience;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get announcement by ID (admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'username email');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new announcement (admin) - with real-time broadcast
router.post('/', auth, async (req, res) => {
  try {
    const { title, message, category, priority, targetAudience, targetYear, targetSemester, targetDepartment, expiresAt } = req.body;

    // Get admin ID from token (assuming it's stored in req.user)
    const adminId = req.user?.id || req.body.adminId;

    const announcement = new Announcement({
      title,
      message,
      category: category || 'General',
      priority: priority || 'Medium',
      targetAudience: targetAudience || 'All',
      targetYear: targetYear ? parseInt(targetYear) : undefined,
      targetSemester: targetSemester ? parseInt(targetSemester) : undefined,
      targetDepartment,
      createdBy: adminId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    const savedAnnouncement = await announcement.save();
    const populatedAnnouncement = await Announcement.findById(savedAnnouncement._id)
      .populate('createdBy', 'username email');

    // Real-time broadcast via Socket.IO
    const io = req.app.get('io');
    if (io) {
      const announcementData = {
        id: populatedAnnouncement._id,
        title: populatedAnnouncement.title,
        message: populatedAnnouncement.message,
        category: populatedAnnouncement.category,
        priority: populatedAnnouncement.priority,
        targetAudience: populatedAnnouncement.targetAudience,
        targetYear: populatedAnnouncement.targetYear,
        targetSemester: populatedAnnouncement.targetSemester,
        targetDepartment: populatedAnnouncement.targetDepartment,
        createdAt: populatedAnnouncement.createdAt,
        createdBy: populatedAnnouncement.createdBy
      };

      // Broadcast to all connected students
      io.emit('new-announcement', announcementData);

      console.log('Announcement broadcasted to all students:', announcementData.title);
    }

    res.status(201).json(populatedAnnouncement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update announcement (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username email');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json(announcement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete announcement (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active announcements for students
router.get('/student/active', async (req, res) => {
  try {
    const { year, semester, department } = req.query;

    let query = { isActive: true };

    // Filter based on target audience
    if (year && semester) {
      query.$or = [
        { targetAudience: 'All' },
        {
          targetAudience: 'Specific Year',
          targetYear: parseInt(year)
        },
        {
          targetAudience: 'Specific Semester',
          targetSemester: parseInt(semester)
        },
        {
          targetAudience: 'Specific Department',
          targetDepartment: department
        }
      ];
    }

    // Check expiration
    query.$or = query.$or || [{ targetAudience: 'All' }];
    query.$and = [
      ...query.$or,
      {
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      }
    ];

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'username')
      .sort({ priority: -1, createdAt: -1 }); // High priority first, then newest

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark announcement as read (student)
router.post('/:id/read', async (req, res) => {
  try {
    // In a real app, you'd track read status per user
    // For now, just return success
    res.json({ message: 'Announcement marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;