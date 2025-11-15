import React, { useEffect, useState } from 'react';
import { studentAPI } from '../services/api';
import socketService from '../services/socket';
import StudentLayout from '../components/StudentLayout';
import './StudentNotifications.css';

interface Notification {
  _id: string;
  title: string;
  message: string;
  category: string;
  is_read: boolean;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  targetAudience: string;
  targetYear?: number;
  targetSemester?: number;
  targetDepartment?: string;
  createdAt: string;
}

const StudentNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notifications' | 'announcements'>('notifications');
  const [filters, setFilters] = useState({
    category: '',
    readStatus: 'all'
  });

  useEffect(() => {
    fetchNotifications();

    // Connect to socket for real-time announcements
    const socket = socketService.connect();
    const studentData = JSON.parse(localStorage.getItem('student') || '{}');
    socketService.joinStudentRoom(studentData.id);

    // Listen for new announcements
    const handleNewAnnouncement = (announcement: Announcement) => {
      console.log('New announcement received:', announcement);
      setAnnouncements(prev => [announcement, ...prev]);

      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`📢 ${announcement.title}`, {
          body: announcement.message,
          icon: '/favicon.ico'
        });
      }
    };

    socketService.onNewAnnouncement(handleNewAnnouncement);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socketService.off('new-announcement', handleNewAnnouncement);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [notifications, filters, activeTab]);

  const fetchNotifications = async () => {
    try {
      const studentData = JSON.parse(localStorage.getItem('student') || '{}');
      const response = await studentAPI.getNotifications(studentData.id);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };


  const applyFilters = () => {
    if (activeTab === 'notifications') {
      let filtered = notifications;

      if (filters.category) {
        filtered = filtered.filter(notification => notification.category === filters.category);
      }

      if (filters.readStatus === 'read') {
        filtered = filtered.filter(notification => notification.is_read);
      } else if (filters.readStatus === 'unread') {
        filtered = filtered.filter(notification => !notification.is_read);
      }

      setFilteredNotifications(filtered);
    } else {
      // For announcements, just show all (no filtering needed for real-time messages)
      setFilteredAnnouncements(announcements);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await studentAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        // Note: API endpoint might need to be implemented
        setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      for (const notification of unreadNotifications) {
        await studentAPI.markAsRead(notification._id);
      }
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'academic': return '📚';
      case 'fees': return '💰';
      case 'events': return '🎉';
      case 'general': return '📢';
      default: return '📄';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'academic': return 'academic';
      case 'fees': return 'fees';
      case 'events': return 'events';
      case 'general': return 'general';
      default: return 'default';
    }
  };

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <StudentLayout activePage="notifications">
      <div className="student-notifications">
      <div className="notifications-header">
        <div className="header-content">
          <h1>Messages & Announcements</h1>
          {activeTab === 'notifications' && unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
          {activeTab === 'announcements' && announcements.length > 0 && (
            <span className="announcement-badge">{announcements.length} live</span>
          )}
        </div>
        <div className="header-actions">
          {activeTab === 'notifications' && unreadCount > 0 && (
            <button onClick={markAllAsRead} className="mark-all-read-btn">
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            🔔 Notifications
            {unreadCount > 0 && <span className="tab-count">{unreadCount}</span>}
          </button>
          <button
            className={`tab ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            📢 Announcements
            {announcements.length > 0 && <span className="tab-count">{announcements.length}</span>}
          </button>
        </div>
      </div>

      <div className="notifications-content">
        <div className="filters-section">
          <div className="filters">
            <div className="filter-group">
              <label>Category</label>
              <select name="category" value={filters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                {activeTab === 'notifications' ? (
                  <>
                    <option value="Academic">Academic</option>
                    <option value="Fees">Fees</option>
                    <option value="Events">Events</option>
                    <option value="General">General</option>
                  </>
                ) : (
                  <>
                    <option value="General">General</option>
                    <option value="Academic">Academic</option>
                    <option value="Events">Events</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Important">Important</option>
                  </>
                )}
              </select>
            </div>

            {activeTab === 'notifications' && (
              <div className="filter-group">
                <label>Status</label>
                <select name="readStatus" value={filters.readStatus} onChange={handleFilterChange}>
                  <option value="all">All</option>
                  <option value="read">Read</option>
                  <option value="unread">Unread</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="notifications-list">
          {activeTab === 'notifications' ? (
            filteredNotifications.length > 0 ? (
              filteredNotifications.map(notification => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                >
                  <div className="notification-icon">
                    <span className="icon">{getCategoryIcon(notification.category)}</span>
                    <span className={`category-badge ${getCategoryColor(notification.category)}`}>
                      {notification.category}
                    </span>
                  </div>

                  <div className="notification-content">
                    <h3 className="notification-title">{notification.title}</h3>
                    <p className="notification-message">{notification.message}</p>
                    <div className="notification-meta">
                      <span className="notification-date">
                        {new Date(notification.created_at).toLocaleDateString()} at{' '}
                        {new Date(notification.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="notification-actions">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="action-btn read"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="action-btn delete"
                      title="Delete notification"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <div className="no-notifications-icon">🔔</div>
                <h3>No Notifications</h3>
                <p>You don't have any notifications at the moment.</p>
              </div>
            )
          ) : (
            filteredAnnouncements.length > 0 ? (
              filteredAnnouncements.map(announcement => (
                <div
                  key={announcement.id}
                  className="announcement-item"
                >
                  <div className="announcement-header">
                    <div className="announcement-priority">
                      <span className={`priority-badge priority-${announcement.priority.toLowerCase()}`}>
                        {announcement.priority}
                      </span>
                      <span className={`category-badge ${getCategoryColor(announcement.category)}`}>
                        {announcement.category}
                      </span>
                    </div>
                    <div className="announcement-date">
                      {new Date(announcement.createdAt).toLocaleDateString()} at{' '}
                      {new Date(announcement.createdAt).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="announcement-content">
                    <h3 className="announcement-title">{announcement.title}</h3>
                    <p className="announcement-message">{announcement.message}</p>
                    <div className="announcement-meta">
                      <span className="announcement-author">
                        📢 Live Announcement from Administration
                      </span>
                      {announcement.targetAudience !== 'All' && (
                        <span className="announcement-target">
                          Target: {announcement.targetAudience === 'Specific Year' ? `Year ${announcement.targetYear}` :
                                   announcement.targetAudience === 'Specific Semester' ? `Semester ${announcement.targetSemester}` :
                                   announcement.targetAudience === 'Specific Department' ? announcement.targetDepartment :
                                   announcement.targetAudience}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <div className="no-notifications-icon">📢</div>
                <h3>No Live Announcements</h3>
                <p>Announcements will appear here when broadcasted by administrators.</p>
              </div>
            )
          )}
        </div>
      </div>
      </div>
    </StudentLayout>
  );
};

export default StudentNotifications;