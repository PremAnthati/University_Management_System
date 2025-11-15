const axios = require('axios');

class PaymentService {
  constructor() {
    this.razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    this.razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    this.baseURL = 'https://api.razorpay.com/v1';
  }

  // Create payment order
  async createOrder(amount, currency = 'INR', receipt) {
    try {
      const auth = Buffer.from(`${this.razorpayKeyId}:${this.razorpayKeySecret}`).toString('base64');

      const response = await axios.post(`${this.baseURL}/orders`, {
        amount: amount * 100, // Razorpay expects amount in paisa
        currency,
        receipt,
        payment_capture: 1
      }, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        id: response.data.id,
        amount: response.data.amount,
        currency: response.data.currency,
        receipt: response.data.receipt,
        status: response.data.status
      };
    } catch (error) {
      throw new Error(`Payment order creation failed: ${error.response?.data?.error?.description || error.message}`);
    }
  }

  // Verify payment
  async verifyPayment(orderId, paymentId, signature) {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.razorpayKeySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      throw new Error('Payment verification failed');
    }
  }

  // Get payment details
  async getPayment(paymentId) {
    try {
      const auth = Buffer.from(`${this.razorpayKeyId}:${this.razorpayKeySecret}`).toString('base64');

      const response = await axios.get(`${this.baseURL}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });

      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch payment details');
    }
  }

  // Refund payment
  async refundPayment(paymentId, amount = null) {
    try {
      const auth = Buffer.from(`${this.razorpayKeyId}:${this.razorpayKeySecret}`).toString('base64');

      const refundData = amount ? { amount: amount * 100 } : {};

      const response = await axios.post(`${this.baseURL}/payments/${paymentId}/refund`, refundData, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Refund failed: ${error.response?.data?.error?.description || error.message}`);
    }
  }

  // Process payment (simplified for demo - in production, use webhooks)
  async processPayment(paymentData) {
    const { orderId, paymentId, signature, amount, studentId, feeId } = paymentData;

    // Verify payment signature
    const isValid = await this.verifyPayment(orderId, paymentId, signature);

    if (!isValid) {
      throw new Error('Payment verification failed');
    }

    // Create payment record in database
    const FeePayment = require('../models/FeePayment');
    const payment = new FeePayment({
      fee_id: feeId,
      student_id: studentId,
      amount: amount,
      payment_mode: 'Razorpay',
      transaction_id: paymentId,
      receipt_number: `RCP${Date.now()}`,
      status: 'Success'
    });

    await payment.save();

    // Update fee status
    const Fee = require('../models/Fee');
    const fee = await Fee.findById(feeId);
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

    return payment;
  }
}

module.exports = new PaymentService();