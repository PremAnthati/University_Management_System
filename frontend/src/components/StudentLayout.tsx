import React, { useEffect, useState } from 'react';
import { studentAPI } from '../services/api';
import api from '../services/api';

interface Student {
  id: string;
  full_name: string;
  email: string;
  registration_id: string;
}

interface StudentLayoutProps {
  children: React.ReactNode;
  activePage: string;
}

interface AcademicContextType {
  selectedYear: number | null;
  selectedSemester: number | null;
  setSelectedYear: (year: number) => void;
  setSelectedSemester: (semester: number) => void;
}

export const AcademicContext = React.createContext<AcademicContextType | undefined>(undefined);


const StudentLayout: React.FC<StudentLayoutProps> = ({ children, activePage }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  useEffect(() => {
    const studentData = JSON.parse(localStorage.getItem('student') || '{}');
    setStudent(studentData);

    // Load selected year/semester from localStorage or use defaults
    const savedYear = localStorage.getItem('selectedYear');
    const savedSemester = localStorage.getItem('selectedSemester');

    setSelectedYear(savedYear ? parseInt(savedYear) : studentData.year || 1);
    setSelectedSemester(savedSemester ? parseInt(savedSemester) : studentData.semester || 1);

    // Fetch unread notifications count
    fetchUnreadNotifications();
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      const studentData = JSON.parse(localStorage.getItem('student') || '{}');
      if (studentData.id) {
        const response = await api.get(`/students/${studentData.id}/notifications`);
        const unread = response.data.filter((n: any) => !n.is_read).length;
        setUnreadNotifications(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/student/login';
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    localStorage.setItem('selectedYear', year.toString());
  };

  const handleSemesterChange = (semester: number) => {
    setSelectedSemester(semester);
    localStorage.setItem('selectedSemester', semester.toString());
  };


  const navigationItems = [
    { id: 'dashboard', icon: '🏠', text: 'Dashboard', path: '/student/dashboard' },
    { id: 'profile', icon: '👤', text: 'Profile', path: '/student/profile' },
    { id: 'courses', icon: '📚', text: 'Courses', path: '/student/courses' },
    { id: 'results', icon: '📊', text: 'Results', path: '/student/results' },
    { id: 'timetable', icon: '📅', text: 'Timetable', path: '/student/timetable' },
    { id: 'attendance', icon: '✅', text: 'Attendance', path: '/student/attendance' },
    { id: 'fees', icon: '💰', text: 'Fees', path: '/student/fees' },
    { id: 'news', icon: '📰', text: 'Tech News', path: '/student/news' },
    { id: 'chat', icon: '🤖', text: 'AI Assistant', path: '/student/chat' },
    { id: 'notifications', icon: '🔔', text: 'Notifications', path: '/student/notifications', badge: unreadNotifications }
  ];

  return (
    <AcademicContext.Provider value={{
      selectedYear,
      selectedSemester,
      setSelectedYear: handleYearChange,
      setSelectedSemester: handleSemesterChange
    }}>
      <div className="student-dashboard">
        {/* Sidebar Navigation */}
        <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🎓</span>
            <span className="logo-text">EduPortal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => window.location.href = item.path}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.text}</span>
              {item.badge && item.badge > 0 && (
                <span className="notification-badge">{item.badge}</span>
              )}
            </div>
          ))}
        </nav>

    

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {student?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <div className="user-name">{student?.full_name || 'Student'}</div>
              <div className="user-role">Student</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {children}
      </div>
    </div>
  </AcademicContext.Provider>
  );
};

export default StudentLayout;