import React, { useEffect, useState, useContext } from 'react';
import { studentAPI } from '../services/api';
import StudentLayout, { AcademicContext } from '../components/StudentLayout';
import './StudentFees.css';

interface Fee {
  _id: string;
  semester: number;
  year: number;
  tuition_fee: number;
  lab_fee: number;
  library_fee: number;
  other_fees: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  status: string;
  created_at: string;
}

interface FeePayment {
  _id: string;
  amount: number;
  payment_mode: string;
  transaction_id: string;
  payment_date: string;
  receipt_number: string;
  status: string;
}

const StudentFees: React.FC = () => {
  const { selectedYear, selectedSemester } = useContext(AcademicContext) || {};
  const [fees, setFees] = useState<Fee[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMode: 'Credit Card'
  });

  useEffect(() => {
    fetchFeeData();
  }, []);

  const fetchFeeData = async () => {
    try {
      const studentData = JSON.parse(localStorage.getItem('student') || '{}');
      const params = selectedYear || selectedSemester ? {
        ...(selectedYear && { year: selectedYear }),
        ...(selectedSemester && { semester: selectedSemester })
      } : undefined;

      const [feesRes, paymentsRes] = await Promise.all([
        studentAPI.getFees(studentData.id, params),
        studentAPI.getFeePayments(studentData.id)
      ]);
      setFees(feesRes.data?.data || []);
      setPayments(paymentsRes.data || []);
    } catch (error) {
      console.error('Error fetching fee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;

    try {
      await studentAPI.payFee({
        fee_id: selectedFee._id,
        student_id: JSON.parse(localStorage.getItem('student') || '{}').id,
        amount: parseFloat(paymentData.amount),
        payment_mode: paymentData.paymentMode
      });

      alert('Payment successful!');
      setShowPaymentForm(false);
      setSelectedFee(null);
      fetchFeeData();
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const downloadReceipt = (paymentId: string) => {
    // Implementation for downloading receipt
    alert('Receipt download functionality would be implemented here');
  };

  if (loading) {
    return <div className="loading">Loading fee information...</div>;
  }

  const totalPending = fees.reduce((sum, fee) => sum + parseFloat(fee.pending_amount?.toString() || '0'), 0);

  return (
    <StudentLayout activePage="fees">
      <div className="student-fees">
      <div className="fees-header">
        <h1>Fee Management</h1>
        <div className="fee-summary">
          <div className="summary-item">
            <span className="label">Total Pending:</span>
            <span className="amount pending">₹{totalPending}</span>
          </div>
        </div>
      </div>

      <div className="fees-content">
        <div className="fee-structure">
          <h2>Fee Structure</h2>
          <div className="fees-table">
            <table>
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Year</th>
                  <th>Tuition Fee</th>
                  <th>Lab Fee</th>
                  <th>Library Fee</th>
                  <th>Other Fees</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Pending Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.map(fee => (
                  <tr key={fee._id}>
                    <td>{fee.semester}</td>
                    <td>{fee.year}</td>
                    <td>₹{fee.tuition_fee}</td>
                    <td>₹{fee.lab_fee}</td>
                    <td>₹{fee.library_fee}</td>
                    <td>₹{fee.other_fees}</td>
                    <td>₹{fee.total_amount}</td>
                    <td>₹{fee.paid_amount}</td>
                    <td>₹{fee.pending_amount}</td>
                    <td>
                      <span className={`status ${fee.status.toLowerCase()}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td>
                      {parseFloat(fee.pending_amount?.toString() || '0') > 0 && (
                        <button
                          onClick={() => {
                            setSelectedFee(fee);
                            setPaymentData({ ...paymentData, amount: fee.pending_amount.toString() });
                            setShowPaymentForm(true);
                          }}
                          className="pay-btn"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="payment-history">
          <h2>Payment History</h2>
          <div className="payments-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment Mode</th>
                  <th>Transaction ID</th>
                  <th>Receipt Number</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment._id}>
                    <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td>₹{payment.amount}</td>
                    <td>{payment.payment_mode}</td>
                    <td>{payment.transaction_id}</td>
                    <td>{payment.receipt_number}</td>
                    <td>
                      <span className={`status ${payment.status.toLowerCase()}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => downloadReceipt(payment._id)}
                        className="download-btn"
                      >
                        Download Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showPaymentForm && selectedFee && (
        <div className="payment-modal">
          <div className="modal-content">
            <h3>Make Payment</h3>
            <form onSubmit={handlePayment}>
              <div className="form-group">
                <label>Fee Details</label>
                <p>Semester {selectedFee.semester}, Year {selectedFee.year}</p>
                <p>Pending Amount: ₹{selectedFee.pending_amount}</p>
              </div>

              <div className="form-group">
                <label>Payment Amount</label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  required
                  min="1"
                  max={selectedFee.pending_amount.toString()}
                />
              </div>

              <div className="form-group">
                <label>Payment Mode</label>
                <select
                  value={paymentData.paymentMode}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })}
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="UPI">UPI</option>
                  <option value="Wallet">Wallet</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowPaymentForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="pay-btn">
                  Pay ₹{paymentData.amount}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </StudentLayout>
  );
};

export default StudentFees;