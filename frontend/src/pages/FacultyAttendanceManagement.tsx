import React, { useEffect, useState } from 'react';
import { facultyAPI } from '../services/api';
import './FacultyAttendanceManagement.css';

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  department: {
    _id: string;
    name: string;
    code: string;
  };
  credits: number;
  enrolledStudents: any[];
  semester: string;
  year: number;
}

interface Student {
  _id: string;
  full_name: string;
  email: string;
  registration_id: string;
}

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  registrationId: string;
  status: 'Present' | 'Absent' | 'Leave';
  remarks: string;
}

interface AttendanceSummary {
  student: Student;
  totalClasses: number;
  present: number;
  absent: number;
  leave: number;
  percentage: number;
}

const FacultyAttendanceManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'mark' | 'view'>('mark');

  // Form data for marking attendance
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsForCourse();
      if (viewMode === 'view') {
        fetchAttendanceSummary();
      }
    }
  }, [selectedCourse, viewMode]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await facultyAPI.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForCourse = async () => {
    try {
      const response = await facultyAPI.getStudentsForCourse(selectedCourse);
      const courseStudents = response.data;

      // Initialize attendance records for all students
      const records: AttendanceRecord[] = courseStudents.map((student: Student) => ({
        studentId: student._id,
        studentName: student.full_name,
        registrationId: student.registration_id,
        status: 'Present' as const,
        remarks: ''
      }));

      setStudents(courseStudents);
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAttendanceSummary = async () => {
    try {
      const response = await facultyAPI.getAttendanceSummary(selectedCourse);
      setAttendanceSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
    }
  };

  const handleAttendanceChange = (studentId: string, field: 'status' | 'remarks', value: string | boolean) => {
    if (field === 'status' && typeof value === 'boolean') {
      // Handle checkbox changes
      const currentRecord = attendanceRecords.find(r => r.studentId === studentId);
      if (!currentRecord) return;

      let newStatus: 'Present' | 'Absent' | 'Leave' = 'Absent';
      if (value === true && field === 'status') {
        // This is a checkbox toggle, determine which one
        // We'll need to pass the specific status type
        return;
      }
    }

    setAttendanceRecords(prev =>
      prev.map(record =>
        record.studentId === studentId
          ? { ...record, [field]: value }
          : record
      )
    );
  };

  const handleStatusCheckboxChange = (studentId: string, statusType: 'Present' | 'Leave', checked: boolean) => {
    setAttendanceRecords(prev =>
      prev.map(record => {
        if (record.studentId === studentId) {
          let newStatus: 'Present' | 'Absent' | 'Leave' = 'Absent';
          if (checked) {
            newStatus = statusType;
          }
          // If checked, it sets to that status; if unchecked, it becomes Absent
          return { ...record, status: newStatus };
        }
        return record;
      })
    );
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse || !attendanceDate) {
      alert('Please select a course and date');
      return;
    }

    try {
      setSubmitting(true);

      const attendanceData = {
        courseId: selectedCourse,
        date: attendanceDate,
        attendanceData: attendanceRecords.map(record => ({
          studentId: record.studentId,
          status: record.status,
          remarks: record.remarks
        }))
      };

      await facultyAPI.markAttendance(attendanceData);

      alert('Attendance marked successfully!');

      // Reset form
      setAttendanceDate(new Date().toISOString().split('T')[0]);
      fetchStudentsForCourse(); // Refresh the records

    } catch (error: any) {
      console.error('Error marking attendance:', error);
      alert(error.response?.data?.message || 'Failed to mark attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return '#10b981';
      case 'Absent': return '#ef4444';
      case 'Leave': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 85) return '#10b981';
    if (percentage >= 75) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="faculty-attendance-loading">
        <div className="loading-spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="faculty-attendance-management">
      <div className="header">
        <h1>Attendance Management</h1>
        <p>Mark attendance and view attendance records for your courses</p>
      </div>

      {/* Course Selection */}
      <div className="course-selection">
        <div className="form-group">
          <label htmlFor="course">Select Course:</label>
          <select
            id="course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select a course...</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.courseCode} - {course.courseName} ({course.enrolledStudents.length} students)
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCourse && (
        <>
          {/* View Mode Toggle */}
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'mark' ? 'active' : ''}`}
              onClick={() => setViewMode('mark')}
            >
              Mark Attendance
            </button>
            <button
              className={`toggle-btn ${viewMode === 'view' ? 'active' : ''}`}
              onClick={() => setViewMode('view')}
            >
              View Records
            </button>
          </div>

          {viewMode === 'mark' ? (
            /* Mark Attendance Mode */
            <form onSubmit={handleSubmitAttendance} className="attendance-form">
              <div className="form-section">
                <h2>Mark Attendance</h2>

                <div className="date-selection">
                  <label htmlFor="attendanceDate">Date:</label>
                  <input
                    type="date"
                    id="attendanceDate"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="attendance-table-container">
                  <table className="attendance-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Registration ID</th>
                        <th>Present</th>
                        <th>Leave</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map(record => (
                        <tr key={record.studentId}>
                          <td>{record.studentName}</td>
                          <td>{record.registrationId}</td>
                          <td>
                            <input
                              type="checkbox"
                              checked={record.status === 'Present'}
                              onChange={(e) => handleStatusCheckboxChange(record.studentId, 'Present', e.target.checked)}
                              style={{ transform: 'scale(1.2)' }}
                            />
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              checked={record.status === 'Leave'}
                              onChange={(e) => handleStatusCheckboxChange(record.studentId, 'Leave', e.target.checked)}
                              style={{ transform: 'scale(1.2)' }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={record.remarks}
                              onChange={(e) => handleAttendanceChange(record.studentId, 'remarks', e.target.value)}
                              placeholder="Optional remarks"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? 'Marking Attendance...' : 'Mark Attendance'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* View Records Mode */
            <div className="attendance-summary">
              <div className="summary-header">
                <h2>Attendance Summary</h2>
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Students:</span>
                    <span className="stat-value">{attendanceSummary.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Average Attendance:</span>
                    <span className="stat-value">
                      {attendanceSummary.length > 0
                        ? (attendanceSummary.reduce((sum, student) => sum + student.percentage, 0) / attendanceSummary.length).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="summary-table-container">
                <table className="summary-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Registration ID</th>
                      <th>Total Classes</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Leave</th>
                      <th>Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceSummary.map(student => (
                      <tr key={student.student._id}>
                        <td>{student.student.full_name}</td>
                        <td>{student.student.registration_id}</td>
                        <td>{student.totalClasses}</td>
                        <td style={{ color: '#10b981', fontWeight: 'bold' }}>{student.present}</td>
                        <td style={{ color: '#ef4444', fontWeight: 'bold' }}>{student.absent}</td>
                        <td style={{ color: '#f59e0b', fontWeight: 'bold' }}>{student.leave}</td>
                        <td>
                          <span
                            style={{
                              color: getPercentageColor(student.percentage),
                              fontWeight: 'bold',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              backgroundColor: getPercentageColor(student.percentage) + '20'
                            }}
                          >
                            {student.percentage.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FacultyAttendanceManagement;