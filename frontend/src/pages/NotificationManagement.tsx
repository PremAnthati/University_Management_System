import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './NotificationManagement.css';

interface Notification {
  _id: string;
  title: string;
  message: string;
  category: string;
  student_id: {
    full_name: string;
    registration_id: string;
    email: string;
  } | null;
  is_read: boolean;
  created_at: string;
}

const NotificationManagement: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'General',
    student_id: '',
    year: '',
    semester: ''
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const notificationData = {
        title: formData.title,
        message: formData.message,
        category: formData.category,
        student_id: formData.student_id || null,
        year: formData.year ? parseInt(formData.year) : undefined,
        semester: formData.semester ? parseInt(formData.semester) : undefined
      };

      await api.post('/notifications', notificationData);
      fetchNotifications();
      resetForm();
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Failed to send notification');
    }
  };

  const handleSendNow = async (notificationId: string) => {
    try {
      await api.post(`/notifications/${notificationId}/send`);
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      category: 'General',
      student_id: '',
      year: '',
      semester: ''
    });
    setShowForm(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'type-announcement';
      case 'reminder': return 'type-reminder';
      case 'alert': return 'type-alert';
      case 'grade': return 'type-grade';
      case 'attendance': return 'type-attendance';
      default: return 'status-draft';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'normal': return 'priority-normal';
      case 'low': return 'priority-low';
      default: return 'priority-normal';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'status-sent';
      case 'scheduled': return 'status-scheduled';
      case 'draft': return 'status-draft';
      case 'failed': return 'status-failed';
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
                    Notification Management
                  </h1>
                  <p className="nav-subtitle">Send and manage communications</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="stat-number">{notifications.filter(n => n.student_id === null).length}</h3>
              <p className="stat-label">Broadcast Messages</p>
              <div className="stat-sublabel">Sent to all students</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon approved">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="stat-number">{notifications.filter(n => n.student_id !== null).length}</h3>
              <p className="stat-label">Personal Messages</p>
              <div className="stat-sublabel">Individual communications</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon total">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h3 className="stat-number">{notifications.length}</h3>
              <p className="stat-label">Total Notifications</p>
              <div className="stat-sublabel">All communications</div>
            </div>
          </div>

          {/* Create Notification Form Modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">Create New Notification</h2>
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
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Notification title"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="input-field"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="General">General</option>
                        <option value="Academic">Academic</option>
                        <option value="Fees">Fees</option>
                        <option value="Events">Events</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Important">Important</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Target Audience</label>
                      <select
                        className="input-field"
                        value={formData.student_id || 'all'}
                        onChange={(e) => setFormData({...formData, student_id: e.target.value === 'all' ? '' : e.target.value})}
                      >
                        <option value="all">All Students (Broadcast)</option>
                        <option value="specific">Specific Student</option>
                      </select>
                    </div>

                    {formData.student_id && (
                      <div className="form-group">
                        <label className="form-label">Student ID</label>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.student_id}
                          onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                          placeholder="Enter student registration ID"
                        />
                      </div>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Message</label>
                    <textarea
                      className="input-field"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Notification message content"
                      required
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
                      📢 Send Notification
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* All Notifications Section */}
          <div className="section">
            <div className="section-header">
              <div className="section-title-container">
                <div className="section-icon pending">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="section-title">
                    All Notifications
                  </h2>
                  <p className="section-subtitle">Complete overview of all sent and scheduled communications</p>
                </div>
              </div>
              <div className="section-badge">
                {notifications.length} total notifications
              </div>
            </div>

            <div className="table-container">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left">Notification Details</th>
                      <th className="text-left">Category & Recipients</th>
                      <th className="text-left">Read Status</th>
                      <th className="text-left">Created</th>
                      <th className="text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((notification, index) => (
                      <tr key={notification._id} style={{ animationDelay: `${index * 0.1}s` }}>
                        <td>
                          <div className="student-info">
                            <div className="student-avatar pending">
                              {notification.title.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="student-name">{notification.title}</div>
                              <div className="student-email">{notification.message.substring(0, 50)}...</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <div className="student-id">{notification.category}</div>
                            <div className="student-department">
                              {notification.student_id ? `To: ${notification.student_id.full_name}` : 'Broadcast to all students'}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <span className={`status-badge ${notification.is_read ? 'approved' : 'pending'}`}>
                              {notification.is_read ? 'Read' : 'Unread'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <div className="student-id">{new Date(notification.created_at).toLocaleDateString()}</div>
                            <div className="student-department">{new Date(notification.created_at).toLocaleTimeString()}</div>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => {/* Handle view details */}}
                              className="action-btn approve"
                            >
                              👁️ View
                            </button>
                            <button
                              onClick={() => {/* Handle delete */}}
                              className="action-btn reject"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {notifications.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="empty-state-title">No Notifications Yet</h3>
                <p className="empty-state-description">Start by creating your first notification to communicate with students and faculty.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="back-button"
                >
                  Create First Notification
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationManagement;