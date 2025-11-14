const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const FeePayment = require('../models/FeePayment');
const Student = require('../models/Student');
const { auth } = require('../middleware/auth');
const emailService = require('../services/emailService');
const paymentService = require('../services/paymentService');
const reportService = require('../services/reportService');

// Get all fees (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { student_id, status, academic_year } = req.query;
    let query = {};

    if (student_id) query.student_id = student_id;
    if (status) query.status = status;
    if (academic_year) query.academic_year = academic_year;

    const fees = await Fee.find(query)
      .populate('student_id', 'full_name registration_id email')
      .sort({ created_at: -1 });

    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get fee by ID (admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id)
      .populate('student_id', 'full_name registration_id email');

    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new fee (admin)
router.post('/', auth, async (req, res) => {
  try {
    const fee = new Fee(req.body);
    const savedFee = await fee.save();
    const populatedFee = await Fee.findById(savedFee._id)
      .populate('student_id', 'full_name registration_id email');

    res.status(201).json(populatedFee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update fee (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('student_id', 'full_name registration_id email');

    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    res.json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete fee (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);

    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    res.json({ message: 'Fee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student fees
router.get('/student/:id/fees', auth, async (req, res) => {
  try {
    const { year, semester } = req.query;
    let query = { student_id: req.params.id };

    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);

    const fees = await Fee.find(query).sort({ created_at: -1 });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get fee payments
router.get('/student/:id/fee-payments', auth, async (req, res) => {
  try {
    const payments = await FeePayment.find({ student_id: req.params.id });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Process fee payment
router.post('/student/pay-fee', auth, async (req, res) => {
  try {
    const { fee_id, amount, payment_mode } = req.body;
    const payment = new FeePayment({
      fee_id,
      student_id: req.body.student_id,
      amount,
      payment_mode,
      transaction_id: 'TXN' + Date.now(),
      receipt_number: 'RCP' + Date.now(),
      status: 'Success'
    });
    await payment.save();

    // Update fee status
    const fee = await Fee.findById(fee_id);
    if (fee) {
      fee.paid_amount += amount;
      fee.pending_amount = fee.total_amount - fee.paid_amount;
      if (fee.pending_amount <= 0) {
        fee.status = 'Paid';
      } else {
        fee.status = 'Partial';
      }
      await fee.save();
    }

    // Send payment receipt email
    try {
      const student = await Student.findById(payment.student_id);
      if (student) {
        await emailService.sendFeePaymentReceipt(student.email, payment);
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({ message: 'Payment successful', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download receipt
router.get('/student/payment-receipt/:id', auth, async (req, res) => {
  try {
    const payment = await FeePayment.findById(req.params.id);
    const student = await Student.findById(payment.student_id);

    if (!payment || !student) {
      return res.status(404).json({ message: 'Payment or student not found' });
    }

    const filePath = await reportService.generateFeeReceipt(payment, {
      name: student.full_name,
      studentId: student.registration_id
    });

    res.download(filePath, `fee_receipt_${payment.receipt_number}.pdf`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create payment order
router.post('/create-payment-order', auth, async (req, res) => {
  try {
    const { amount, feeId } = req.body;
    const receipt = `receipt_${Date.now()}`;

    const order = await paymentService.createOrder(amount, 'INR', receipt);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify and process payment
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { orderId, paymentId, signature, amount, feeId } = req.body;
    const studentId = req.body.student_id; // From auth middleware

    const payment = await paymentService.processPayment({
      orderId,
      paymentId,
      signature,
      amount,
      studentId,
      feeId
    });

    // Send payment receipt email
    try {
      const student = await Student.findById(studentId);
      if (student) {
        await emailService.sendFeePaymentReceipt(student.email, payment);
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({ message: 'Payment verified and processed successfully', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;