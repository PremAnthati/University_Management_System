import React, { useEffect, useState } from 'react';
import { facultyAPI, courseMaterialsAPI } from '../services/api';
import './FacultyDashboard.css';

interface Faculty {
  _id: string;
  name: string;
  email: string;
  facultyId: string;
  department: string;
  designation: string;
  courses: Course[];
}

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

interface CourseMaterial {
  _id: string;
  title: string;
  type: string;
  uploadedAt: string;
  downloadCount: number;
}

const FacultyDashboard: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [recentMaterials, setRecentMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalMaterials: 0,
    recentUploads: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, coursesRes] = await Promise.all([
        facultyAPI.getProfile(),
        facultyAPI.getCourses()
      ]);

      const facultyData = profileRes.data;
      const coursesData = coursesRes.data;

      setFaculty(facultyData);
      setCourses(coursesData);

      // Calculate stats
      const totalStudents = coursesData.reduce((sum: number, course: Course) => sum + course.enrolledStudents.length, 0);

      // Fetch recent materials
      const materialsPromises = coursesData.slice(0, 3).map((course: Course) =>
        courseMaterialsAPI.getMaterialsForCourse(course._id)
      );

      const materialsResponses = await Promise.all(materialsPromises);
      const allMaterials = materialsResponses.flatMap(res => res.data);
      const recentMaterials = allMaterials
        .sort((a: CourseMaterial, b: CourseMaterial) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
        .slice(0, 5);

      setRecentMaterials(recentMaterials);

      setStats({
        totalCourses: coursesData.length,
        totalStudents,
        totalMaterials: allMaterials.length,
        recentUploads: recentMaterials.length
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTodaysDate = () => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="faculty-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="faculty-dashboard">
      {/* Header */}
      <header className="faculty-dashboard-header">
        <div className="header-left">
          <h1>Faculty Dashboard</h1>
          <p>Welcome back, {faculty?.name}!</p>
        </div>
        <div className="header-right">
          <div className="current-date-time">
            <div>{getTodaysDate()}</div>
            <div>{getCurrentTime()}</div>
          </div>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem('facultyToken');
              localStorage.removeItem('faculty');
              window.location.href = '/';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{stats.totalCourses}</h3>
            <p>Courses Teaching</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>{stats.totalMaterials}</h3>
            <p>Course Materials</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📤</div>
          <div className="stat-content">
            <h3>{stats.recentUploads}</h3>
            <p>Recent Uploads</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Courses Section */}
        <div className="content-section">
          <h2>My Courses</h2>
          <div className="courses-grid">
            {courses.map(course => (
              <div key={course._id} className="course-card">
                <div className="course-header">
                  <h3>{course.courseCode}</h3>
                  <span className="course-credits">{course.credits} Credits</span>
                </div>
                <p className="course-name">{course.courseName}</p>
                <div className="course-details">
                  <span className="department">{course.department}</span>
                  <span className="semester">{course.semester} {course.year}</span>
                </div>
                <div className="course-stats">
                  <span>{course.enrolledStudents.length} Students</span>
                </div>
                <div className="course-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => window.location.href = `/faculty/grades`}
                  >
                    Post Grades
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => window.location.href = `/faculty/attendance`}
                  >
                    Manage Attendance
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => window.location.href = `/faculty/materials`}
                  >
                    Course Materials
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Materials */}
        <div className="content-section">
          <h2>Recent Course Materials</h2>
          {recentMaterials.length > 0 ? (
            <div className="materials-list">
              {recentMaterials.map(material => (
                <div key={material._id} className="material-item">
                  <div className="material-icon">
                    {material.type === 'document' && '📄'}
                    {material.type === 'presentation' && '📊'}
                    {material.type === 'video' && '🎥'}
                    {material.type === 'link' && '🔗'}
                    {material.type === 'assignment' && '📝'}
                  </div>
                  <div className="material-content">
                    <h4>{material.title}</h4>
                    <p>Uploaded {new Date(material.uploadedAt).toLocaleDateString()}</p>
                    <span className="download-count">{material.downloadCount} downloads</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No course materials uploaded yet.</p>
              <button
                className="btn-primary"
                onClick={() => window.location.href = '/faculty/materials'}
              >
                Upload Your First Material
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="content-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <button
              className="quick-action-btn"
              onClick={() => window.location.href = '/faculty/students'}
            >
              <div className="action-icon">👥</div>
              <div className="action-content">
                <h4>Student Details</h4>
                <p>View profiles and academic records</p>
              </div>
            </button>

            <button
              className="quick-action-btn"
              onClick={() => window.location.href = '/faculty/grades'}
            >
              <div className="action-icon">📊</div>
              <div className="action-content">
                <h4>Post Grades</h4>
                <p>Enter assessment scores for students</p>
              </div>
            </button>

            <button
              className="quick-action-btn"
              onClick={() => window.location.href = '/faculty/attendance'}
            >
              <div className="action-icon">✅</div>
              <div className="action-content">
                <h4>Manage Attendance</h4>
                <p>Mark attendance and view records</p>
              </div>
            </button>

            <button
              className="quick-action-btn"
              onClick={() => window.location.href = '/faculty/materials'}
            >
              <div className="action-icon">📁</div>
              <div className="action-content">
                <h4>Course Materials</h4>
                <p>Upload files and manage content</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;