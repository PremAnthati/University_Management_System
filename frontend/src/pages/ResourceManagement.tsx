import React, { useEffect, useState } from 'react';
import api from '../services/api';
// import './ResourceManagement.css';

interface Resource {
  _id: string;
  name: string;
  type: string;
  description: string;
  quantity: number;
  available: number;
  status: string;
  location: string;
  assignedTo?: {
    name: string;
    email: string;
    studentId: string;
  };
  createdAt: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  status: string;
}

const ResourceManagement: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'equipment',
    description: '',
    quantity: 0,
    available: 0,
    location: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resourcesRes, studentsRes] = await Promise.all([
        api.get('/resources'),
        api.get('/students')
      ]);
      setResources(resourcesRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/resources', formData);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating resource:', error);
    }
  };

  const handleAssignResource = async () => {
    if (!selectedResource || !selectedStudent) return;

    try {
      await api.patch(`/resources/${selectedResource._id}/assign`, {
        studentId: selectedStudent
      });
      setShowAssignModal(false);
      setSelectedResource(null);
      setSelectedStudent('');
      fetchData();
    } catch (error) {
      console.error('Error assigning resource:', error);
    }
  };

  const handleReturnResource = async (resourceId: string) => {
    try {
      await api.patch(`/resources/${resourceId}/return`);
      fetchData();
    } catch (error) {
      console.error('Error returning resource:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'equipment',
      description: '',
      quantity: 0,
      available: 0,
      location: ''
    });
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'status-available';
      case 'in_use': return 'status-in-use';
      case 'maintenance': return 'status-maintenance';
      default: return 'status-default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'equipment': return 'type-equipment';
      case 'lab': return 'type-lab';
      case 'stationery': return 'type-stationery';
      default: return 'type-default';
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
                    Resource Management
                  </h1>
                  <p className="nav-subtitle">Manage equipment and facility resources</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="stat-number">{resources.filter(r => r.status === 'available').length}</h3>
              <p className="stat-label">Available Resources</p>
              <div className="stat-sublabel">Ready for assignment</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon approved">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="stat-number">{resources.filter(r => r.status === 'in_use').length}</h3>
              <p className="stat-label">In Use</p>
              <div className="stat-sublabel">Currently assigned</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon total">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="stat-number">{resources.length}</h3>
              <p className="stat-label">Total Resources</p>
              <div className="stat-sublabel">All registered items</div>
            </div>
          </div>

          {/* Add Resource Form Modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">Add New Resource</h2>
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
                      <label className="form-label">Resource Name</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., Laptop, Projector, Lab Equipment"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select
                        className="input-field"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        required
                      >
                        <option value="equipment">Equipment</option>
                        <option value="lab">Lab</option>
                        <option value="stationery">Stationery</option>
                        <option value="furniture">Furniture</option>
                        <option value="electronics">Electronics</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Brief description of the resource"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="e.g., Room 101, Lab 2, Storage A"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Total Quantity</label>
                      <input
                        type="number"
                        className="input-field"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                        min="1"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Available Quantity</label>
                      <input
                        type="number"
                        className="input-field"
                        value={formData.available}
                        onChange={(e) => setFormData({...formData, available: parseInt(e.target.value) || 0})}
                        min="0"
                        required
                      />
                    </div>
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
                      Add Resource
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Assign Resource Modal */}
          {showAssignModal && selectedResource && (
            <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">Assign Resource</h2>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="modal-close"
                  >
                    ×
                  </button>
                </div>

                <div className="modal-body">
                  <div className="resource-preview">
                    <h3 className="resource-name">{selectedResource.name}</h3>
                    <p className="resource-description">{selectedResource.description}</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Select Student</label>
                    <select
                      className="input-field"
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                    >
                      <option value="">Choose a student...</option>
                      {students
                        .filter(student => student.status === 'approved')
                        .map((student) => (
                          <option key={student._id} value={student._id}>
                            {student.name} ({student.studentId})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAssignModal(false);
                        setSelectedResource(null);
                        setSelectedStudent('');
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAssignResource}
                      disabled={!selectedStudent}
                      className="btn-primary"
                    >
                      Assign Resource
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Resources Section */}
          <div className="section">
            <div className="section-header">
              <div className="section-title-container">
                <div className="section-icon pending">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h2 className="section-title">
                    All Resources
                  </h2>
                  <p className="section-subtitle">Complete overview of all equipment and facility resources</p>
                </div>
              </div>
              <div className="section-badge">
                {resources.length} total resources
              </div>
            </div>

            <div className="table-container">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left">Resource Details</th>
                      <th className="text-left">Type & Location</th>
                      <th className="text-left">Quantity & Status</th>
                      <th className="text-left">Assignment</th>
                      <th className="text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((resource, index) => (
                      <tr key={resource._id} style={{ animationDelay: `${index * 0.1}s` }}>
                        <td>
                          <div className="student-info">
                            <div className="student-avatar pending">
                              {resource.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="student-name">{resource.name}</div>
                              <div className="student-email">{resource.description || 'No description'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <div className="student-id">{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</div>
                            <div className="student-department">{resource.location || 'No location specified'}</div>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <div className="student-id">Total: {resource.quantity}</div>
                            <div className="student-department">Available: {resource.available}</div>
                            <span className={`status-badge ${resource.status === 'available' ? 'approved' : resource.status === 'in_use' ? 'pending' : 'default'}`}>
                              {resource.status.replace('_', ' ').charAt(0).toUpperCase() + resource.status.replace('_', ' ').slice(1)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            {resource.assignedTo ? (
                              <>
                                <div className="student-id">{resource.assignedTo.name}</div>
                                <div className="student-department">ID: {resource.assignedTo.studentId}</div>
                              </>
                            ) : (
                              <div className="student-id">Not assigned</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {resource.status === 'available' && (
                              <button
                                onClick={() => {
                                  setSelectedResource(resource);
                                  setShowAssignModal(true);
                                }}
                                className="action-btn approve"
                              >
                                👤 Assign
                              </button>
                            )}
                            {resource.status === 'in_use' && (
                              <button
                                onClick={() => handleReturnResource(resource._id)}
                                className="action-btn reject"
                              >
                                ↩️ Return
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {resources.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="empty-state-title">No Resources Available</h3>
                <p className="empty-state-description">Start by adding equipment, lab resources, and facilities to the system. All resources will appear here.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="back-button"
                >
                  Add First Resource
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResourceManagement;