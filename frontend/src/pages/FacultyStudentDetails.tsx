import React, { useEffect, useState } from 'react';
import { facultyAPI } from '../services/api';
import './FacultyStudentDetails.css';

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  department: string;
  credits: number;
  enrolledStudents: string[];
  semester: string;
  year: number;
}

interface Student {
  _id: string;
  full_name: string;
  email: string;
  registration_id: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  department: string | { _id: string; name: string; code: string };
  course_id: string | { _id: string; courseCode: string; courseName: string };
  year: number;
  semester: number;
  profile_photo?: string;
  registration_status: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  academicInfo?: {
    gpa: number;
    totalCredits: number;
    major?: string;
    minor?: string;
  };
  enrolledCourses: Array<{
    _id: string;
    courseCode: string;
    courseName: string;
  }>;
  completedCourses: Array<{
    course: {
      _id: string;
      courseCode: string;
      courseName: string;
    };
    grade: string;
    gradePoints: number;
    semester: string;
    year: number;
  }>;
}

const FacultyStudentDetails: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsForCourse();
    }
  }, [selectedCourse]);

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
      setLoading(true);
      const response = await facultyAPI.getStudentsForCourse(selectedCourse);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId: string) => {
    try {
      setLoading(true);
      const response = await facultyAPI.getStudentDetails(studentId);
      setSelectedStudent(response.data);
      setViewMode('detail');
    } catch (error) {
      console.error('Error fetching student details:', error);
      alert('Failed to load student details.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    setViewMode('list');
  };

  const formatDepartment = (department: string | { _id: string; name: string; code: string }): string => {
    if (typeof department === 'object' && department?.name) {
      return department.name;
    }
    return typeof department === 'string' ? department : 'N/A';
  };

  const formatCourse = (course: string | { _id: string; courseCode: string; courseName: string }): string => {
    if (typeof course === 'object' && course?.courseName) {
      return `${course.courseCode} - ${course.courseName}`;
    }
    return typeof course === 'string' ? course : 'N/A';
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  if (loading && viewMode === 'list') {
    return (
      <div className="faculty-students-loading">
        <div className="loading-spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="faculty-student-details">
      <div className="header">
        <h1>Student Details</h1>
        <p>View profiles and academic records of students in your courses</p>
      </div>

      {viewMode === 'list' ? (
        /* Student List View */
        <>
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
            <div className="students-section">
              <h2>Enrolled Students ({students.length})</h2>

              {students.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>No students enrolled</h3>
                  <p>This course currently has no enrolled students.</p>
                </div>
              ) : (
                <div className="students-grid">
                  {students.map(student => (
                    <div key={student._id} className="student-card">
                      <div className="student-header">
                        <div className="student-avatar">
                          {student.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="student-basic-info">
                          <h3>{student.full_name}</h3>
                          <p className="registration-id">ID: {student.registration_id}</p>
                          <p className="email">{student.email}</p>
                        </div>
                      </div>

                      <div className="student-details">
                        <div className="detail-row">
                          <span className="label">Phone:</span>
                          <span className="value">{student.phone_number}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Year/Semester:</span>
                          <span className="value">Year {student.year}, Semester {student.semester}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Department:</span>
                          <span className="value">{formatDepartment(student.department)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Status:</span>
                          <span className={`status-badge ${student.registration_status.toLowerCase()}`}>
                            {student.registration_status}
                          </span>
                        </div>
                      </div>

                      <div className="student-actions">
                        <button
                          className="btn-primary"
                          onClick={() => fetchStudentDetails(student._id)}
                        >
                          View Full Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* Student Detail View */
        selectedStudent && (
          <div className="student-detail-view">
            <div className="detail-header">
              <button className="back-btn" onClick={handleBackToList}>
                ← Back to Student List
              </button>
              <h2>{selectedStudent.full_name}'s Profile</h2>
            </div>

            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <div className="student-profile">
                {/* Personal Information */}
                <div className="profile-section">
                  <h3>Personal Information</h3>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <label>Full Name:</label>
                      <span>{selectedStudent.full_name}</span>
                    </div>
                    <div className="profile-item">
                      <label>Registration ID:</label>
                      <span>{selectedStudent.registration_id}</span>
                    </div>
                    <div className="profile-item">
                      <label>Email:</label>
                      <span>{selectedStudent.email}</span>
                    </div>
                    <div className="profile-item">
                      <label>Phone:</label>
                      <span>{selectedStudent.phone_number}</span>
                    </div>
                    <div className="profile-item">
                      <label>Date of Birth:</label>
                      <span>{new Date(selectedStudent.date_of_birth).toLocaleDateString()} ({calculateAge(selectedStudent.date_of_birth)} years old)</span>
                    </div>
                    <div className="profile-item">
                      <label>Gender:</label>
                      <span>{selectedStudent.gender}</span>
                    </div>
                    <div className="profile-item">
                      <label>Address:</label>
                      <span>{selectedStudent.address}, {selectedStudent.city}, {selectedStudent.state} - {selectedStudent.pincode}</span>
                    </div>
                    <div className="profile-item">
                      <label>Registration Status:</label>
                      <span className={`status-badge ${selectedStudent.registration_status.toLowerCase()}`}>
                        {selectedStudent.registration_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                {selectedStudent.emergencyContact && (
                  <div className="profile-section">
                    <h3>Emergency Contact</h3>
                    <div className="profile-grid">
                      <div className="profile-item">
                        <label>Name:</label>
                        <span>{selectedStudent.emergencyContact.name}</span>
                      </div>
                      <div className="profile-item">
                        <label>Relationship:</label>
                        <span>{selectedStudent.emergencyContact.relationship}</span>
                      </div>
                      <div className="profile-item">
                        <label>Phone:</label>
                        <span>{selectedStudent.emergencyContact.phone}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Academic Information */}
                <div className="profile-section">
                  <h3>Academic Information</h3>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <label>Current Year:</label>
                      <span>Year {selectedStudent.year}</span>
                    </div>
                    <div className="profile-item">
                      <label>Current Semester:</label>
                      <span>Semester {selectedStudent.semester}</span>
                    </div>
                    <div className="profile-item">
                      <label>Department:</label>
                      <span>{formatDepartment(selectedStudent.department)}</span>
                    </div>
                    <div className="profile-item">
                      <label>Course:</label>
                      <span>{formatCourse(selectedStudent.course_id)}</span>
                    </div>
                    {selectedStudent.academicInfo && (
                      <>
                        <div className="profile-item">
                          <label>Current GPA:</label>
                          <span>{selectedStudent.academicInfo.gpa.toFixed(2)}</span>
                        </div>
                        <div className="profile-item">
                          <label>Total Credits:</label>
                          <span>{selectedStudent.academicInfo.totalCredits}</span>
                        </div>
                        {selectedStudent.academicInfo.major && (
                          <div className="profile-item">
                            <label>Major:</label>
                            <span>{selectedStudent.academicInfo.major}</span>
                          </div>
                        )}
                        {selectedStudent.academicInfo.minor && (
                          <div className="profile-item">
                            <label>Minor:</label>
                            <span>{selectedStudent.academicInfo.minor}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Enrolled Courses */}
                <div className="profile-section">
                  <h3>Currently Enrolled Courses ({selectedStudent.enrolledCourses.length})</h3>
                  {selectedStudent.enrolledCourses.length > 0 ? (
                    <div className="courses-list">
                      {selectedStudent.enrolledCourses.map(course => (
                        <div key={course._id} className="course-item">
                          <div className="course-code">{course.courseCode}</div>
                          <div className="course-name">{course.courseName}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No courses currently enrolled.</p>
                  )}
                </div>

                {/* Completed Courses */}
                <div className="profile-section">
                  <h3>Completed Courses ({selectedStudent.completedCourses.length})</h3>
                  {selectedStudent.completedCourses.length > 0 ? (
                    <div className="completed-courses-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Course</th>
                            <th>Grade</th>
                            <th>Grade Points</th>
                            <th>Semester</th>
                            <th>Year</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudent.completedCourses.map((completed, index) => (
                            <tr key={index}>
                              <td>
                                <div className="course-info">
                                  <div className="course-code">{completed.course.courseCode}</div>
                                  <div className="course-name">{completed.course.courseName}</div>
                                </div>
                              </td>
                              <td>
                                <span className={`grade-badge ${completed.grade.toLowerCase()}`}>
                                  {completed.grade}
                                </span>
                              </td>
                              <td>{completed.gradePoints.toFixed(2)}</td>
                              <td>{completed.semester}</td>
                              <td>{completed.year}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>No completed courses yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default FacultyStudentDetails;