import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './CourseManagement.css';

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  description: string;
  department: {
    _id: string;
    name: string;
    code: string;
  };
  credits: number;
  semester: string;
  year: number;
  faculty: {
    _id: string;
    name: string;
    email: string;
  };
  maxStudents: number;
  enrolledStudents: any[];
  status: string;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
    classroom: string;
  };
}

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    description: '',
    department: '',
    credits: 3,
    semester: '',
    year: new Date().getFullYear(),
    maxStudents: 50,
    schedule: {
      days: [] as string[],
      startTime: '',
      endTime: '',
      classroom: ''
    }
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse._id}`, formData);
      } else {
        await api.post('/courses', formData);
      }
      fetchCourses();
      resetForm();
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      courseCode: course.courseCode,
      courseName: course.courseName,
      description: course.description,
      department: course.department.name,
      credits: course.credits,
      semester: course.semester,
      year: course.year,
      maxStudents: course.maxStudents,
      schedule: course.schedule
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`/courses/${id}`);
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      courseCode: '',
      courseName: '',
      description: '',
      department: '',
      credits: 3,
      semester: '',
      year: new Date().getFullYear(),
      maxStudents: 50,
      schedule: {
        days: [],
        startTime: '',
        endTime: '',
        classroom: ''
      }
    });
    setEditingCourse(null);
    setShowForm(false);
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter(d => d !== day)
          : [...prev.schedule.days, day]
      }
    }));
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
                    Course Management
                  </h1>
                  <p className="nav-subtitle">Create and manage academic courses</p>
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
              <h3 className="stat-number">{courses.filter(c => c.status === 'active').length}</h3>
              <p className="stat-label">Active Courses</p>
              <div className="stat-sublabel">Currently running</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon approved">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="stat-number">{courses.reduce((sum, c) => sum + c.enrolledStudents.length, 0)}</h3>
              <p className="stat-label">Total Enrollments</p>
              <div className="stat-sublabel">Students enrolled</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon total">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="stat-number">{courses.length}</h3>
              <p className="stat-label">Total Courses</p>
              <div className="stat-sublabel">All courses</div>
            </div>
          </div>

          {/* Course Form Modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">
                    {editingCourse ? 'Edit Course' : 'Add New Course'}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="modal-close"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Course Code</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.courseCode}
                        onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Course Name</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.courseName}
                        onChange={(e) => setFormData({...formData, courseName: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <select
                        className="input-field"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Civil">Civil</option>
                        <option value="Electrical">Electrical</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Credits</label>
                      <input
                        type="number"
                        className="input-field"
                        value={formData.credits}
                        onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
                        min="1"
                        max="6"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Semester</label>
                      <select
                        className="input-field"
                        value={formData.semester}
                        onChange={(e) => setFormData({...formData, semester: e.target.value})}
                        required
                      >
                        <option value="">Select Semester</option>
                        <option value="Fall 2024">Fall 2024</option>
                        <option value="Spring 2025">Spring 2025</option>
                        <option value="Summer 2025">Summer 2025</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Year</label>
                      <input
                        type="number"
                        className="input-field"
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Max Students</label>
                      <input
                        type="number"
                        className="input-field"
                        value={formData.maxStudents}
                        onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
                        min="1"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Classroom</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.schedule.classroom}
                        onChange={(e) => setFormData({
                          ...formData,
                          schedule: {...formData.schedule, classroom: e.target.value}
                        })}
                        placeholder="e.g., Room 101"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Start Time</label>
                      <input
                        type="time"
                        className="input-field"
                        value={formData.schedule.startTime}
                        onChange={(e) => setFormData({
                          ...formData,
                          schedule: {...formData.schedule, startTime: e.target.value}
                        })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">End Time</label>
                      <input
                        type="time"
                        className="input-field"
                        value={formData.schedule.endTime}
                        onChange={(e) => setFormData({
                          ...formData,
                          schedule: {...formData.schedule, endTime: e.target.value}
                        })}
                      />
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Days</label>
                    <div className="days-container">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <label key={day} className="day-checkbox">
                          <input
                            type="checkbox"
                            checked={formData.schedule.days.includes(day)}
                            onChange={() => handleDayToggle(day)}
                          />
                          {day}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Description</label>
                    <textarea
                      className="input-field"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Course description..."
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {editingCourse ? 'Update Course' : 'Create Course'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* All Courses Section */}
          <div className="section">
            <div className="section-header">
              <div className="section-title-container">
                <div className="section-icon students">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 className="section-title students">
                    All Courses
                  </h2>
                  <p className="section-subtitle">Complete overview of all academic courses</p>
                </div>
              </div>
              <div className="section-badge">
                {courses.length} total courses
              </div>
            </div>

            <div className="table-container">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left">Course Details</th>
                      <th className="text-left">Academic Info</th>
                      <th className="text-left">Schedule & Enrollment</th>
                      <th className="text-left">Status</th>
                      <th className="text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course, index) => (
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
                            <div className="student-id">{course.department.name}</div>
                            <div className="student-department">{course.credits} credits</div>
                            <div className="student-year">{course.semester} {course.year}</div>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <div className="student-id">{course.schedule.days.length > 0 ? course.schedule.days.join(', ') : 'No schedule'}</div>
                            <div className="student-department">{course.schedule.startTime && course.schedule.endTime ? `${course.schedule.startTime} - ${course.schedule.endTime}` : ''}</div>
                            <div className="student-year">{course.schedule.classroom || 'No room assigned'}</div>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <span className={`status-badge ${course.status}`}>
                              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                            </span>
                            <div className="student-year">{course.enrolledStudents.length}/{course.maxStudents} enrolled</div>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEdit(course)}
                              className="action-btn approve"
                            >
                              ✏ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(course._id)}
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

            {courses.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="empty-state-title">No Courses Available</h3>
                <p className="empty-state-description">Start by creating your first academic course. All courses will appear here.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="back-button"
                >
                  Create First Course
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseManagement;