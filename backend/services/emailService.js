const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendRegistrationConfirmation(email, studentData) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to University Management System - Registration Confirmed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to University Management System!</h2>
          <p>Dear ${studentData.full_name},</p>
          <p>Your registration has been successfully submitted and is pending approval.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Registration Details:</h3>
            <p><strong>Registration ID:</strong> ${studentData.registration_id}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Course:</strong> ${studentData.course_id}</p>
            <p><strong>Department:</strong> ${studentData.department_id}</p>
          </div>
          <p>You will receive another email once your account is approved by the administration.</p>
          <p>Best regards,<br>University Management System Team</p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendApprovalNotification(email, studentData) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Account Approved - University Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Account Approved!</h2>
          <p>Dear ${studentData.full_name},</p>
          <p>Congratulations! Your account has been approved and you can now access the University Management System.</p>
          <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Registration ID:</strong> ${studentData.registration_id}</p>
            <p><strong>Login Email:</strong> ${email}</p>
          </div>
          <p>You can now log in to your account and access all student features.</p>
          <p>Best regards,<br>University Management System Team</p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendFeePaymentReceipt(email, paymentData) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Fee Payment Receipt - University Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Payment Receipt</h2>
          <p>Dear Student,</p>
          <p>Your fee payment has been successfully processed.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Payment Details:</h3>
            <p><strong>Receipt Number:</strong> ${paymentData.receipt_number}</p>
            <p><strong>Amount Paid:</strong> ₹${paymentData.amount}</p>
            <p><strong>Payment Mode:</strong> ${paymentData.payment_mode}</p>
            <p><strong>Transaction ID:</strong> ${paymentData.transaction_id}</p>
            <p><strong>Payment Date:</strong> ${new Date(paymentData.payment_date).toLocaleDateString()}</p>
          </div>
          <p>Thank you for your payment.</p>
          <p>Best regards,<br>University Management System Team</p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendResultNotification(email, resultData) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Exam Results Published - University Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Results Published</h2>
          <p>Dear Student,</p>
          <p>Your exam results have been published. You can now view your results in the student portal.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Result Details:</h3>
            <p><strong>Course:</strong> ${resultData.course_id}</p>
            <p><strong>Semester:</strong> ${resultData.semester}</p>
            <p><strong>Grade:</strong> ${resultData.grade}</p>
          </div>
          <p>Please log in to view your complete results and grade sheet.</p>
          <p>Best regards,<br>University Management System Team</p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendPasswordReset(email, resetToken) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset - University Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Password Reset Request</h2>
          <p>You have requested to reset your password.</p>
          <p>Please click the link below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <p>Best regards,<br>University Management System Team</p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();