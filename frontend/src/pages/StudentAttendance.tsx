import React, { useEffect, useState, useContext } from 'react';
import { studentAPI } from '../services/api';
import api from '../services/api';
import StudentLayout, { AcademicContext } from '../components/StudentLayout';
import './StudentAttendance.css';

interface AttendanceRecord {
  _id: string;
  date: string;
  status: string;
  course_id: string;
}

interface AttendanceSummary {
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercentage: number;
}

const StudentAttendance: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    courseId: '',
    startDate: '',
    endDate: ''
  });
  const academicContext = useContext(AcademicContext);

  useEffect(() => {
    fetchAttendance();
  }, [academicContext?.selectedYear, academicContext?.selectedSemester]);

  const fetchAttendance = async () => {
    try {
      const studentData = JSON.parse(localStorage.getItem('student') || '{}');
      const params = new URLSearchParams();

      if (academicContext?.selectedYear) {
        params.append('year', academicContext.selectedYear.toString());
      }
      if (academicContext?.selectedSemester) {
        params.append('semester', academicContext.selectedSemester.toString());
      }

      const queryString = params.toString();
      const url = queryString ? `/students/${studentData.id}/attendance?${queryString}` : `/students/${studentData.id}/attendance`;

      const response = await api.get(url);
      setAttendance(response.data?.data || []);
      setSummary(response.data?.summary || null);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': return 'present';
      case 'absent': return 'absent';
      case 'leave': return 'excused';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': return '✓';
      case 'absent': return '✗';
      case 'leave': return '○';
      default: return '?';
    }
  };

  const exportAttendance = (format: string) => {
    // Implementation for exporting attendance
    alert(`Attendance export as ${format} would be implemented here`);
  };

  if (loading) {
    return <div className="loading">Loading attendance records...</div>;
  }

  return (
    <StudentLayout activePage="attendance">
      <div className="student-attendance">
        <div className="attendance-header">
        <h1>Attendance Records</h1>
        <div className="attendance-summary">
          <div className="summary-card">
            <div className="summary-icon present">
              <span>✓</span>
            </div>
            <div className="summary-info">
              <h3>{summary?.present || 0}</h3>
              <p>Present</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon absent">
              <span>✗</span>
            </div>
            <div className="summary-info">
              <h3>{summary?.absent || 0}</h3>
              <p>Absent</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon excused">
              <span>○</span>
            </div>
            <div className="summary-info">
              <h3>{summary?.excused || 0}</h3>
              <p>Excused</p>
            </div>
          </div>

          <div className="summary-card total">
            <div className="summary-icon total">
              <span>%</span>
            </div>
            <div className="summary-info">
              <h3>{summary?.attendancePercentage || 0}%</h3>
              <p>Overall Rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="attendance-content">
        <div className="filters-section">
          <h2>Filter Attendance</h2>
          <div className="filters">
            <div className="filter-group">
              <label>Course</label>
              <select name="courseId" value={filters.courseId} onChange={handleFilterChange}>
                <option value="">All Courses</option>
                <option value="1">Computer Science</option>
                <option value="2">Mathematics</option>
                <option value="3">Physics</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-actions">
              <button onClick={() => exportAttendance('PDF')} className="export-btn">
                Export PDF
              </button>
            </div>
          </div>
        </div>

        <div className="attendance-records">
          <div className="records-header">
            <h2>Attendance History</h2>
            <span className="records-count">{attendance.length} records</span>
          </div>

          <div className="records-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(record => (
                  <tr key={record._id}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>Course {record.course_id.slice(-3)}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(record.status)}`}>
                        <span className="status-icon">{getStatusIcon(record.status)}</span>
                        {record.status}
                      </span>
                    </td>
                    <td>{new Date(record.date).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {attendance.length === 0 && (
            <div className="no-records">
              <div className="no-records-icon">📅</div>
              <h3>No Attendance Records</h3>
              <p>Your attendance records will appear here once classes begin.</p>
            </div>
          )}
        </div>

        <div className="attendance-chart">
          <h2>Attendance Trend</h2>
          <div className="chart-placeholder">
            <div className="chart-bar">
              <div className="bar present" style={{ height: `${summary?.attendancePercentage || 0}%` }}>
                <span className="bar-label">{summary?.attendancePercentage || 0}%</span>
              </div>
            </div>
            <div className="chart-labels">
              <span>Present</span>
              <span>Target (75%)</span>
            </div>
            <div className="target-line" style={{ bottom: '75%' }}></div>
          </div>
        </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentAttendance;