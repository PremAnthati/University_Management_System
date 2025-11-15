const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReportService {
  // Generate grade sheet PDF
  async generateGradeSheet(results, studentInfo) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const fileName = `grade_sheet_${studentInfo.studentId}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../reports', fileName);

        // Ensure reports directory exists
        if (!fs.existsSync(path.join(__dirname, '../reports'))) {
          fs.mkdirSync(path.join(__dirname, '../reports'), { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('University Management System', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text('Grade Sheet', { align: 'center' });
        doc.moveDown();

        // Student Information
        doc.fontSize(12);
        doc.text(`Student Name: ${studentInfo.name}`);
        doc.text(`Student ID: ${studentInfo.studentId}`);
        doc.text(`Department: ${studentInfo.department}`);
        doc.moveDown();

        // Results Table
        const tableTop = 200;
        const tableLeft = 50;

        // Table headers
        doc.fontSize(10);
        doc.text('Course Code', tableLeft, tableTop);
        doc.text('Course Name', tableLeft + 100, tableTop);
        doc.text('Credits', tableLeft + 250, tableTop);
        doc.text('Grade', tableLeft + 320, tableTop);
        doc.text('Grade Points', tableLeft + 380, tableTop);

        // Table rows
        let yPosition = tableTop + 20;
        results.forEach(result => {
          doc.text(result.course.courseCode, tableLeft, yPosition);
          doc.text(result.course.courseName, tableLeft + 100, yPosition);
          doc.text(result.course.credits.toString(), tableLeft + 250, yPosition);
          doc.text(result.grade, tableLeft + 320, yPosition);
          doc.text(result.gradePoints.toString(), tableLeft + 380, yPosition);
          yPosition += 20;
        });

        // GPA Summary
        doc.moveDown(2);
        const totalCredits = results.reduce((sum, r) => sum + r.course.credits, 0);
        const weightedPoints = results.reduce((sum, r) => sum + (r.gradePoints * r.course.credits), 0);
        const gpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : 0;

        doc.text(`Total Credits: ${totalCredits}`);
        doc.text(`GPA: ${gpa}`);

        // Footer
        doc.moveDown(2);
        doc.fontSize(8).text('Generated on: ' + new Date().toLocaleDateString(), { align: 'center' });

        doc.end();

        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate fee receipt PDF
  async generateFeeReceipt(paymentData, studentInfo) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const fileName = `fee_receipt_${paymentData.receipt_number}.pdf`;
        const filePath = path.join(__dirname, '../receipts', fileName);

        // Ensure receipts directory exists
        if (!fs.existsSync(path.join(__dirname, '../receipts'))) {
          fs.mkdirSync(path.join(__dirname, '../receipts'), { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('University Management System', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text('Fee Payment Receipt', { align: 'center' });
        doc.moveDown();

        // Receipt details
        doc.fontSize(12);
        doc.text(`Receipt Number: ${paymentData.receipt_number}`);
        doc.text(`Date: ${new Date(paymentData.payment_date).toLocaleDateString()}`);
        doc.moveDown();

        // Student Information
        doc.text(`Student Name: ${studentInfo.name}`);
        doc.text(`Student ID: ${studentInfo.studentId}`);
        doc.moveDown();

        // Payment Details
        doc.text(`Amount Paid: ₹${paymentData.amount}`);
        doc.text(`Payment Mode: ${paymentData.payment_mode}`);
        doc.text(`Transaction ID: ${paymentData.transaction_id}`);
        doc.text(`Status: ${paymentData.status}`);
        doc.moveDown();

        // Footer
        doc.fontSize(10).text('Thank you for your payment!', { align: 'center' });
        doc.moveDown();
        doc.fontSize(8).text('This is a computer generated receipt.', { align: 'center' });

        doc.end();

        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate attendance report PDF
  async generateAttendanceReport(attendanceData, studentInfo) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const fileName = `attendance_report_${studentInfo.studentId}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../reports', fileName);

        // Ensure reports directory exists
        if (!fs.existsSync(path.join(__dirname, '../reports'))) {
          fs.mkdirSync(path.join(__dirname, '../reports'), { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('University Management System', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text('Attendance Report', { align: 'center' });
        doc.moveDown();

        // Student Information
        doc.fontSize(12);
        doc.text(`Student Name: ${studentInfo.name}`);
        doc.text(`Student ID: ${studentInfo.studentId}`);
        doc.text(`Department: ${studentInfo.department}`);
        doc.moveDown();

        // Attendance Summary
        doc.text(`Total Classes: ${attendanceData.totalClasses}`);
        doc.text(`Present: ${attendanceData.present}`);
        doc.text(`Absent: ${attendanceData.absent}`);
        doc.text(`Late: ${attendanceData.late}`);
        doc.text(`Excused: ${attendanceData.excused}`);
        doc.text(`Attendance Percentage: ${attendanceData.attendancePercentage}%`);
        doc.moveDown();

        // Detailed attendance table would go here
        // For brevity, just showing summary

        // Footer
        doc.moveDown(2);
        doc.fontSize(8).text('Generated on: ' + new Date().toLocaleDateString(), { align: 'center' });

        doc.end();

        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Export timetable as PDF
  async generateTimetablePDF(timetableData, studentInfo) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const fileName = `timetable_${studentInfo.studentId}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../timetables', fileName);

        // Ensure timetables directory exists
        if (!fs.existsSync(path.join(__dirname, '../timetables'))) {
          fs.mkdirSync(path.join(__dirname, '../timetables'), { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('University Management System', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text('Class Timetable', { align: 'center' });
        doc.moveDown();

        // Student Information
        doc.fontSize(12);
        doc.text(`Student Name: ${studentInfo.name}`);
        doc.text(`Student ID: ${studentInfo.studentId}`);
        doc.moveDown();

        // Timetable content would go here
        // For brevity, just showing basic structure

        doc.text('Timetable details would be displayed here in a formatted table.');

        // Footer
        doc.moveDown(2);
        doc.fontSize(8).text('Generated on: ' + new Date().toLocaleDateString(), { align: 'center' });

        doc.end();

        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new ReportService();