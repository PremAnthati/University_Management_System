import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import './Dashboard.css';

interface Student {
  _id: string;
  name: string;
  full_name: string;
  email: string;
  status: string;
  registration_status: string;
  department: string | { _id: string; name: string; code: string };
  studentId: string;
  registration_id: string;
  year: number;
  semester: number;
  course_id: string;
  department_id: string;
  phone_number: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
  const [approvedStudents, setApprovedStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const [pendingResponse, approvedResponse] = await Promise.all([
        adminAPI.getPendingStudents(),
        adminAPI.getStudents()
      ]);

      setPendingStudents(pendingResponse.data);
      setApprovedStudents(approvedResponse.data.filter((s: Student) => s.registration_status === 'Approved'));
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      await adminAPI.approveStudent(id);
      await fetchStudents();
    } catch (error) {
      console.error('Error approving student:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoading(id);
      await adminAPI.rejectStudent(id);
      await fetchStudents();
    } catch (error) {
      console.error('Error rejecting student:', error);
    } finally {
      setActionLoading(null);
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h1 className="nav-title">
                    University Admin
                  </h1>
                  <p className="nav-subtitle">Management Portal</p>
                </div>
              </div>
            </div>
            <div className="nav-right">
              <div className="nav-status">
                <div className="status-indicator"></div>
                <span>System Online</span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="back-button"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div>
      <main className="main-content">
        <div className="content-wrapper">

          {/* Welcome Header */}
          <div className="welcome-section">
            <div className="welcome-content">
              <h2 className="welcome-title">
                Welcome to University Management
              </h2>
              <p className="welcome-description">
                Streamline your academic operations with our comprehensive management system.
                Monitor students, faculty, courses, and resources all in one place.
              </p>
            </div>
          </div>

          {/* Stats Overview Cards */}
          <div className="stats-grid">
            {/* Pending Approvals */}
            <div className="stat-card">
              <div className="stat-icon pending">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="stat-number">
                  {isLoading ? (
                    <div className="skeleton"></div>
                  ) : (
                    pendingStudents.length
                  )}
                </h3>
                <p className="stat-label">Pending Approvals</p>
                <div className="stat-footer">
                  <a href="/students" className="nav-link">
                    Manage Students →
                  </a>
                </div>
              </div>
            </div>

            {/* Course Management */}
            <div className="stat-card">
              <div className="stat-icon approved">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="stat-number">
                  Academic Planning
                </h3>
                <p className="stat-label">Course Management</p>
                <div className="stat-footer">
                  <div>
                    <a href="/courses" className="nav-link">
                    Manage Courses →
                  </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Faculty Management */}
            <div className="stat-card">
              <div className="stat-icon total">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="stat-number">
                  Staff & Instructors
                </h3>
                <p className="stat-label">Faculty Management</p>
                <div className="stat-footer">
                  <a href="/faculty" className="nav-link">
                    Manage Faculty →
                  </a>
                </div>
              </div>
            </div>

            {/* Attendance Tracking */}
            <div className="stat-card">
              <div className="stat-icon pending">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
              <div>
                <h3 className="stat-number">
                  Class Monitoring
                </h3>
                <p className="stat-label">Attendance Tracking</p>
                <div className="stat-footer">
                  <a href="/attendance" className="nav-link">
                    Track Attendance →
                  </a>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Additional Quick Actions */}
          <div className="stats-grid">
            {/* Resources */}
            <div className="stat-card">
              <div className="stat-icon approved">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h3 className="stat-number">
                  Equipment & Labs
                </h3>
                <p className="stat-label">Resource Management</p>
                <div className="stat-sublabel">Lab facilities</div>
                <div className="stat-footer">
                  <a href="/resources" className="nav-link">
                    Manage Resources →
                  </a>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="stat-card">
              <div className="stat-icon total">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h3 className="stat-number">
                  Stock Management
                </h3>
                <p className="stat-label">Inventory Control</p>
                <div className="stat-sublabel">Supply tracking</div>
                <div className="stat-footer">
                  <a href="/inventory" className="nav-link">
                    Manage Inventory →
                  </a>
                </div>
              </div>
            </div>

            {/* Announcements */}
            <div className="stat-card">
              <div className="stat-icon pending">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div>
                <h3 className="stat-number">
                  Real-time Broadcast
                </h3>
                <p className="stat-label">Announcements</p>
                <div className="stat-sublabel">Live communication</div>
                <div className="stat-footer">
                  <a href="/announcements" className="nav-link">
                    📢 Make Announcement →
                  </a>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="stat-card">
              <div className="stat-icon total">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21V9m0 0l8.539-3.539M12 9L3.461 5.461M21 5H3" />
                </svg>
              </div>
              <div>
                <h3 className="stat-number">
                  Message Center
                </h3>
                <p className="stat-label">Notifications</p>
                <div className="stat-sublabel">Personal messaging</div>
                <div className="stat-footer">
                  <a href="/notifications" className="nav-link">
                    Send Notifications →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Students Section */}
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
                    Pending Student Approvals
                  </h2>
                  <p className="section-subtitle">Review and manage student registration requests</p>
                </div>
              </div>
              <div className="section-badge">
                {pendingStudents.length} pending {pendingStudents.length === 1 ? 'request' : 'requests'}
              </div>
            </div>

            <div className="table-container">
              {isLoading ? (
                <div className="loading-skeleton">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton-row">
                      <div className="skeleton-avatar"></div>
                      <div className="skeleton-content">
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line short"></div>
                      </div>
                      <div className="skeleton-actions">
                        <div className="skeleton-button"></div>
                        <div className="skeleton-button"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : pendingStudents.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                  <h3 className="empty-state-title">All Caught Up!</h3>
                  </div>
                  <div>
                  <p className="empty-state-description">No pending student approvals at the moment. All registration requests have been processed successfully.</p>
                  </div>
                </div>
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="text-left">Student Details</th>
                        <th className="text-left">Contact Info</th>
                        <th className="text-left">Academic Info</th>
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
                                <div className="student-name">{student.full_name}</div>
                                <div className="student-email">ID: {student.registration_id}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="academic-info">
                              <div className="student-id">{student.email}</div>
                              <div className="student-department">{student.phone_number}</div>
                            </div>
                          </td>
                          <td>
                            <div className="academic-info">
                              <div className="student-id">{typeof student.department === 'object' ? student.department?.name || 'N/A' : student.department || 'N/A'}</div>
                              <div className="student-year">Year {student.year}, Semester {student.semester}</div>
                            </div>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                onClick={() => handleApprove(student._id)}
                                disabled={actionLoading === student._id}
                                className="action-btn approve"
                              >
                                {actionLoading === student._id ? (
                                  <div className="btn-loading"></div>
                                ) : (
                                  '✓ Approve'
                                )}
                              </button>
                              <button
                                onClick={() => handleReject(student._id)}
                                disabled={actionLoading === student._id}
                                className="action-btn reject"
                              >
                                {actionLoading === student._id ? (
                                  <div className="btn-loading"></div>
                                ) : (
                                  '✗ Reject'
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
};

export default Dashboard;