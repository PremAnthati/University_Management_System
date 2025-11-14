const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Department = require('../models/Department');
const Course = require('../models/Course');

async function createDemoStudent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/university_system');

    // Delete existing demo student if exists
    await Student.deleteOne({ email: 'demo@student.com' });
    console.log('Cleared existing demo student');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('demo123', salt);

    // Find existing department
    const department = await Department.findOne({ code: 'CSE' });
    if (!department) {
      console.error('CSE department not found. Please run createSampleData.js first.');
      return;
    }

    // Create demo student
    const demoStudent = new Student({
      registration_id: 'DEMO2024001',
      email: 'demo@student.com',
      password: hashedPassword,
      full_name: 'Demo Student',
      phone_number: '9876543210',
      date_of_birth: new Date('2000-01-15'),
      gender: 'Male',
      address: '123 Demo Street, Demo City',
      city: 'Demo City',
      state: 'Demo State',
      pincode: '110001',
      department_id: department._id,
      year: 2,
      semester: '1',
      registration_status: 'Approved',
      status: 'approved',
      role: 'student',
      isActive: true
    });

    const savedStudent = await demoStudent.save();

    // Enroll in some courses
    const courses = await Course.find({
      year: 2,
      semester: '1',
      department: department._id
    }).limit(2);

    for (const course of courses) {
      if (course.enrolledStudents.length < course.maxStudents) {
        savedStudent.enrolledCourses.push(course._id);
        course.enrolledStudents.push(savedStudent._id);
        await course.save();
      }
    }

    await savedStudent.save();

    console.log('✅ Demo student created successfully!');
    console.log('📧 Email: demo@student.com');
    console.log('🔒 Password: demo123');
    console.log('🆔 Registration ID:', savedStudent.registration_id);
    console.log('📱 Phone: 9876543210');
    console.log('🎓 Status: Approved (can login immediately)');
    console.log('📚 Enrolled in', savedStudent.enrolledCourses.length, 'courses');

  } catch (error) {
    console.error('❌ Error creating demo student:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the script
createDemoStudent();