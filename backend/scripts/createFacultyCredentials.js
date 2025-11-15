const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Faculty = require('../models/Faculty');
require('dotenv').config();

const createFacultyCredentials = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/university_system');
    console.log('Connected to MongoDB');

    // Faculty credentials to create/update
    const facultyCredentials = [
      {
        email: 'rajesh.kumar@university.edu',
        password: 'faculty123',
        name: 'Dr. Rajesh Kumar'
      },
      {
        email: 'priya.sharma@university.edu',
        password: 'faculty123',
        name: 'Dr. Priya Sharma'
      },
      {
        email: 'amit.singh@university.edu',
        password: 'faculty123',
        name: 'Prof. Amit Singh'
      }
    ];

    for (const cred of facultyCredentials) {
      const faculty = await Faculty.findOne({ email: cred.email });

      if (faculty) {
        // Hash the password and update
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(cred.password, salt);

        faculty.password = hashedPassword;
        await faculty.save();

        console.log(`Updated password for ${cred.name}`);
      } else {
        console.log(`Faculty ${cred.name} not found. Run createSampleData.js first.`);
      }
    }

    console.log('\n=== FACULTY LOGIN CREDENTIALS ===');
    console.log('Use these credentials to login to the faculty portal:');
    console.log('');
    facultyCredentials.forEach(cred => {
      console.log(`${cred.name}:`);
      console.log(`  Email: ${cred.email}`);
      console.log(`  Password: ${cred.password}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating faculty credentials:', error);
    process.exit(1);
  }
};

createFacultyCredentials();