import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './FacultyManagement.css';

interface Faculty {
  _id: string;
  name: string;
  email: string;
  facultyId: string;
  department: string;
  designation: string;
  specialization: string;
  phone: string;
  officeLocation: string;
  status: string;
  courses: any[];
  joiningDate: string;
}

const FacultyManagement: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    facultyId: '',
    department: '',
    designation: 'Assistant Professor',
    specialization: '',
    phone: '',
    officeLocation: '',
    password: '',
    joiningDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await api.get('/faculty');
      setFaculty(response.data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFaculty) {
        await api.put(`/faculty/${editingFaculty._id}`, formData);
      } else {
        await api.post('/faculty', formData);
      }
      fetchFaculty();
      resetForm();
    } catch (error) {
      console.error('Error saving faculty:', error);
    }
  };

  const handleEdit = (facultyMember: Faculty) => {
    setEditingFaculty(facultyMember);
    setFormData({
      name: facultyMember.name,
      email: facultyMember.email,
      facultyId: facultyMember.facultyId,
      department: facultyMember.department,
      designation: facultyMember.designation,
      specialization: facultyMember.specialization,
      phone: facultyMember.phone,
      officeLocation: facultyMember.officeLocation,
      password: '',
      joiningDate: new Date(facultyMember.joiningDate).toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await api.delete(`/faculty/${id}`);
        fetchFaculty();
      } catch (error) {
        console.error('Error deleting faculty:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      facultyId: '',
      department: '',
      designation: 'Assistant Professor',
      specialization: '',
      phone: '',
      officeLocation: '',
      password: '',
      joiningDate: new Date().toISOString().split('T')[0]
    });
    setEditingFaculty(null);
    setShowForm(false);
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
                    Faculty Management
                  </h1>
                  <p className="nav-subtitle">Manage teaching staff and instructors</p>
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
              <h3 className="stat-number">{faculty.filter(f => f.status === 'active').length}</h3>
              <p className="stat-label">Active Faculty</p>
              <div className="stat-sublabel">Teaching staff</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon approved">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="stat-number">{faculty.reduce((sum, f) => sum + (f.courses?.length || 0), 0)}</h3>
              <p className="stat-label">Total Courses</p>
              <div className="stat-sublabel">Assigned courses</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon total">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="stat-number">{faculty.length}</h3>
              <p className="stat-label">Total Faculty</p>
              <div className="stat-sublabel">All staff members</div>
            </div>
          </div>

          {/* Faculty Form Modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">
                    {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
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
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
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

                    <div className="form-group">
                      <label className="form-label">Specialization</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                        placeholder="e.g., Machine Learning, Data Structures"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="input-field"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Office Location</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.officeLocation}
                        onChange={(e) => setFormData({...formData, officeLocation: e.target.value})}
                        placeholder="e.g., Room 201, Block A"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Joining Date</label>
                      <input
                        type="date"
                        className="input-field"
                        value={formData.joiningDate}
                        onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                        required
                      />
                    </div>

                    {!editingFaculty && (
                      <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          className="input-field"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          required={!editingFaculty}
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
                      {editingFaculty ? 'Update Faculty' : 'Create Faculty'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* All Faculty Section */}
          <div className="section">
            <div className="section-header">
              <div className="section-title-container">
                <div className="section-icon students">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="section-title students">
                    All Faculty
                  </h2>
                  <p className="section-subtitle">Complete overview of all teaching staff</p>
                </div>
              </div>
              <div className="section-badge">
                {faculty.length} total faculty
              </div>
            </div>

            <div className="table-container">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left">Faculty Details</th>
                      <th className="text-left">Academic Info</th>
                      <th className="text-left">Contact & Office</th>
                      <th className="text-left">Status</th>
                      <th className="text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faculty.map((member, index) => (
                      <tr key={member._id} style={{ animationDelay: `${index * 0.1}s` }}>
                        <td>
                          <div className="student-info">
                            <div className="student-avatar pending">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="student-name">{member.name}</div>
                              <div className="student-email">ID: {member.facultyId}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <div className="student-id">{member.designation}</div>
                            <div className="student-department">{member.department}</div>
                            <div className="student-year">{member.specialization || 'No specialization'}</div>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <div className="student-id">{member.email}</div>
                            <div className="student-department">{member.phone || 'No phone'}</div>
                            <div className="student-year">{member.officeLocation || 'No office assigned'}</div>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <span className={`status-badge ${member.status}`}>
                              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                            </span>
                            <div className="student-year">{member.courses?.length || 0} courses assigned</div>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEdit(member)}
                              className="action-btn approve"
                            >
                              ✏ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(member._id)}
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

            {faculty.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="empty-state-title">No Faculty Members</h3>
                <p className="empty-state-description">Start by adding your first faculty member. All teaching staff will appear here.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="back-button"
                >
                  Add First Faculty
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FacultyManagement;