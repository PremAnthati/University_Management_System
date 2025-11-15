const express = require('express');
const router = express.Router();
const CourseMaterial = require('../models/CourseMaterial');
const Course = require('../models/Course');
const { auth, requireFaculty } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/course-materials');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/mp4',
      'video/avi',
      'video/mov',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Get course materials for a course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const { type, isVisible } = req.query;
    let query = { course: req.params.courseId };

    if (type) query.type = type;
    if (isVisible !== undefined) query.isVisible = isVisible === 'true';

    const materials = await CourseMaterial.find(query)
      .populate('faculty', 'name email')
      .populate('course', 'courseCode courseName')
      .sort({ uploadedAt: -1 });

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get course material by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const material = await CourseMaterial.findById(req.params.id)
      .populate('faculty', 'name email')
      .populate('course', 'courseCode courseName');

    if (!material) {
      return res.status(404).json({ message: 'Course material not found' });
    }

    res.json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload course material (faculty only)
router.post('/', [auth, requireFaculty, upload.single('file')], async (req, res) => {
  try {
    const { courseId, title, description, type, externalLink, tags, semester, year, dueDate, maxMarks, instructions } = req.body;

    // Verify faculty is assigned to this course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to upload materials for this course' });
    }

    const materialData = {
      course: courseId,
      faculty: req.user._id,
      title,
      description,
      type,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      semester,
      year: year ? parseInt(year) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      maxMarks: maxMarks ? parseInt(maxMarks) : null,
      instructions
    };

    if (type === 'link') {
      materialData.externalLink = externalLink;
    } else if (req.file) {
      materialData.fileUrl = `/uploads/course-materials/${req.file.filename}`;
      materialData.fileName = req.file.originalname;
      materialData.fileSize = req.file.size;
    }

    const material = new CourseMaterial(materialData);
    const savedMaterial = await material.save();
    const populatedMaterial = await CourseMaterial.findById(savedMaterial._id)
      .populate('faculty', 'name email')
      .populate('course', 'courseCode courseName');

    res.status(201).json(populatedMaterial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update course material (faculty only)
router.put('/:id', [auth, requireFaculty, upload.single('file')], async (req, res) => {
  try {
    const material = await CourseMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Course material not found' });
    }

    // Check if faculty owns this material
    if (material.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this material' });
    }

    const { title, description, type, externalLink, tags, semester, year, dueDate, maxMarks, instructions, isVisible } = req.body;

    const updateData = {
      title,
      description,
      type,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : material.tags,
      semester,
      year: year ? parseInt(year) : material.year,
      dueDate: dueDate ? new Date(dueDate) : material.dueDate,
      maxMarks: maxMarks ? parseInt(maxMarks) : material.maxMarks,
      instructions,
      isVisible: isVisible !== undefined ? isVisible === 'true' : material.isVisible
    };

    if (type === 'link') {
      updateData.externalLink = externalLink;
      // Remove file data if changing to link
      if (material.fileUrl) {
        const filePath = path.join(__dirname, '..', material.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        updateData.fileUrl = null;
        updateData.fileName = null;
        updateData.fileSize = null;
      }
    } else if (req.file) {
      // Remove old file if uploading new one
      if (material.fileUrl) {
        const oldFilePath = path.join(__dirname, '..', material.fileUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      updateData.fileUrl = `/uploads/course-materials/${req.file.filename}`;
      updateData.fileName = req.file.originalname;
      updateData.fileSize = req.file.size;
      updateData.externalLink = null;
    }

    const updatedMaterial = await CourseMaterial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('faculty', 'name email')
      .populate('course', 'courseCode courseName');

    res.json(updatedMaterial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete course material (faculty only)
router.delete('/:id', [auth, requireFaculty], async (req, res) => {
  try {
    const material = await CourseMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Course material not found' });
    }

    // Check if faculty owns this material
    if (material.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this material' });
    }

    // Delete associated file if it exists
    if (material.fileUrl) {
      const filePath = path.join(__dirname, '..', material.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await CourseMaterial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course material deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download course material file
router.get('/:id/download', auth, async (req, res) => {
  try {
    const material = await CourseMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Course material not found' });
    }

    if (!material.fileUrl) {
      return res.status(404).json({ message: 'No file available for download' });
    }

    const filePath = path.join(__dirname, '..', material.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Increment download count
    material.downloadCount += 1;
    await material.save();

    res.download(filePath, material.fileName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get materials uploaded by faculty
router.get('/faculty/:facultyId', [auth, requireFaculty], async (req, res) => {
  try {
    // Only allow faculty to view their own materials
    if (req.user._id.toString() !== req.params.facultyId) {
      return res.status(403).json({ message: 'You can only view your own materials' });
    }

    const materials = await CourseMaterial.find({ faculty: req.params.facultyId })
      .populate('course', 'courseCode courseName')
      .sort({ uploadedAt: -1 });

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;