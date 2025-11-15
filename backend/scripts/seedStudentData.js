const mongoose = require('mongoose');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Result = require('../models/Result');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const Faculty = require('../models/Faculty');

async function seedStudentData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/university_system');

    console.log('🌱 Starting student data seeding...');

    // Get all approved students
    const students = await Student.find({ registration_status: 'Approved' });
    console.log(`Found ${students.length} approved students`);

    // Get faculty for attendance marking
    const faculty = await Faculty.findOne();
    if (!faculty) {
      console.error('No faculty found. Please run createSampleData.js first.');
      return;
    }

    for (const student of students) {
      console.log(`Processing student: ${student.full_name} (${student.year}-${student.semester})`);

      // First, enroll student in courses for their year/semester if not already enrolled
      const availableCourses = await Course.find({
        year: student.year,
        semester: student.semester.toString(),
        status: 'active'
      }).limit(3); // Enroll in up to 3 courses

      for (const course of availableCourses) {
        if (!student.enrolledCourses.includes(course._id)) {
          student.enrolledCourses.push(course._id);
          course.enrolledStudents.push(student._id);
          await course.save();
          console.log(`✓ Enrolled ${student.full_name} in ${course.courseCode}`);
        }
      }

      await student.save();

      // Get student's enrolled courses for their year/semester
      const enrolledCourses = await Course.find({
        _id: { $in: student.enrolledCourses },
        year: student.year,
        semester: student.semester.toString()
      });

      console.log(`Found ${enrolledCourses.length} enrolled courses for student`);

      // 1. Create Results for each enrolled course
      for (const course of enrolledCourses) {
        // Check if result already exists
        const existingResult = await Result.findOne({
          student_id: student._id,
          course_id: course._id,
          semester: student.semester,
          year: student.year
        });

        if (!existingResult) {
          // Generate random marks
          const internalMarks = Math.floor(Math.random() * 41) + 10; // 10-50
          const externalMarks = Math.floor(Math.random() * 51) + 20; // 20-70
          const totalMarks = internalMarks + externalMarks;

          // Calculate grade
          let grade, status;
          if (totalMarks >= 90) grade = 'A+';
          else if (totalMarks >= 80) grade = 'A';
          else if (totalMarks >= 70) grade = 'B+';
          else if (totalMarks >= 60) grade = 'B';
          else if (totalMarks >= 50) grade = 'C';
          else grade = 'F';

          status = grade !== 'F' ? 'Pass' : 'Fail';

          const result = new Result({
            student_id: student._id,
            course_id: course._id,
            semester: student.semester,
            year: student.year,
            exam_type: 'Final',
            internal_marks: internalMarks,
            external_marks: externalMarks,
            total_marks: totalMarks,
            grade: grade,
            credits: course.credits,
            status: status
          });

          await result.save();
          console.log(`✓ Created result for ${course.courseCode}: ${grade} (${totalMarks})`);
        }
      }

      // 2. Create Attendance records for each enrolled course
      for (const course of enrolledCourses) {
        // Generate attendance for last 30 days
        const today = new Date();
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);

          // Skip weekends for simplicity
          if (date.getDay() === 0 || date.getDay() === 6) continue;

          // Check if attendance already exists
          const existingAttendance = await Attendance.findOne({
            student_id: student._id,
            course_id: course._id,
            date: date
          });

          if (!existingAttendance) {
            // 85% chance of being present
            const isPresent = Math.random() < 0.85;
            const status = isPresent ? 'Present' : (Math.random() < 0.5 ? 'Absent' : 'Leave');

            const attendance = new Attendance({
              student_id: student._id,
              course_id: course._id,
              date: date,
              status: status,
              marked_by: faculty._id
            });

            await attendance.save();
          }
        }
      }
      console.log(`✓ Created attendance records for ${enrolledCourses.length} courses`);

      // 3. Create Fee record for current semester/year
      const existingFee = await Fee.findOne({
        student_id: student._id,
        semester: student.semester,
        year: student.year
      });

      if (!existingFee) {
        // Generate fee amounts
        const tuitionFee = 50000; // Base tuition
        const labFee = enrolledCourses.some(c => c.courseCode.includes('LAB')) ? 5000 : 0;
        const libraryFee = 2000;
        const otherFees = 3000;
        const totalAmount = tuitionFee + labFee + libraryFee + otherFees;

        // 70% chance of partial payment
        const paymentRatio = Math.random();
        let paidAmount, pendingAmount, status;

        if (paymentRatio < 0.3) {
          paidAmount = 0;
          pendingAmount = totalAmount;
          status = 'Pending';
        } else if (paymentRatio < 0.7) {
          paidAmount = Math.floor(totalAmount * 0.5);
          pendingAmount = totalAmount - paidAmount;
          status = 'Partial';
        } else {
          paidAmount = totalAmount;
          pendingAmount = 0;
          status = 'Paid';
        }

        const fee = new Fee({
          student_id: student._id,
          semester: student.semester,
          year: student.year,
          tuition_fee: tuitionFee,
          lab_fee: labFee,
          library_fee: libraryFee,
          other_fees: otherFees,
          total_amount: totalAmount,
          paid_amount: paidAmount,
          pending_amount: pendingAmount,
          status: status
        });

        await fee.save();
        console.log(`✓ Created fee record: ₹${totalAmount} (${status})`);
      }
    }

    console.log('✅ Student data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding student data:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the script
seedStudentData();