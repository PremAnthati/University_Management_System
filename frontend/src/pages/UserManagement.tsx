import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './UserManagement.css';

interface User {
  _id: string;
  name?: string;
  email: string;
  role: string;
  status?: string;
  facultyId?: string;
  studentId?: string;
  department?: string;
  designation?: string;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    password: '',
    department: '',
    designation: '',
    facultyId: '',
    studentId: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch users from different collections
      const [studentsRes, facultyRes, adminsRes] = await Promise.all([
        api.get('/students'),
        api.get('/faculty'),
        api.get('/auth/admins') // Assuming we add this endpoint
      ]);

      const allUsers = [
        ...studentsRes.data.map((user: any) => ({ ...user, role: 'student' })),
        ...facultyRes.data.map((user: any) => ({ ...user, role: 'faculty' })),
        ...adminsRes.data.map((user: any) => ({ ...user, role: 'admin' }))
      ];

      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update user based on role
        switch (editingUser.role) {
          case 'student':
            await api.put(`/students/${editingUser._id}`, formData);
            break;
          case 'faculty':
            await api.put(`/faculty/${editingUser._id}`, formData);
            break;
          case 'admin':
            await api.put(`/auth/admins/${editingUser._id}`, formData);
            break;
        }
      } else {
        // Create new user based on role
        switch (formData.role) {
          case 'student':
            await api.post('/students', formData);
            break;
          case 'faculty':
            await api.post('/faculty', formData);
            break;
          case 'admin':
            await api.post('/auth/admins', formData);
            break;
        }
      }
      fetchUsers();
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      role: user.role,
      password: '',
      department: user.department || '',
      designation: user.designation || '',
      facultyId: user.facultyId || '',
      studentId: user.studentId || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete this ${user.role}?`)) {
      try {
        switch (user.role) {
          case 'student':
            await api.delete(`/students/${user._id}`);
            break;
          case 'faculty':
            await api.delete(`/faculty/${user._id}`);
            break;
          case 'admin':
            await api.delete(`/auth/admins/${user._id}`);
            break;
        }
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleStatusChange = async (user: User, newStatus: string) => {
    try {
      switch (user.role) {
        case 'student':
          await api.patch(`/students/${user._id}/${newStatus === 'approved' ? 'approve' : 'reject'}`);
          break;
        case 'faculty':
          await api.put(`/faculty/${user._id}`, { status: newStatus });
          break;
      }
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'student',
      password: '',
      department: '',
      designation: '',
      facultyId: '',
      studentId: ''
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'role-admin';
      case 'faculty': return 'role-faculty';
      case 'student': return 'role-student';
      default: return 'status-default';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
      case 'active': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected':
      case 'inactive': return 'status-rejected';
      default: return 'status-default';
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
                    User Management
                  </h1>
                  <p className="nav-subtitle">Manage students, faculty, and administrators</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="stat-number">{users.filter(u => u.role === 'student').length}</h3>
              <p className="stat-label">Total Students</p>
              <div className="stat-sublabel">Enrolled users</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon approved">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="stat-number">{users.filter(u => u.role === 'faculty').length}</h3>
              <p className="stat-label">Faculty Members</p>
              <div className="stat-sublabel">Teaching staff</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon total">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="stat-number">{users.filter(u => u.role === 'admin').length}</h3>
              <p className="stat-label">Administrators</p>
              <div className="stat-sublabel">System admins</div>
            </div>
          </div>

          {/* Add User Form Modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">
                    {editingUser ? 'Edit User' : 'Add New User'}
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
                      <label className="form-label">Role</label>
                      <select
                        className="input-field"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        required
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="input-field"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>

                    {formData.role !== 'admin' && (
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                    )}

                    {formData.role === 'student' && (
                      <>
                        <div className="form-group">
                          <label className="form-label">Student ID</label>
                          <input
                            type="text"
                            className="input-field"
                            value={formData.studentId}
                            onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Department</label>
                          <select
                            className="input-field"
                            value={formData.department}
                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                            required
                          >
                            <option value="">Select Department</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Civil">Civil</option>
                            <option value="Electrical">Electrical</option>
                          </select>
                        </div>
                      </>
                    )}

                    {formData.role === 'faculty' && (
                      <>
                        <div className="form-group">
                          <label className="form-label">Faculty ID</label>
                          <input
                            type="text"
                            className="input-field"
                            value={formData.facultyId}
                            onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Department</label>
                          <select
                            className="input-field"
                            value={formData.department}
                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                            required
                          >
                            <option value="">Select Department</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Civil">Civil</option>
                            <option value="Electrical">Electrical</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Designation</label>
                          <select
                            className="input-field"
                            value={formData.designation}
                            onChange={(e) => setFormData({...formData, designation: e.target.value})}
                            required
                          >
                            <option value="Professor">Professor</option>
                            <option value="Associate Professor">Associate Professor</option>
                            <option value="Assistant Professor">Assistant Professor</option>
                            <option value="Lecturer">Lecturer</option>
                            <option value="Instructor">Instructor</option>
                          </select>
                        </div>
                      </>
                    )}

                    {!editingUser && (
                      <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          className="input-field"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          required={!editingUser}
                          placeholder="Initial password"
                        />
                      </div>
                    )}
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
                      {editingUser ? 'Update User' : 'Create User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* All Users Section */}
          <div className="section">
            <div className="section-header">
              <div className="section-title-container">
                <div className="section-icon pending">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="section-title">
                    All Users
                  </h2>
                  <p className="section-subtitle">Complete overview of all students, faculty, and administrators</p>
                </div>
              </div>
              <div className="section-badge">
                {users.length} total users
              </div>
            </div>

            <div className="table-container">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left">User Details</th>
                      <th className="text-left">Role & Department</th>
                      <th className="text-left">Status & ID</th>
                      <th className="text-left">Registration Date</th>
                      <th className="text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user._id} style={{ animationDelay: `${index * 0.1}s` }}>
                        <td>
                          <div className="student-info">
                            <div className="student-avatar pending">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="student-name">{user.name || user.email}</div>
                              <div className="student-email">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <span className={`status-badge ${user.role === 'admin' ? 'rejected' : user.role === 'faculty' ? 'pending' : 'approved'}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                            <div className="student-year">{user.department || 'No department'}</div>
                            {user.designation && (
                              <div className="student-department">{user.designation}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <span className={`status-badge ${user.status === 'approved' || user.status === 'active' ? 'approved' : user.status === 'pending' ? 'pending' : 'rejected'}`}>
                              {user.status || 'active'}
                            </span>
                            <div className="student-year">
                              {user.role === 'student' ? `ID: ${user.studentId}` :
                               user.role === 'faculty' ? `ID: ${user.facultyId}` :
                               'Administrator'}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="student-name">{new Date(user.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEdit(user)}
                              className="action-btn approve"
                            >
                              ✏ Edit
                            </button>
                            {user.role === 'student' && user.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(user, 'approved')}
                                  className="action-btn approve"
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  onClick={() => handleStatusChange(user, 'rejected')}
                                  className="action-btn reject"
                                >
                                  ✗ Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(user)}
                              className="action-btn reject"
                            >
                              🗑 Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {users.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="empty-state-title">No Users Available</h3>
                <p className="empty-state-description">Start by adding students, faculty members, and administrators to the system. All users will appear here.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="back-button"
                >
                  Add First User
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;