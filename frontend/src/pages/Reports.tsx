import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './Reports.css';

interface Report {
  _id: string;
  title: string;
  type: string;
  content: string;
  generatedBy: {
    name: string;
    email: string;
  };
  generatedAt: string;
  filters: any;
}

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: string, filters: any = {}) => {
    setGenerating(true);
    try {
      let data;

      switch (type) {
        case 'student_registration':
          const studentsRes = await api.get('/students/stats/overview');
          data = studentsRes.data;
          break;

        case 'course_enrollment':
          const coursesRes = await api.get('/courses');
          const courses = coursesRes.data;
          data = {
            totalCourses: courses.length,
            totalEnrollments: courses.reduce((sum: number, course: any) => sum + course.enrolledStudents.length, 0),
            courses: courses.map((course: any) => ({
              code: course.courseCode,
              name: course.courseName,
              enrolled: course.enrolledStudents.length,
              capacity: course.maxStudents,
              faculty: course.faculty?.name || 'TBA'
            }))
          };
          break;

        case 'attendance_summary':
          const attendanceRes = await api.get('/attendance');
          const attendance = attendanceRes.data;
          const attendanceStats = {
            totalRecords: attendance.length,
            present: attendance.filter((a: any) => a.status === 'present').length,
            absent: attendance.filter((a: any) => a.status === 'absent').length,
            late: attendance.filter((a: any) => a.status === 'late').length,
            excused: attendance.filter((a: any) => a.status === 'excused').length,
            attendanceRate: attendance.length > 0 ?
              ((attendance.filter((a: any) => a.status === 'present').length / attendance.length) * 100).toFixed(2) : 0
          };
          data = attendanceStats;
          break;

        case 'grade_analysis':
          const gradesRes = await api.get('/grades');
          const grades = gradesRes.data;
          const gradeStats = {
            totalGrades: grades.length,
            averageGPA: grades.length > 0 ?
              (grades.reduce((sum: number, grade: any) => sum + grade.gradePoints, 0) / grades.length).toFixed(2) : 0,
            gradeDistribution: {
              A: grades.filter((g: any) => g.grade.startsWith('A')).length,
              B: grades.filter((g: any) => g.grade.startsWith('B')).length,
              C: grades.filter((g: any) => g.grade.startsWith('C')).length,
              D: grades.filter((g: any) => g.grade.startsWith('D')).length,
              F: grades.filter((g: any) => g.grade === 'F').length
            }
          };
          data = gradeStats;
          break;

        default:
          data = { message: 'Report type not supported' };
      }

      const reportPayload = {
        title: `${type.replace('_', ' ').toUpperCase()} Report`,
        type,
        content: JSON.stringify(data, null, 2),
        filters
      };

      await api.post('/reports', reportPayload);
      fetchReports();
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const exportReport = (report: Report, format: 'json' | 'csv') => {
    try {
      const data = JSON.parse(report.content);

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title.replace(/\s+/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Convert JSON to CSV (basic implementation)
        const csvContent = convertToCSV(data);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title.replace(/\s+/g, '_')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const convertToCSV = (data: any): string => {
    if (Array.isArray(data)) {
      if (data.length === 0) return '';
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
      ];
      return csvRows.join('\n');
    } else if (typeof data === 'object') {
      const entries = Object.entries(data);
      const csvRows = [
        'Key,Value',
        ...entries.map(([key, value]) => `${key},${JSON.stringify(value)}`)
      ];
      return csvRows.join('\n');
    }
    return String(data);
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'student_registration': return 'report-type-student';
      case 'course_enrollment': return 'report-type-course';
      case 'attendance_summary': return 'report-type-attendance';
      case 'grade_analysis': return 'report-type-grade';
      default: return 'report-type-default';
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
                    Reports & Analytics
                  </h1>
                  <p className="nav-subtitle">Generate and export comprehensive reports</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="stat-number">{reports.filter(r => r.type === 'student_registration').length}</h3>
              <p className="stat-label">Student Reports</p>
              <div className="stat-sublabel">Registration analytics</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon approved">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="stat-number">{reports.filter(r => r.type === 'course_enrollment').length}</h3>
              <p className="stat-label">Course Reports</p>
              <div className="stat-sublabel">Enrollment statistics</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon total">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="stat-number">{reports.length}</h3>
              <p className="stat-label">Total Reports</p>
              <div className="stat-sublabel">All generated reports</div>
            </div>
          </div>

          {/* Report Generation Modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">Generate New Report</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="modal-close"
                  >
                    ×
                  </button>
                </div>

                <div className="modal-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Report Type</label>
                      <select
                        className="input-field"
                        value={selectedReportType}
                        onChange={(e) => setSelectedReportType(e.target.value)}
                      >
                        <option value="">Select Report Type</option>
                        <option value="student_registration">Student Registration Report</option>
                        <option value="course_enrollment">Course Enrollment Report</option>
                        <option value="attendance_summary">Attendance Summary Report</option>
                        <option value="grade_analysis">Grade Analysis Report</option>
                      </select>
                    </div>
                  </div>

                  <div className="report-preview">
                    <h3 className="preview-title">Report Preview</h3>
                    {selectedReportType && (
                      <div className="preview-description">
                        {selectedReportType === 'student_registration' && (
                          <p>Shows total students, approval status, department distribution, and enrollment trends.</p>
                        )}
                        {selectedReportType === 'course_enrollment' && (
                          <p>Displays course enrollment statistics, capacity utilization, and faculty assignments.</p>
                        )}
                        {selectedReportType === 'attendance_summary' && (
                          <p>Provides attendance percentages, patterns, and class-wise statistics.</p>
                        )}
                        {selectedReportType === 'grade_analysis' && (
                          <p>Analyzes grade distributions, GPA trends, and academic performance metrics.</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => generateReport(selectedReportType)}
                      disabled={!selectedReportType || generating}
                      className="btn-primary"
                    >
                      {generating ? 'Generating...' : 'Generate Report'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Reports Section */}
          <div className="section">
            <div className="section-header">
              <div className="section-title-container">
                <div className="section-icon pending">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="section-title">
                    All Reports
                  </h2>
                  <p className="section-subtitle">Complete overview of all generated reports and analytics</p>
                </div>
              </div>
              <div className="section-badge">
                {reports.length} total reports
              </div>
            </div>

            <div className="table-container">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left">Report Details</th>
                      <th className="text-left">Type & Generation</th>
                      <th className="text-left">Export Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report, index) => (
                      <tr key={report._id} style={{ animationDelay: `${index * 0.1}s` }}>
                        <td>
                          <div className="student-info">
                            <div className="student-avatar pending">
                              {report.title.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="student-name">{report.title}</div>
                              <div className="student-email">Generated by {report.generatedBy?.name || 'System'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <span className={`status-badge ${report.type === 'student_registration' ? 'approved' : report.type === 'course_enrollment' ? 'pending' : 'default'}`}>
                              {report.type.replace('_', ' ').charAt(0).toUpperCase() + report.type.replace('_', ' ').slice(1)}
                            </span>
                            <div className="student-year">{new Date(report.generatedAt).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => exportReport(report, 'json')}
                              className="action-btn approve"
                            >
                              📄 JSON
                            </button>
                            <button
                              onClick={() => exportReport(report, 'csv')}
                              className="action-btn approve"
                            >
                              📊 CSV
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {reports.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="empty-state-title">No Reports Generated</h3>
                <p className="empty-state-description">Start by generating your first report to analyze student data, courses, attendance, and grades.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="back-button"
                >
                  Generate First Report
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;