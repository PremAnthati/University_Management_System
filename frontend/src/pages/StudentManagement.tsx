import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import './StudentManagement.css';

interface Student {
  _id: string;
  name: string;
  full_name: string;
  email: string;
  status: string;
  registration_status: string;
  department: string;
  studentId: string;
  registration_id: string;
  year: number;
  semester: number;
  phone_number: string;
  created_at: string;
}

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const [allResponse, pendingResponse] = await Promise.all([
        adminAPI.getStudents(),
        adminAPI.getPendingStudents()
      ]);
      setStudents(allResponse.data);
      setPendingStudents(pendingResponse.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await adminAPI.approveStudent(id);
      fetchStudents();
    } catch (error) {
      console.error('Error approving student:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await adminAPI.rejectStudent(id);
      fetchStudents();
    } catch (error) {
      console.error('Error rejecting student:', error);
    }
  };

  return (
    <div className="student-management-container">
      {/* Advanced Navigation with Glassmorphism */}
      <nav className="glass-nav">
        <div className="nav-container">
          <div className="nav-content">
            <div className="nav-left">
              <div className="nav-logo-container">
                <div className="nav-logo">
                  <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="nav-title">
                    Student Management
                  </h1>
                  <p className="nav-subtitle">Manage student registrations and approvals</p>
                </div>
              </div>
            </div>
            <div className="nav-right">
              <div className="nav-status">
                <div className="status-indicator"></div>
                <span>System Online</span>
              </div>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="back-button"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="content-wrapper">

          {/* Stats Overview Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon pending">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="stat-number">{pendingStudents.length}</h3>
              <p className="stat-label">Pending Approvals</p>
              <div className="stat-sublabel">Awaiting review</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon approved">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="stat-number">
                {students.filter(s => s.registration_status === 'Approved').length}
              </h3>
              <p className="stat-label">Approved Students</p>
              <div className="stat-sublabel">Active enrollments</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon total">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="stat-number">{students.length}</h3>
              <p className="stat-label">Total Students</p>
              <div className="stat-sublabel">All registered users</div>
            </div>
          </div>

          {/* Pending Approvals Section */}
          <div className="section">
            <div className="section-header">
              <div className="section-title-container">
                <div className="section-icon pending">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="section-title">
                    Pending Approvals
                  </h2>
                  <p className="section-subtitle">Review and approve student registration requests</p>
                </div>
              </div>
              <div className="section-badge">
                {pendingStudents.length} pending
              </div>
            </div>

            <div className="table-container">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left">Student Details</th>
                      <th className="text-left">Academic Info</th>
                      <th className="text-left">Status</th>
                      <th className="text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingStudents.map((student, index) => (
                      <tr key={student._id} style={{ animationDelay: `${index * 0.1}s` }}>
                        <td>
                          <div className="student-info">
                            <div className="student-avatar pending">
                              {(student.full_name || student.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="student-name">{student.full_name || student.name || 'Unknown Student'}</div>
                              <div className="student-email">{student.email}</div>
                              <div className="student-phone">{student.phone_number}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <div className="student-id">{student.registration_id}</div>
                            <div className="student-department">{student.department}</div>
                            <div className="student-year">Year {student.year}, Semester {student.semester}</div>
                          </div>
                        </td>
                        <td>
                          <span className="status-badge pending">
                            Pending Review
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleApprove(student._id)}
                              className="action-btn approve"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleReject(student._id)}
                              className="action-btn reject"
                            >
                              ✗ Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {pendingStudents.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="empty-state-title">All Caught Up!</h3>
                <p className="empty-state-description">No pending student approvals at the moment. All registration requests have been processed.</p>
              </div>
            )}
          </div>

          {/* All Students Section */}
          <div className="section" style={{ animationDelay: '0.2s' }}>
            <div className="section-header">
              <div className="section-title-container">
                <div className="section-icon students">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="section-title students">
                    All Students
                  </h2>
                  <p className="section-subtitle">Complete overview of all registered students</p>
                </div>
              </div>
              <div className="section-badge">
                {students.length} total students
              </div>
            </div>

            <div className="table-container">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left">Student Details</th>
                      <th className="text-left">Academic Info</th>
                      <th className="text-left">Status</th>
                      <th className="text-left">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student._id} style={{ animationDelay: `${index * 0.05}s` }}>
                        <td>
                          <div className="student-info">
                            <div className={`student-avatar ${
                              student.registration_status === 'Approved' ? 'approved' :
                              student.registration_status === 'Rejected' ? 'rejected' :
                              student.registration_status === 'Graduated' ? 'graduated' :
                              student.registration_status === 'Withdrawn' ? 'withdrawn' :
                              'default'
                            }`}>
                              {(student.full_name || student.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="student-name">{student.full_name || student.name || 'Unknown Student'}</div>
                              <div className="student-email">{student.email}</div>
                              <div className="student-phone">{student.phone_number}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <div className="student-id">{student.registration_id}</div>
                            <div className="student-department">{student.department}</div>
                            <div className="student-year">Year {student.year}, Semester {student.semester}</div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${student.registration_status.toLowerCase()}`}>
                            {student.registration_status}
                          </span>
                        </td>
                        <td className="student-year">
                          {new Date(student.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentManagement;