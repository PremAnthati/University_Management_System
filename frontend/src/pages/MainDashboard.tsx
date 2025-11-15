import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import './MainDashboard.css';

interface StudentStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  graduated: number;
  withdrawn: number;
  departments: string[];
  years: number[];
}

const MainDashboard: React.FC = () => {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudentStats();
  }, []);

  const fetchStudentStats = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getStudentStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching student statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentPortal = () => {
    navigate('/student/login');
  };

  const handleAdminPortal = () => {
    navigate('/dashboard');
  };

  const handleFacultyPortal = () => {
    navigate('/faculty/login');
  };

  return (
    <div className="main-dashboard-container">
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
                    University Management System
                  </h1>
                  <p className="nav-subtitle">Comprehensive academic management platform</p>
                </div>
              </div>
            </div>
            <div className="nav-right">
              <div className="nav-status">
                <div className="status-indicator"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="content-wrapper">

          {/* Welcome Header */}
          <div className="welcome-section">
            <div className="welcome-content">
              <h2 className="welcome-title">
                Welcome to University Management System
              </h2>
              <p className="welcome-description">
                Our comprehensive platform streamlines academic operations, providing seamless management of students, courses, faculty, and resources. Experience efficient administration and enhanced learning environments through our integrated system designed for modern educational institutions.
              </p>
            </div>
          </div>

          {/* Stats Overview Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon total">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="stat-number">
                {isLoading ? (
                  <div className="skeleton"></div>
                ) : (
                  stats?.total || 0
                )}
              </h3>
              <p className="stat-label">Total Students</p>
              <div className="stat-sublabel">All registered users</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon approved">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="stat-number">
                {isLoading ? (
                  <div className="skeleton"></div>
                ) : (
                  stats?.approved || 0
                )}
              </h3>
              <p className="stat-label">Approved Students</p>
              <div className="stat-sublabel">Active enrollments</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon pending">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="stat-number">
                {isLoading ? (
                  <div className="skeleton"></div>
                ) : (
                  stats?.pending || 0
                )}
              </h3>
              <p className="stat-label">Pending Approvals</p>
              <div className="stat-sublabel">Awaiting review</div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="section">
            <div className="section-header">
              <div className="section-title-container">
                <div className="section-icon students">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="section-title">
                    Access Portals
                  </h2>
                  <p className="section-subtitle">Choose your portal to continue</p>
                </div>
              </div>
            </div>

            <div className="portal-buttons">
              <button
                onClick={handleStudentPortal}
                className="portal-btn student"
              >
                <div className="portal-icon">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="portal-content">
                  <h3>Student Portal</h3>
                  <p>Access your courses, grades, fees, and more</p>
                </div>
              </button>

              <button
                onClick={handleFacultyPortal}
                className="portal-btn faculty"
              >
                <div className="portal-icon">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="portal-content">
                  <h3>Faculty Portal</h3>
                  <p>Manage grades, attendance, and course materials</p>
                </div>
              </button>

              <button
                onClick={handleAdminPortal}
                className="portal-btn admin"
              >
                <div className="portal-icon">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="portal-content">
                  <h3>Admin Portal</h3>
                  <p>Manage students, courses, faculty, and system settings</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainDashboard;