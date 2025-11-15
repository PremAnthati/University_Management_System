import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import socketService from '../services/socket';
import './AnnouncementManagement.css';

interface Announcement {
  _id: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  targetAudience: string;
  targetYear?: number;
  targetSemester?: number;
  targetDepartment?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: {
    username: string;
    email: string;
  };
}

const AnnouncementManagement: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'General',
    priority: 'Medium',
    targetAudience: 'All',
    targetYear: '',
    targetSemester: '',
    targetDepartment: '',
    expiresAt: ''
  });

  useEffect(() => {
    // Connect to socket and join admin room
    const socket = socketService.connect();
    socketService.joinAdminRoom();

    // Listen for announcement confirmation
    const handleAnnouncementSent = (announcement: any) => {
      console.log('Announcement broadcasted successfully:', announcement);
      // Could show a success notification here
    };

    socketService.onAnnouncementSent(handleAnnouncementSent);

    return () => {
      socketService.off('announcement-sent', handleAnnouncementSent);
    };
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const announcementData = {
        ...formData,
        targetYear: formData.targetYear ? parseInt(formData.targetYear) : undefined,
        targetSemester: formData.targetSemester ? parseInt(formData.targetSemester) : undefined,
        expiresAt: formData.expiresAt || undefined
      };

      // Create announcement via API (saves to database)
      const response = await adminAPI.createAnnouncement(announcementData);

      // Broadcast via Socket.IO for real-time delivery
      socketService.sendAnnouncement({
        id: response.data._id,
        title: response.data.title,
        message: response.data.message,
        category: response.data.category,
        priority: response.data.priority,
        targetAudience: response.data.targetAudience,
        targetYear: response.data.targetYear,
        targetSemester: response.data.targetSemester,
        targetDepartment: response.data.targetDepartment,
        createdAt: response.data.createdAt,
        createdBy: response.data.createdBy
      });

      // Reset form
      setFormData({
        title: '',
        message: '',
        category: 'General',
        priority: 'Medium',
        targetAudience: 'All',
        targetYear: '',
        targetSemester: '',
        targetDepartment: '',
        expiresAt: ''
      });

      setShowCreateForm(false);

      alert('🎉 Announcement created and broadcasted in real-time to all students!');
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Emergency': return 'text-red-700 bg-red-200';
      case 'Important': return 'text-purple-700 bg-purple-200';
      case 'Academic': return 'text-blue-700 bg-blue-200';
      case 'Events': return 'text-green-700 bg-green-200';
      default: return 'text-gray-700 bg-gray-200';
    }
  };

  return (
    <div className="announcement-management-container">
      {/* Navigation */}
      <nav className="glass-nav">
        <div className="nav-container">
          <div className="nav-content">
            <div className="nav-left">
              <div className="nav-logo-container">
                <div className="nav-logo">
                  <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div>
                  <h1 className="nav-title">Announcement Management</h1>
                  <p className="nav-subtitle">Broadcast real-time announcements to students</p>
                </div>
              </div>
            </div>
            <div className="nav-right">
              <div className="nav-status">
                <div className="status-indicator"></div>
                <span>Real-time Active</span>
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
          {/* Create Announcement Button */}
          <div className="action-bar">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="create-announcement-btn"
            >
              {showCreateForm ? 'Cancel' : '+ Create Announcement'}
            </button>
          </div>

          {/* Create Announcement Form */}
          {showCreateForm && (
            <div className="announcement-form-container">
              <div className="form-header">
                <h2>Create New Announcement</h2>
                <p>This announcement will be broadcasted to all relevant students in real-time</p>
              </div>

              <form onSubmit={handleSubmit} className="announcement-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter announcement title"
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange}>
                      <option value="General">General</option>
                      <option value="Academic">Academic</option>
                      <option value="Events">Events</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Important">Important</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select name="priority" value={formData.priority} onChange={handleInputChange}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Enter the announcement message"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Target Audience</label>
                    <select
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleInputChange}
                    >
                      <option value="All">All Students</option>
                      <option value="Specific Year">Specific Year</option>
                      <option value="Specific Semester">Specific Semester</option>
                      <option value="Specific Department">Specific Department</option>
                    </select>
                  </div>

                  {formData.targetAudience === 'Specific Year' && (
                    <div className="form-group">
                      <label>Year</label>
                      <select name="targetYear" value={formData.targetYear} onChange={handleInputChange}>
                        <option value="">Select Year</option>
                        {[1, 2, 3, 4].map(year => (
                          <option key={year} value={year}>Year {year}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.targetAudience === 'Specific Semester' && (
                    <div className="form-group">
                      <label>Semester</label>
                      <select name="targetSemester" value={formData.targetSemester} onChange={handleInputChange}>
                        <option value="">Select Semester</option>
                        {[1, 2].map(sem => (
                          <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.targetAudience === 'Specific Department' && (
                    <div className="form-group">
                      <label>Department</label>
                      <input
                        type="text"
                        name="targetDepartment"
                        value={formData.targetDepartment}
                        onChange={handleInputChange}
                        placeholder="Enter department code"
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label>Expiration Date (Optional)</label>
                    <input
                      type="datetime-local"
                      name="expiresAt"
                      value={formData.expiresAt}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? 'Broadcasting...' : '📢 Broadcast Announcement'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Real-time Info Section */}
          <div className="announcements-section">
            <div className="section-header">
              <h2>Real-Time Broadcasting</h2>
            </div>

            <div className="real-time-info">
              <div className="info-card">
                <div className="info-icon">⚡</div>
                <div className="info-content">
                  <h3>Instant Delivery</h3>
                  <p>Announcements are broadcasted immediately to all connected students via Socket.IO</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">🎯</div>
                <div className="info-content">
                  <h3>Targeted Messaging</h3>
                  <p>Send announcements to specific years, semesters, departments, or all students</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">🔔</div>
                <div className="info-content">
                  <h3>Browser Notifications</h3>
                  <p>Students receive desktop notifications when announcements arrive</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">📱</div>
                <div className="info-content">
                  <h3>Real-Time Updates</h3>
                  <p>Students see announcements instantly without page refresh</p>
                </div>
              </div>
            </div>

            <div className="broadcast-status">
              <div className="status-indicator active"></div>
              <span>Real-time broadcasting system is active and ready</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnnouncementManagement;