const mongoose = require('mongoose');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Result = require('../models/Result');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const Department = require('../models/Department');
require('dotenv').config();

const getStudentData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/university_system');
    console.log('Connected to MongoDB');

    // Get all students
    const students = await Student.find({})
      .populate('department_id', 'name code')
      .populate('course_id', 'courseCode courseName')
      .populate('enrolledCourses', 'courseCode courseName')
      .sort({ created_at: -1 });

    console.log('\n=== STUDENT DATA FROM DATABASE ===');
    console.log(`Total Students: ${students.length}\n`);

    if (students.length === 0) {
      console.log('❌ No students found in database.');
      console.log('💡 Run the following scripts to populate data:');
      console.log('   1. node scripts/createSampleData.js');
      console.log('   2. node scripts/createDemoStudent.js');
      console.log('   3. node scripts/createFacultyCredentials.js');
      console.log('   4. node scripts/seedStudentData.js');
      return;
    }

    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.full_name}`);
      console.log(`   📧 Email: ${student.email}`);
      console.log(`   🆔 Registration ID: ${student.registration_id}`);
      console.log(`   📱 Phone: ${student.phone_number}`);
      console.log(`   🎓 Year: ${student.year}, Semester: ${student.semester}`);
      console.log(`   📍 Department: ${student.department_id?.name || 'N/A'} (${student.department_id?.code || 'N/A'})`);
      console.log(`   ✅ Status: ${student.registration_status}`);
      console.log(`   📚 Enrolled Courses: ${student.enrolledCourses.length}`);
      console.log(`   💰 Academic Info: GPA ${student.academicInfo?.gpa || 'N/A'}, Credits: ${student.academicInfo?.totalCredits || 0}`);
      console.log('');
    });

    // Get approved students for login
    const approvedStudents = students.filter(s => s.registration_status === 'Approved');
    console.log('\n=== APPROVED STUDENTS (CAN LOGIN) ===');
    console.log(`Approved Students: ${approvedStudents.length}\n`);

    approvedStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.full_name}`);
      console.log(`   📧 Email: ${student.email}`);
      console.log(`   🔒 Password: student123 (default)`);
      console.log(`   🆔 Registration ID: ${student.registration_id}`);
      console.log(`   📱 Phone: ${student.phone_number}`);
      console.log('');
    });

    // Get sample student details with full data
    if (approvedStudents.length > 0) {
      const sampleStudent = approvedStudents[0];
      console.log('\n=== SAMPLE STUDENT DETAILED INFO ===');
      console.log(`Name: ${sampleStudent.full_name}`);
      console.log(`Email: ${sampleStudent.email}`);
      console.log(`Registration ID: ${sampleStudent.registration_id}`);
      console.log(`Phone: ${sampleStudent.phone_number}`);
      console.log(`Date of Birth: ${sampleStudent.date_of_birth.toLocaleDateString()}`);
      console.log(`Gender: ${sampleStudent.gender}`);
      console.log(`Address: ${sampleStudent.address}, ${sampleStudent.city}, ${sampleStudent.state} - ${sampleStudent.pincode}`);
      console.log(`Year: ${sampleStudent.year}, Semester: ${sampleStudent.semester}`);
      console.log(`Department: ${sampleStudent.department_id?.name} (${sampleStudent.department_id?.code})`);
      console.log(`Status: ${sampleStudent.registration_status}`);

      // Get enrolled courses
      const enrolledCourses = await Course.find({
        _id: { $in: sampleStudent.enrolledCourses }
      });

      console.log(`\nEnrolled Courses (${enrolledCourses.length}):`);
      enrolledCourses.forEach(course => {
        console.log(`  - ${course.courseCode}: ${course.courseName} (${course.credits} credits)`);
      });

      // Get results
      const results = await Result.find({
        student_id: sampleStudent._id
      }).populate('course_id', 'courseCode courseName');

      console.log(`\nAcademic Results (${results.length}):`);
      results.forEach(result => {
        console.log(`  - ${result.course_id.courseCode}: ${result.grade} (${result.total_marks} marks)`);
      });

      // Get attendance summary
      const attendanceRecords = await Attendance.find({
        student_id: sampleStudent._id
      });

      const totalClasses = attendanceRecords.length;
      const presentCount = attendanceRecords.filter(a => a.status === 'Present').length;
      const attendancePercentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : 0;

      console.log(`\nAttendance Summary:`);
      console.log(`  - Total Classes: ${totalClasses}`);
      console.log(`  - Present: ${presentCount}`);
      console.log(`  - Attendance: ${attendancePercentage}%`);

      // Get fee information
      const fees = await Fee.find({
        student_id: sampleStudent._id
      });

      console.log(`\nFee Information (${fees.length} records):`);
      fees.forEach(fee => {
        console.log(`  - Semester ${fee.semester}/${fee.year}: ₹${fee.total_amount} (${fee.status})`);
        console.log(`    Paid: ₹${fee.paid_amount}, Pending: ₹${fee.pending_amount}`);
      });
    }

    console.log('\n=== LOGIN CREDENTIALS SUMMARY ===');
    console.log('Admin:');
    console.log('  Email: admin@university.edu');
    console.log('  Password: admin123');
    console.log('');
    console.log('Faculty:');
    console.log('  Email: rajesh.kumar@university.edu');
    console.log('  Password: faculty123');
    console.log('');
    console.log('Students:');
    console.log('  Email: [student email from above]');
    console.log('  Password: student123 (default for all students)');

  } catch (error) {
    console.error('Error retrieving student data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

getStudentData();