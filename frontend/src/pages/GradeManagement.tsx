import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './GradeManagement.css';

interface Grade {
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
  assessmentType: string;
  assessmentName: string;
  score: number;
  maxScore: number;
  grade: string;
  gradePoints: number;
  weightage: number;
  remarks: string;
  status: string;
  gradedDate: string;
}

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  enrolledStudents: any[];
}

const GradeManagement: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedAssessment, setSelectedAssessment] = useState<string>('');
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    assessmentType: 'quiz',
    assessmentName: '',
    score: 0,
    maxScore: 100,
    weightage: 10,
    remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gradesRes, coursesRes] = await Promise.all([
        api.get('/grades'),
        api.get('/courses')
      ]);
      setGrades(gradesRes.data);
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
      await api.post('/grades', {
        ...formData,
        courseId: selectedCourse,
        facultyId: '507f1f77bcf86cd799439011' // Replace with actual faculty ID from auth
      });
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving grade:', error);
    }
  };

  const handleBulkGrade = async () => {
    if (!selectedCourse || !selectedAssessment) return;

    try {
      const course = courses.find(c => c._id === selectedCourse);
      if (!course) return;

      const bulkGrades = course.enrolledStudents.map((studentId: string) => ({
        studentId,
        courseId: selectedCourse,
        facultyId: '507f1f77bcf86cd799439011', // Replace with actual faculty ID
        assessmentType: formData.assessmentType,
        assessmentName: selectedAssessment,
        score: formData.score,
        maxScore: formData.maxScore,
        weightage: formData.weightage,
        remarks: formData.remarks
      }));

      await api.post('/grades/bulk', { grades: bulkGrades });
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving bulk grades:', error);
    }
  };

  const handlePublish = async (gradeId: string) => {
    try {
      await api.put(`/grades/${gradeId}/publish`);
      fetchData();
    } catch (error) {
      console.error('Error publishing grade:', error);
    }
  };

  const handleFinalize = async (gradeId: string) => {
    try {
      await api.put(`/grades/${gradeId}/finalize`);
      fetchData();
    } catch (error) {
      console.error('Error finalizing grade:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      courseId: '',
      assessmentType: 'quiz',
      assessmentName: '',
      score: 0,
      maxScore: 100,
      weightage: 10,
      remarks: ''
    });
    setSelectedCourse('');
    setSelectedAssessment('');
    setShowForm(false);
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'grade-a';
    if (grade.startsWith('B')) return 'grade-b';
    if (grade.startsWith('C')) return 'grade-c';
    return 'grade-d';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalized': return 'status-finalized';
      case 'published': return 'status-published';
      case 'draft': return 'status-draft';
      default: return 'status-draft';
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
                    Grade Management
                  </h1>
                  <p className="nav-subtitle">Track and manage student assessments</p>
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
              <h3 className="stat-number">{grades.filter(g => g.status === 'finalized').length}</h3>
              <p className="stat-label">Finalized Grades</p>
              <div className="stat-sublabel">Completed assessments</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon approved">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="stat-number">{grades.length}</h3>
              <p className="stat-label">Total Assessments</p>
              <div className="stat-sublabel">All grade records</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon total">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="stat-number">{courses.length}</h3>
              <p className="stat-label">Active Courses</p>
              <div className="stat-sublabel">Courses with grades</div>
            </div>
          </div>

          {/* Grade Form Modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">
                    {selectedAssessment ? 'Bulk Grade Entry' : 'Add Grade'}
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
                      <label className="form-label">Course</label>
                      <select
                        className="input-field"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
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
                      <label className="form-label">Assessment Type</label>
                      <select
                        className="input-field"
                        value={formData.assessmentType}
                        onChange={(e) => setFormData({...formData, assessmentType: e.target.value})}
                        required
                      >
                        <option value="quiz">Quiz</option>
                        <option value="midterm">Midterm</option>
                        <option value="final">Final Exam</option>
                        <option value="assignment">Assignment</option>
                        <option value="project">Project</option>
                        <option value="lab">Lab</option>
                        <option value="presentation">Presentation</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Assessment Name</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.assessmentName}
                        onChange={(e) => setFormData({...formData, assessmentName: e.target.value})}
                        placeholder="e.g., Quiz 1, Midterm Exam"
                        required
                      />
                    </div>

                    {!selectedAssessment && (
                      <div className="form-group">
                        <label className="form-label">Student</label>
                        <select
                          className="input-field"
                          value={formData.studentId}
                          onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                          required
                        >
                          <option value="">Select Student</option>
                          {selectedCourse && courses
                            .find(c => c._id === selectedCourse)
                            ?.enrolledStudents.map((student: any) => (
                              <option key={student._id} value={student._id}>
                                {student.name} ({student.studentId})
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Score</label>
                      <input
                        type="number"
                        className="input-field"
                        value={formData.score}
                        onChange={(e) => setFormData({...formData, score: parseFloat(e.target.value)})}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Max Score</label>
                      <input
                        type="number"
                        className="input-field"
                        value={formData.maxScore}
                        onChange={(e) => setFormData({...formData, maxScore: parseFloat(e.target.value)})}
                        min="1"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Weightage (%)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={formData.weightage}
                        onChange={(e) => setFormData({...formData, weightage: parseFloat(e.target.value)})}
                        min="0"
                        max="100"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Remarks</label>
                    <textarea
                      className="input-field"
                      rows={3}
                      value={formData.remarks}
                      onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                      placeholder="Optional remarks..."
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
                    {selectedAssessment ? (
                      <button
                        type="button"
                        onClick={handleBulkGrade}
                        className="btn-primary"
                      >
                        Save Bulk Grades
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="btn-primary"
                      >
                        Save Grade
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* All Grades Section */}
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
                    All Grades
                  </h2>
                  <p className="section-subtitle">Complete overview of all student assessments</p>
                </div>
              </div>
              <div className="section-badge">
                {grades.length} total grades
              </div>
            </div>

            <div className="table-container">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left">Student Details</th>
                      <th className="text-left">Course & Assessment</th>
                      <th className="text-left">Score & Grade</th>
                      <th className="text-left">Status & Date</th>
                      <th className="text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade, index) => (
                      <tr key={grade._id} style={{ animationDelay: `${index * 0.1}s` }}>
                        <td>
                          <div className="student-info">
                            <div className="student-avatar pending">
                              {(grade.student?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="student-name">{grade.student?.name || 'Unknown Student'}</div>
                              <div className="student-email">ID: {grade.student.studentId}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <div className="student-id">{grade.course.courseCode} - {grade.course.courseName}</div>
                            <div className="student-department">{grade.assessmentName} ({grade.assessmentType})</div>
                            <div className="student-year">Weightage: {grade.weightage}%</div>
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
                          <div className="academic-info">
                            <span className={`status-badge ${grade.status === 'finalized' ? 'approved' : grade.status === 'published' ? 'pending' : 'default'}`}>
                              {grade.status.charAt(0).toUpperCase() + grade.status.slice(1)}
                            </span>
                            <div className="student-year">{new Date(grade.gradedDate).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {grade.status === 'draft' && (
                              <button
                                onClick={() => handlePublish(grade._id)}
                                className="action-btn approve"
                              >
                                📤 Publish
                              </button>
                            )}
                            {grade.status === 'published' && (
                              <button
                                onClick={() => handleFinalize(grade._id)}
                                className="action-btn approve"
                              >
                                ✅ Finalize
                              </button>
                            )}
                            {grade.status === 'finalized' && (
                              <span className="text-sm text-gray-500">Finalized</span>
                            )}
                          </div>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="empty-state-title">No Grades Recorded</h3>
                <p className="empty-state-description">Start by adding grades for student assessments. All grade records will appear here.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="back-button"
                >
                  Add First Grade
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GradeManagement;