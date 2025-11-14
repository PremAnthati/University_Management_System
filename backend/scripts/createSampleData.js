const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Admin = require('../models/Admin');
require('dotenv').config();

const createSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/university_system');
    console.log('Connected to MongoDB');

    // Drop the entire database to avoid index conflicts
    await mongoose.connection.db.dropDatabase();
    console.log('Dropped existing database');

    // Create sample departments
    const departments = [
      {
        code: 'CSE',
        name: 'Computer Science and Engineering',
        description: 'Department of Computer Science and Engineering'
      },
      {
        code: 'IT',
        name: 'Information Technology',
        description: 'Department of Information Technology'
      },
      {
        code: 'ECE',
        name: 'Electronics and Communication Engineering',
        description: 'Department of Electronics and Communication Engineering'
      },
      {
        code: 'ME',
        name: 'Mechanical Engineering',
        description: 'Department of Mechanical Engineering'
      }
    ];

    const createdDepartments = await Department.insertMany(departments);
    console.log('Created departments:', createdDepartments.length);

    // Clear existing courses to recreate with new structure
    await Course.deleteMany({});
    console.log('Cleared existing courses');

    // Find departments by code
    console.log('Available departments:', createdDepartments.map(d => ({ code: d.code, name: d.name })));
    const cseDept = createdDepartments.find(d => d.code === 'CSE');
    const itDept = createdDepartments.find(d => d.code === 'IT');

    if (!cseDept || !itDept) {
      console.error('Required departments not found. CSE:', !!cseDept, 'IT:', !!itDept);
      return;
    }

    // Create sample faculty first
    const faculty = [
      {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@university.edu',
        facultyId: 'FAC001',
        department: cseDept._id,
        designation: 'Professor',
        phone: '+91-9876543210',
        qualifications: ['Ph.D. in Computer Science'],
        experience: 15,
        joiningDate: new Date('2010-01-15'),
        password: '$2a$10$hashedpassword1' // This would be properly hashed in real implementation
      },
      {
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@university.edu',
        facultyId: 'FAC002',
        department: cseDept._id,
        designation: 'Associate Professor',
        phone: '+91-9876543211',
        qualifications: ['Ph.D. in Data Science'],
        experience: 12,
        joiningDate: new Date('2013-08-01'),
        password: '$2a$10$hashedpassword2'
      },
      {
        name: 'Prof. Amit Singh',
        email: 'amit.singh@university.edu',
        facultyId: 'FAC003',
        department: itDept._id,
        designation: 'Assistant Professor',
        phone: '+91-9876543212',
        qualifications: ['M.Tech in Information Technology'],
        experience: 8,
        joiningDate: new Date('2017-06-15'),
        password: '$2a$10$hashedpassword3'
      }
    ];

    const createdFaculty = await Faculty.insertMany(faculty);
    console.log('Created faculty:', createdFaculty.length);

    // Create demo admin user
    const existingAdmin = await Admin.findOne({ email: 'admin@university.edu' });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      const admin = new Admin({
        username: 'admin',
        email: 'admin@university.edu',
        password: hashedPassword,
        role: 'admin'
      });

      await admin.save();
      console.log('Created demo admin user');
      console.log('Admin Email: admin@university.edu');
      console.log('Admin Password: admin123');
    } else {
      console.log('Demo admin user already exists');
    }

    // Create sample individual subjects/courses for different years and semesters
    const subjects = [
      // Year 1, Semester 1 - CSE
      {
        courseCode: 'CSE101',
        courseName: 'Introduction to Programming',
        description: 'Basic programming concepts using C language',
        department: cseDept._id,
        credits: 4,
        semester: '1',
        year: 1,
        faculty: createdFaculty[0]._id,
        maxStudents: 60,
        status: 'active',
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          startTime: '09:00',
          endTime: '10:30',
          classroom: 'CS-101'
        }
      },
      {
        courseCode: 'CSE102',
        courseName: 'Data Structures',
        description: 'Fundamental data structures and algorithms',
        department: cseDept._id,
        credits: 4,
        semester: '1',
        year: 1,
        faculty: createdFaculty[1]._id,
        maxStudents: 60,
        status: 'active',
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '11:00',
          endTime: '12:30',
          classroom: 'CS-102'
        }
      },
      {
        courseCode: 'CSE103',
        courseName: 'Discrete Mathematics',
        description: 'Mathematical foundations for computer science',
        department: cseDept._id,
        credits: 3,
        semester: '1',
        year: 1,
        faculty: createdFaculty[0]._id,
        maxStudents: 60,
        status: 'active',
        schedule: {
          days: ['Monday', 'Wednesday'],
          startTime: '14:00',
          endTime: '15:30',
          classroom: 'CS-103'
        }
      },

      // Year 1, Semester 2 - CSE
      {
        courseCode: 'CSE104',
        courseName: 'Object Oriented Programming',
        description: 'OOP concepts using Java',
        department: cseDept._id,
        credits: 4,
        semester: '2',
        year: 1,
        faculty: createdFaculty[1]._id,
        maxStudents: 60,
        status: 'active',
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          startTime: '09:00',
          endTime: '10:30',
          classroom: 'CS-104'
        }
      },
      {
        courseCode: 'CSE105',
        courseName: 'Database Management Systems',
        description: 'Introduction to databases and SQL',
        department: cseDept._id,
        credits: 4,
        semester: '2',
        year: 1,
        faculty: createdFaculty[0]._id,
        maxStudents: 60,
        status: 'active',
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '11:00',
          endTime: '12:30',
          classroom: 'CS-105'
        }
      },

      // Year 2, Semester 1 - CSE
      {
        courseCode: 'CSE201',
        courseName: 'Web Technologies',
        description: 'HTML, CSS, JavaScript and modern web development',
        department: cseDept._id,
        credits: 4,
        semester: '1',
        year: 2,
        faculty: createdFaculty[1]._id,
        maxStudents: 50,
        status: 'active',
        schedule: {
          days: ['Monday', 'Wednesday'],
          startTime: '09:00',
          endTime: '10:30',
          classroom: 'CS-201'
        }
      },
      {
        courseCode: 'CSE202',
        courseName: 'Computer Networks',
        description: 'Network fundamentals and protocols',
        department: cseDept._id,
        credits: 4,
        semester: '1',
        year: 2,
        faculty: createdFaculty[0]._id,
        maxStudents: 50,
        status: 'active',
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '11:00',
          endTime: '12:30',
          classroom: 'CS-202'
        }
      },

      // Year 2, Semester 2 - CSE
      {
        courseCode: 'CSE203',
        courseName: 'Software Engineering',
        description: 'Software development lifecycle and methodologies',
        department: cseDept._id,
        credits: 4,
        semester: '2',
        year: 2,
        faculty: createdFaculty[1]._id,
        maxStudents: 50,
        status: 'active',
        schedule: {
          days: ['Monday', 'Wednesday'],
          startTime: '14:00',
          endTime: '15:30',
          classroom: 'CS-203'
        }
      },
      {
        courseCode: 'CSE204',
        courseName: 'Machine Learning',
        description: 'Introduction to machine learning algorithms',
        department: cseDept._id,
        credits: 4,
        semester: '2',
        year: 2,
        faculty: createdFaculty[0]._id,
        maxStudents: 50,
        status: 'active',
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '16:00',
          endTime: '17:30',
          classroom: 'CS-204'
        }
      },

      // IT Department subjects
      {
        courseCode: 'IT101',
        courseName: 'Information Systems',
        description: 'Introduction to information systems and technology',
        department: itDept._id,
        credits: 3,
        semester: '1',
        year: 1,
        faculty: createdFaculty[2]._id,
        maxStudents: 50,
        status: 'active',
        schedule: {
          days: ['Monday', 'Wednesday'],
          startTime: '10:00',
          endTime: '11:30',
          classroom: 'IT-101'
        }
      },
      {
        courseCode: 'IT102',
        courseName: 'Cyber Security Fundamentals',
        description: 'Basic concepts of cyber security',
        department: itDept._id,
        credits: 3,
        semester: '2',
        year: 1,
        faculty: createdFaculty[2]._id,
        maxStudents: 50,
        status: 'active',
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '14:00',
          endTime: '15:30',
          classroom: 'IT-102'
        }
      },

      // Year 3, Semester 1 - CSE
      {
        courseCode: 'CSE301',
        courseName: 'Advanced Algorithms',
        description: 'Complex algorithms and optimization techniques',
        department: cseDept._id,
        credits: 4,
        semester: '1',
        year: 3,
        faculty: createdFaculty[0]._id,
        maxStudents: 40,
        status: 'active',
        schedule: {
          days: ['Monday', 'Wednesday'],
          startTime: '09:00',
          endTime: '10:30',
          classroom: 'CS-301'
        }
      },
      {
        courseCode: 'CSE302',
        courseName: 'Distributed Systems',
        description: 'Principles of distributed computing',
        department: cseDept._id,
        credits: 4,
        semester: '1',
        year: 3,
        faculty: createdFaculty[1]._id,
        maxStudents: 40,
        status: 'active',
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '11:00',
          endTime: '12:30',
          classroom: 'CS-302'
        }
      },

      // Year 3, Semester 2 - CSE
      {
        courseCode: 'CSE303',
        courseName: 'Computer Vision',
        description: 'Image processing and computer vision techniques',
        department: cseDept._id,
        credits: 4,
        semester: '2',
        year: 3,
        faculty: createdFaculty[0]._id,
        maxStudents: 40,
        status: 'active',
        schedule: {
          days: ['Monday', 'Wednesday'],
          startTime: '14:00',
          endTime: '15:30',
          classroom: 'CS-303'
        }
      },
      {
        courseCode: 'CSE304',
        courseName: 'Cloud Computing',
        description: 'Cloud architecture and deployment',
        department: cseDept._id,
        credits: 4,
        semester: '2',
        year: 3,
        faculty: createdFaculty[1]._id,
        maxStudents: 40,
        status: 'active',
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '16:00',
          endTime: '17:30',
          classroom: 'CS-304'
        }
      },

      // Year 4, Semester 1 - CSE
      {
        courseCode: 'CSE401',
        courseName: 'Thesis/Project Work',
        description: 'Final year project and thesis',
        department: cseDept._id,
        credits: 6,
        semester: '1',
        year: 4,
        faculty: createdFaculty[0]._id,
        maxStudents: 30,
        status: 'active',
        schedule: {
          days: ['Friday'],
          startTime: '10:00',
          endTime: '13:00',
          classroom: 'CS-401'
        }
      },
      {
        courseCode: 'CSE402',
        courseName: 'Advanced Topics in CS',
        description: 'Current trends and research in computer science',
        department: cseDept._id,
        credits: 4,
        semester: '1',
        year: 4,
        faculty: createdFaculty[1]._id,
        maxStudents: 30,
        status: 'active',
        schedule: {
          days: ['Monday', 'Wednesday'],
          startTime: '09:00',
          endTime: '10:30',
          classroom: 'CS-402'
        }
      }
    ];

    const createdCourses = await Course.insertMany(subjects);
    console.log('Created subjects/courses:', createdCourses.length);

    // Enroll existing students in appropriate courses based on their year/semester
    const existingStudents = await Student.find({ registration_status: 'Approved' });
    if (existingStudents.length > 0) {
      console.log('Enrolling existing students in courses...');

      for (const student of existingStudents) {
        // Find courses for the student's year and semester
        const studentCourses = createdCourses.filter(course =>
          course.year === student.year && course.semester === student.semester
        );

        // Enroll student in these courses
        for (const course of studentCourses) {
          if (!student.enrolledCourses.includes(course._id)) {
            student.enrolledCourses.push(course._id);
            course.enrolledStudents.push(student._id);
          }
        }

        await student.save();
        await Course.updateMany(
          { _id: { $in: studentCourses.map(c => c._id) } },
          { $addToSet: { enrolledStudents: student._id } }
        );
      }

      console.log(`Enrolled ${existingStudents.length} students in appropriate courses`);
    }

    console.log('Sample data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample data:', error);
    process.exit(1);
  }
};

createSampleData();