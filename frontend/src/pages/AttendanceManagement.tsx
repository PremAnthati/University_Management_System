import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './AttendanceManagement.css';

interface Attendance {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    studentId: string;
  };
  course: {
    _id: string;
    courseCode: string;
    courseName: string;
  };
  faculty: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
  status: string;
  classType: string;
  duration: number;
  remarks: string;
  markedDate: string;
}

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  enrolledStudents: any[];
}

const AttendanceManagement: React.FC = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bulkAttendance, setBulkAttendance] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    classType: 'lecture',
    duration: 60,
    remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attendanceRes, coursesRes] = await Promise.all([
        api.get('/attendance'),
        api.get('/courses')
      ]);
      setAttendance(attendanceRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/attendance', {
        ...formData,
        courseId: selectedCourse,
        facultyId: '507f1f77bcf86cd799439011' // Replace with actual faculty ID from auth
      });
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const handleBulkSubmit = async () => {
    if (!selectedCourse || bulkAttendance.length === 0) return;

    try {
      const attendanceData = bulkAttendance.map(record => ({
        studentId: record.studentId,
        courseId: selectedCourse,
        facultyId: '507f1f77bcf86cd799439011', // Replace with actual faculty ID
        date: selectedDate,
        status: record.status,
        classType: formData.classType,
        duration: formData.duration,
        remarks: record.remarks || ''
      }));

      await api.post('/attendance/bulk', {
        courseId: selectedCourse,
        facultyId: '507f1f77bcf86cd799439011',
        date: selectedDate,
        classType: formData.classType,
        attendanceData
      });

      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error marking bulk attendance:', error);
    }
  };

  const initializeBulkAttendance = () => {
    if (!selectedCourse) return;

    const course = courses.find(c => c._id === selectedCourse);
    if (!course) return;

    const initialAttendance = course.enrolledStudents.map((student: any) => ({
      studentId: student._id,
      studentName: student.name,
      studentIdDisplay: student.studentId,
      status: 'present',
      remarks: ''
    }));

    setBulkAttendance(initialAttendance);
  };

  const updateBulkAttendance = (studentId: string, field: string, value: any) => {
    setBulkAttendance(prev =>
      prev.map(record =>
        record.studentId === studentId
          ? { ...record, [field]: value }
          : record
      )
    );
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      courseId: '',
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      classType: 'lecture',
      duration: 60,
      remarks: ''
    });
    setSelectedCourse('');
    setBulkAttendance([]);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'status-present';
      case 'absent': return 'status-absent';
      case 'late': return 'status-late';
      case 'excused': return 'status-excused';
      default: return 'status-present';
    }
  };

  const getClassTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'class-lecture';
      case 'lab': return 'class-lab';
      case 'tutorial': return 'class-tutorial';
      case 'seminar': return 'class-seminar';
      default: return 'class-lecture';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

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
                    Attendance Management
                  </h1>
                  <p className="nav-subtitle">Track and manage class attendance records</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="stat-number">{attendance.filter(a => a.status === 'present').length}</h3>
              <p className="stat-label">Present Today</p>
              <div className="stat-sublabel">Active attendance</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon approved">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="stat-number">{attendance.length}</h3>
              <p className="stat-label">Total Records</p>
              <div className="stat-sublabel">All attendance entries</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon total">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="stat-number">{courses.length}</h3>
              <p className="stat-label">Active Courses</p>
              <div className="stat-sublabel">Courses with attendance</div>
            </div>
          </div>

          {/* Attendance Form Modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">
                    Mark Attendance
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="modal-close"
                  >
                    ×
                  </button>
                </div>

                <div className="modal-body">
                  {/* Course and Date Selection */}
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Course</label>
                      <select
                        className="input-field"
                        value={selectedCourse}
                        onChange={(e) => {
                          setSelectedCourse(e.target.value);
                          setBulkAttendance([]);
                        }}
                        required
                      >
                        <option value="">Select Course</option>
                        {courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.courseCode} - {course.courseName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="input-field"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Class Type</label>
                      <select
                        className="input-field"
                        value={formData.classType}
                        onChange={(e) => setFormData({...formData, classType: e.target.value})}
                      >
                        <option value="lecture">Lecture</option>
                        <option value="lab">Lab</option>
                        <option value="tutorial">Tutorial</option>
                        <option value="seminar">Seminar</option>
                      </select>
                    </div>
                  </div>

                  {/* Bulk Attendance Section */}
                  {selectedCourse && (
                    <div className="bulk-attendance-section">
                      <div className="bulk-header">
                        <h3 className="bulk-title">Mark Attendance for All Students</h3>
                        <button
                          type="button"
                          onClick={initializeBulkAttendance}
                          className="btn-secondary text-sm"
                        >
                          Load Students
                        </button>
                      </div>

                      {bulkAttendance.length > 0 && (
                        <div className="table-container">
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Student</th>
                                <th>Status</th>
                                <th>Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bulkAttendance.map((record) => (
                                <tr key={record.studentId}>
                                  <td>
                                    <div className="student-info">
                                      <div className="info-primary">{record.studentName}</div>
                                      <div className="info-secondary">{record.studentIdDisplay}</div>
                                    </div>
                                  </td>
                                  <td>
                                    <select
                                      className="input-field text-sm"
                                      value={record.status}
                                      onChange={(e) => updateBulkAttendance(record.studentId, 'status', e.target.value)}
                                    >
                                      <option value="present">Present</option>
                                      <option value="absent">Absent</option>
                                      <option value="late">Late</option>
                                      <option value="excused">Excused</option>
                                    </select>
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      className="input-field text-sm"
                                      placeholder="Optional remarks"
                                      value={record.remarks}
                                      onChange={(e) => updateBulkAttendance(record.studentId, 'remarks', e.target.value)}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    {bulkAttendance.length > 0 ? (
                      <button
                        type="button"
                        onClick={handleBulkSubmit}
                        className="btn-primary"
                      >
                        Save Bulk Attendance
                      </button>
                    ) : (
                      <button
                        type="submit"
                        onClick={handleSubmit}
                        className="btn-primary"
                      >
                        Mark Attendance
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Records Section */}
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
                    Attendance Records
                  </h2>
                  <p className="section-subtitle">View and manage all attendance records</p>
                </div>
              </div>
              <div className="section-badge">
                {attendance.length} records
              </div>
            </div>

            <div className="table-container">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left">Student Details</th>
                      <th className="text-left">Course Info</th>
                      <th className="text-left">Date & Status</th>
                      <th className="text-left">Class Details</th>
                      <th className="text-left">Faculty</th>
                      <th className="text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record, index) => (
                      <tr key={record._id} style={{ animationDelay: `${index * 0.1}s` }}>
                        <td>
                          <div className="student-info">
                            <div className="student-avatar pending">
                              {(record.student?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="student-name">{record.student.name}</div>
                              <div className="student-email">{record.student.studentId}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <div className="student-id">{record.course.courseCode}</div>
                            <div className="student-department">{record.course.courseName}</div>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <div className="student-id">{new Date(record.date).toLocaleDateString()}</div>
                            <span className={`status-badge ${record.status}`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <div className="student-id">{record.classType.charAt(0).toUpperCase() + record.classType.slice(1)}</div>
                            <div className="student-year">{record.duration} minutes</div>
                          </div>
                        </td>
                        <td>
                          <div className="student-name">{record.faculty.name}</div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => {/* Handle edit */}}
                              className="action-btn approve"
                            >
                              ✏ Edit
                            </button>
                            <button
                              onClick={() => {/* Handle delete */}}
                              className="action-btn reject"
                            >
                              🗑 Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {attendance.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="empty-state-title">No Attendance Records</h3>
                <p className="empty-state-description">Start by marking attendance for your classes. All records will appear here.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="back-button"
                >
                  Mark First Attendance
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendanceManagement;