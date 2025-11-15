import React, { useEffect, useState, useRef, useContext } from 'react';
import { studentAPI } from '../services/api';
import StudentLayout, { AcademicContext } from '../components/StudentLayout';
import './StudentDashboard.css';

interface Student {
  id: string;
  full_name: string;
  email: string;
  registration_id: string;
}

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  faculty?: {
    name: string;
  };
}

interface Fee {
  total_amount: any; // Will be converted from Decimal128 to number by API interceptor
  paid_amount: any; // Will be converted from Decimal128 to number by API interceptor
  pending_amount: any; // Will be converted from Decimal128 to number by API interceptor
  status: string;
  semester: number;
  year: number;
}

interface Attendance {
  attendancePercentage: number;
  totalClasses: number;
  present: number;
  absent: number;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  category: string;
  is_read: boolean;
  created_at: string;
}

interface TimetableEntry {
  subject_name: string;
  start_time: string;
  end_time: string;
  room_number: string;
  faculty_id: string;
  day_of_week: string;
}

const StudentDashboard: React.FC = () => {
  const { selectedYear, selectedSemester } = useContext(AcademicContext) || {};
  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [weather, setWeather] = useState({ temp: 25, condition: 'sunny' });
  const [cgpa, setCgpa] = useState<string>('0.00');
  const dashboardRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Intersection Observer for animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe dashboard cards
    if (dashboardRef.current) {
      const cards = dashboardRef.current.querySelectorAll('.dashboard-card');
      cards.forEach((card) => observerRef.current?.observe(card));
    }

    // Simulate weather data
    setWeather({ temp: 28, condition: 'sunny' });

    return () => {
      clearInterval(timer);
      observerRef.current?.disconnect();
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const studentData = JSON.parse(localStorage.getItem('student') || '{}');
      setStudent(studentData);

      const params = selectedYear || selectedSemester ? {
        ...(selectedYear && { year: selectedYear }),
        ...(selectedSemester && { semester: selectedSemester })
      } : undefined;

      const [coursesRes, feesRes, attendanceRes, notificationsRes, timetableRes] = await Promise.all([
        studentAPI.getCourses(studentData.id),
        studentAPI.getFees(studentData.id, params),
        studentAPI.getAttendance(studentData.id, params),
        studentAPI.getNotifications(studentData.id),
        studentAPI.getTimetable(studentData.id)
      ]);

      setCourses(coursesRes.data || []);
      setFees(feesRes.data?.data || []);
      setAttendance(attendanceRes.data?.summary || { totalClasses: 0, present: 0, absent: 0, attendancePercentage: 0 });
      setNotifications(notificationsRes.data?.slice(0, 5) || []);
      setTimetable(timetableRes.data?.slice(0, 3) || []); // Today's/next classes

      // Calculate CGPA from results
      const calculatedCgpa = await calculateCGPA();
      setCgpa(calculatedCgpa);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCGPA = async () => {
    try {
      const studentData = JSON.parse(localStorage.getItem('student') || '{}');
      const params = selectedYear || selectedSemester ? {
        ...(selectedYear && { year: selectedYear }),
        ...(selectedSemester && { semester: selectedSemester })
      } : undefined;

      const response = await studentAPI.getResults(studentData.id, params);
      const results = response.data?.data || [];

      if (!results || results.length === 0) return '0.00';

      let totalCredits = 0;
      let weightedPoints = 0;

      results.forEach((result: any) => {
        const credits = result.credits || result.course_id?.credits || 0;
        totalCredits += credits;

        // Convert grade to points (simplified GPA scale)
        let points = 0;
        const grade = result.grade || '';
        switch(grade.toUpperCase()) {
          case 'A+': points = 4.0; break;
          case 'A': points = 4.0; break;
          case 'B+': points = 3.5; break;
          case 'B': points = 3.0; break;
          case 'C+': points = 2.5; break;
          case 'C': points = 2.0; break;
          case 'D': points = 1.0; break;
          case 'F': points = 0.0; break;
          default: points = 0.0;
        }
        weightedPoints += points * credits;
      });

      const cgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : '0.00';
      return cgpa;
    } catch (error) {
      console.error('Error calculating CGPA:', error);
      return '0.00';
    }
  };

  const getPendingFees = () => {
    return fees.reduce((sum, fee) => sum + (typeof fee.pending_amount === 'number' ? fee.pending_amount : parseFloat(fee.pending_amount?.toString() || '0')), 0);
  };

  const getTodaysClasses = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return timetable.filter(entry => entry.day_of_week?.toLowerCase() === today);
  };

  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.is_read).length;
  };

  const handleCardHover = (cardId: string) => {
    setActiveCard(cardId);
  };

  const handleCardLeave = () => {
    setActiveCard(null);
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const getGreetingEmoji = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    return '🌙';
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "Success is not final, failure is not fatal: It is the courage to continue that counts.",
      "The only way to do great work is to love what you do.",
      "Believe you can and you're halfway there.",
      "The future belongs to those who believe in the beauty of their dreams.",
      "Your education is a dress rehearsal for a life that is yours to lead."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <StudentLayout activePage="dashboard">
        {/* Top Header Bar */}
        <header className="top-header">
          <div className="header-left">
            <h1 className="page-title">Dashboard</h1>
            <div className="breadcrumb">
              <span>Home</span> / <span>Dashboard</span>
            </div>
          </div>
          <div className="header-right">
            <div className="current-time">
              {currentTime.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })} • {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="header-actions">
              <button className="notification-btn">
                <span>🔔</span>
                {getUnreadNotifications() > 0 && <span className="notification-count">{getUnreadNotifications()}</span>}
              </button>
              <div className="user-menu">
                <div className="user-avatar-small">
                  {student?.full_name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-card">
              <div className="welcome-text">
                <h1>Welcome back, {student?.full_name?.split(' ')[0]}! 👋</h1>
                <p>Here's your academic overview for today</p>
              </div>
              <div className="welcome-stats">
                <div className="stat-item">
                  <div className="stat-value">{courses.length}</div>
                  <div className="stat-label">Active Courses</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{attendance?.attendancePercentage || 0}%</div>
                  <div className="stat-label">Attendance</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">₹{getPendingFees()}</div>
                  <div className="stat-label">Pending Fees</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="metrics-section">
            <div className="metrics-grid">
              <div className="metric-card courses">
                <div className="metric-icon">📚</div>
                <div className="metric-content">
                  <h3>{courses.length}</h3>
                  <p>Enrolled Courses</p>
                  <span className="metric-trend positive">Active this semester</span>
                </div>
              </div>

              <div className="metric-card grades">
                <div className="metric-icon">🎓</div>
                <div className="metric-content">
                  <h3>{cgpa}</h3>
                  <p>Current CGPA</p>
                  <span className="metric-trend positive">Grade point average</span>
                </div>
              </div>

              <div className="metric-card attendance">
                <div className="metric-icon">✅</div>
                <div className="metric-content">
                  <h3>{attendance?.attendancePercentage || 0}%</h3>
                  <p>Attendance Rate</p>
                  <span className="metric-trend positive">Overall performance</span>
                </div>
              </div>

              <div className="metric-card fees">
                <div className="metric-icon">💰</div>
                <div className="metric-content">
                  <h3>₹{getPendingFees()}</h3>
                  <p>Pending Fees</p>
                  <span className="metric-trend negative">Payment required</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="content-grid">
            {/* Left Column */}
            <div className="content-left">
              {/* Today's Classes */}
              <div className="content-card todays-classes">
                <div className="card-header">
                  <h3>📅 Today's Classes</h3>
                  <span className="card-count">{getTodaysClasses().length} classes</span>
                </div>
                <div className="card-body">
                  {getTodaysClasses().length > 0 ? (
                    <div className="classes-list">
                      {getTodaysClasses().slice(0, 3).map((entry, index) => (
                        <div key={index} className="class-item">
                          <div className="class-info">
                            <h4>{entry.subject_name}</h4>
                            <p>{entry.start_time} - {entry.end_time} • Room {entry.room_number}</p>
                            <small>Faculty: {entry.faculty_id}</small>
                          </div>
                          <div className="class-status">
                            <span className="status-badge upcoming">Upcoming</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">📅</div>
                      <p>No classes scheduled for today</p>
                      <small>Enjoy your free time! 🎉</small>
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <button className="btn-primary" onClick={() => window.location.href = '/student/timetable'}>
                    View Full Timetable →
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="content-card quick-actions">
                <div className="card-header">
                  <h3>⚡ Quick Actions</h3>
                </div>
                <div className="card-body">
                  <div className="clean-actions-grid">
                    <button className="clean-action-btn" onClick={() => window.location.href = '/student/results'}>
                      <div className="clean-action-icon">
                        📊
                      </div>
                      <div className="clean-action-content">
                        <div className="clean-action-title">View Results</div>
                        <div className="clean-action-subtitle">Check grades & performance</div>
                      </div>
                    </button>

                    <button className="clean-action-btn" onClick={() => window.location.href = '/student/fees'}>
                      <div className="clean-action-icon">
                        💳
                      </div>
                      <div className="clean-action-content">
                        <div className="clean-action-title">Pay Fees</div>
                        <div className="clean-action-subtitle">Online payment portal</div>
                      </div>
                    </button>

                    <button className="clean-action-btn" onClick={() => window.location.href = '/student/timetable'}>
                      <div className="clean-action-icon">
                        📅
                      </div>
                      <div className="clean-action-content">
                        <div className="clean-action-title">Timetable</div>
                        <div className="clean-action-subtitle">Weekly class schedule</div>
                      </div>
                    </button>

                    <button className="clean-action-btn" onClick={() => window.location.href = '/student/attendance'}>
                      <div className="clean-action-icon">
                        📈
                      </div>
                      <div className="clean-action-content">
                        <div className="clean-action-title">Attendance</div>
                        <div className="clean-action-subtitle">Track your presence</div>
                      </div>
                    </button>

                    <button className="clean-action-btn" onClick={() => window.location.href = '/student/chat'}>
                      <div className="clean-action-icon">
                        🤖
                      </div>
                      <div className="clean-action-content">
                        <div className="clean-action-title">AI Assistant</div>
                        <div className="clean-action-subtitle">Get instant help</div>
                      </div>
                    </button>

                    <button className="clean-action-btn" onClick={() => window.location.href = '/student/news'}>
                      <div className="clean-action-icon">
                        📰
                      </div>
                      <div className="clean-action-content">
                        <div className="clean-action-title">Tech News</div>
                        <div className="clean-action-subtitle">Latest technology updates</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="content-right">
              {/* Recent Activity */}
              <div className="content-card recent-activity">
                <div className="card-header">
                  <h3>📝 Recent Activity</h3>
                </div>
                <div className="card-body">
                  <div className="activity-list">
                    <div className="activity-item">
                      <div className="activity-icon">📝</div>
                      <div className="activity-content">
                        <p>Submitted assignment for Data Structures</p>
                        <span className="activity-time">2 hours ago</span>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon">✅</div>
                      <div className="activity-content">
                        <p>Attended Database Management class</p>
                        <span className="activity-time">4 hours ago</span>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon">💰</div>
                      <div className="activity-content">
                        <p>Fee payment of ₹5,000 received</p>
                        <span className="activity-time">1 day ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="content-card notifications">
                <div className="card-header">
                  <h3>🔔 Notifications</h3>
                  <span className="card-count">{getUnreadNotifications()} unread</span>
                </div>
                <div className="card-body">
                  {notifications.length > 0 ? (
                    <div className="notifications-list">
                      {notifications.slice(0, 3).map(notification => (
                        <div key={notification._id} className={`notification-item ${!notification.is_read ? 'unread' : ''}`}>
                          <div className="notification-icon">
                            {notification.category === 'Academic' && '📚'}
                            {notification.category === 'Fees' && '💰'}
                            {notification.category === 'Events' && '🎉'}
                            {notification.category === 'General' && 'ℹ️'}
                          </div>
                          <div className="notification-content">
                            <h4>{notification.title}</h4>
                            <p>{notification.message}</p>
                            <span className="notification-time">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {!notification.is_read && <div className="unread-indicator"></div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">🔔</div>
                      <p>No new notifications</p>
                      <small>You're all caught up!</small>
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <button className="btn-secondary" onClick={() => window.location.href = '/student/notifications'}>
                    View All →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </StudentLayout>
  );
};

export default StudentDashboard;