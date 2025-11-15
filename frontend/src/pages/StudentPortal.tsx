import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './StudentPortal.css';

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  department: string;
  credits: number;
  faculty: {
    name: string;
    email: string;
  };
  semester: string;
  year: number;
  enrolledStudents: any[];
  maxStudents: number;
  status: string;
}

interface Grade {
  course: {
    courseCode: string;
    courseName: string;
    credits: number;
  };
  assessmentType: string;
  assessmentName: string;
  score: number;
  maxScore: number;
  grade: string;
  gradePoints: number;
  gradedDate: string;
}

interface AttendanceSummary {
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercentage: number;
}

const StudentPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<any>(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      // Get student info from token (assuming student ID is stored)
      const token = localStorage.getItem('token');
      if (!token) return;

      // For demo purposes, using a hardcoded student ID
      // In real implementation, decode JWT to get student ID
      const studentId = '507f1f77bcf86cd799439011'; // Replace with actual student ID from token

      // First get student info to know their year and semester
      const gradesRes = await api.get(`/students/${studentId}/grades`);
      const student = gradesRes.data.student;
      setStudentInfo(student);

      // Get all courses and filter by student's year and semester
      const coursesRes = await api.get('/courses');
      const filteredCourses = coursesRes.data.filter((course: Course) =>
        course.status === 'active' &&
        course.year === student.year &&
        course.semester === student.semester.toString()
      );
      setAvailableCourses(filteredCourses);

      // Get enrolled courses
      const enrolledRes = await api.get(`/students/${studentId}/courses`);
      setEnrolledCourses(enrolledRes.data);

      // Get attendance
      const attendanceRes = await api.get(`/students/${studentId}/attendance`);
      setAttendance(attendanceRes.data.summary);

      setGrades(gradesRes.data.grades || []);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const studentId = '507f1f77bcf86cd799439011'; // Replace with actual student ID
      await api.post(`/students/${studentId}/enroll/${courseId}`);
      fetchStudentData();
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const handleUnenroll = async (courseId: string) => {
    if (window.confirm('Are you sure you want to unenroll from this course?')) {
      try {
        const studentId = '507f1f77bcf86cd799439011'; // Replace with actual student ID
        await api.post(`/students/${studentId}/unenroll/${courseId}`);
        fetchStudentData();
      } catch (error) {
        console.error('Error unenrolling from course:', error);
      }
    }
  };

  const calculateGPA = () => {
    if (grades.length === 0) return 0;
    const totalCredits = grades.reduce((sum, grade) => sum + grade.course.credits, 0);
    const weightedPoints = grades.reduce((sum, grade) => sum + (grade.gradePoints * grade.course.credits), 0);
    return totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : 0;
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
                    Student Portal
                  </h1>
                  <p className="nav-subtitle">Access your academic information</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="stat-number">{enrolledCourses.length}</h3>
              <p className="stat-label">Enrolled Courses</p>
              <div className="stat-sublabel">Current semester</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon approved">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="stat-number">{calculateGPA()}</h3>
              <p className="stat-label">Current GPA</p>
              <div className="stat-sublabel">Grade point average</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon total">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="stat-number">{attendance?.attendancePercentage || 0}%</h3>
              <p className="stat-label">Attendance Rate</p>
              <div className="stat-sublabel">Overall attendance</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <nav className="tab-nav">
              {[
                { id: 'courses', label: 'My Courses' },
                { id: 'enrollment', label: 'Course Enrollment' },
                { id: 'grades', label: 'Grades' },
                { id: 'attendance', label: 'Attendance' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'courses' && (
            <div className="section">
              <div className="section-header">
                <div className="section-title-container">
                  <div className="section-icon pending">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="section-title">
                      My Enrolled Courses
                    </h2>
                    <p className="section-subtitle">Courses you're currently enrolled in</p>
                  </div>
                </div>
                <div className="section-badge">
                  {enrolledCourses.length} enrolled
                </div>
              </div>

              <div className="table-container">
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="text-left">Course Details</th>
                        <th className="text-left">Academic Info</th>
                        <th className="text-left">Faculty & Enrollment</th>
                        <th className="text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrolledCourses.map((course, index) => (
                        <tr key={course._id} style={{ animationDelay: `${index * 0.1}s` }}>
                          <td>
                            <div className="student-info">
                              <div className="student-avatar pending">
                                {course.courseCode.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="student-name">{course.courseName}</div>
                                <div className="student-email">{course.courseCode}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="academic-info">
                              <div className="student-id">{course.department}</div>
                              <div className="student-department">{course.credits} credits</div>
                              <div className="student-year">{course.semester}</div>
                            </div>
                          </td>
                          <td>
                            <div className="academic-info">
                              <div className="student-id">{course.faculty?.name || 'TBA'}</div>
                              <div className="student-department">{course.enrolledStudents.length}/{course.maxStudents} enrolled</div>
                            </div>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                onClick={() => handleUnenroll(course._id)}
                                className="action-btn reject"
                              >
                                🚪 Unenroll
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {enrolledCourses.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="empty-state-title">No Enrolled Courses</h3>
                  <p className="empty-state-description">You haven't enrolled in any courses yet. Visit the Course Enrollment tab to get started.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'enrollment' && (
            <div className="section">
              <div className="section-header">
                <div className="section-title-container">
                  <div className="section-icon approved">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="section-title approved">
                      Available Courses
                    </h2>
                    <p className="section-subtitle">Browse and enroll in available courses</p>
                  </div>
                </div>
                <div className="section-badge">
                  {availableCourses.length} available
                </div>
              </div>

              <div className="table-container">
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="text-left">Course Details</th>
                        <th className="text-left">Academic Info</th>
                        <th className="text-left">Faculty & Capacity</th>
                        <th className="text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableCourses.map((course, index) => {
                          const isEnrolled = enrolledCourses.some(ec => ec._id === course._id);
                          const isFull = course.enrolledStudents.length >= course.maxStudents;

                          return (
                            <tr key={course._id} style={{ animationDelay: `${index * 0.1}s` }}>
                              <td>
                                <div className="student-info">
                                  <div className="student-avatar approved">
                                    {course.courseCode.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="student-name">{course.courseName}</div>
                                    <div className="student-email">{course.courseCode}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="academic-info">
                                  <div className="student-id">{course.department}</div>
                                  <div className="student-department">{course.credits} credits</div>
                                  <div className="student-year">{course.semester}</div>
                                </div>
                              </td>
                              <td>
                                <div className="academic-info">
                                  <div className="student-id">{course.faculty?.name || 'TBA'}</div>
                                  <div className="student-department">{course.enrolledStudents.length}/{course.maxStudents} enrolled</div>
                                  <span className={`status-badge ${isFull ? 'rejected' : 'approved'}`}>
                                    {isFull ? 'Full' : 'Available'}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  {isEnrolled ? (
                                    <button
                                      onClick={() => handleUnenroll(course._id)}
                                      className="action-btn reject"
                                    >
                                      🚪 Unenroll
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleEnroll(course._id)}
                                      disabled={isFull}
                                      className={`action-btn ${isFull ? 'reject' : 'approve'}`}
                                    >
                                      {isFull ? '❌ Full' : '✅ Enroll'}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="section">
              <div className="section-header">
                <div className="section-title-container">
                  <div className="section-icon total">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="section-title total">
                      Grade Summary
                    </h2>
                    <p className="section-subtitle">Your academic performance overview</p>
                  </div>
                </div>
                <div className="section-badge">
                  GPA: {calculateGPA()}
                </div>
              </div>

              <div className="table-container">
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="text-left">Course Details</th>
                        <th className="text-left">Assessment Info</th>
                        <th className="text-left">Score & Grade</th>
                        <th className="text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade, index) => (
                        <tr key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                          <td>
                            <div className="student-info">
                              <div className="student-avatar total">
                                {grade.course.courseCode.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="student-name">{grade.course.courseName}</div>
                                <div className="student-email">{grade.course.courseCode}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="academic-info">
                              <div className="student-id">{grade.assessmentName}</div>
                              <div className="student-department">{grade.assessmentType.charAt(0).toUpperCase() + grade.assessmentType.slice(1)}</div>
                            </div>
                          </td>
                          <td>
                            <div className="academic-info">
                              <div className="student-id">{grade.score}/{grade.maxScore}</div>
                              <span className={`status-badge ${grade.grade.startsWith('A') ? 'approved' : grade.grade.startsWith('B') ? 'pending' : 'rejected'}`}>
                                {grade.grade}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="student-name">{new Date(grade.gradedDate).toLocaleDateString()}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {grades.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="empty-state-title">No Grades Available</h3>
                  <p className="empty-state-description">Your grades will appear here once assessments are graded by your instructors.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'attendance' && attendance && (
            <div className="section">
              <div className="section-header">
                <div className="section-title-container">
                  <div className="section-icon pending">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="section-title">
                      Attendance Overview
                    </h2>
                    <p className="section-subtitle">Your class attendance statistics</p>
                  </div>
                </div>
                <div className="section-badge">
                  {attendance.attendancePercentage}% rate
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon approved">
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="stat-number">{attendance.present}</h3>
                  <p className="stat-label">Present</p>
                  <div className="stat-sublabel">Classes attended</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon rejected">
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="stat-number">{attendance.absent}</h3>
                  <p className="stat-label">Absent</p>
                  <div className="stat-sublabel">Classes missed</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon pending">
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="stat-number">{attendance.late}</h3>
                  <p className="stat-label">Late</p>
                  <div className="stat-sublabel">Arrived late</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentPortal;