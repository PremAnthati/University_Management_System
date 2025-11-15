import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './InventoryManagement.css';

interface InventoryItem {
  _id: string;
  itemName: string;
  category: string;
  quantity: number;
  supplier: string;
  cost: number;
  status: string;
  location?: string;
}

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    itemName: '',
    category: 'equipment',
    quantity: 0,
    supplier: '',
    cost: 0,
    location: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inventory', newItem);
      setNewItem({
        itemName: '',
        category: 'equipment',
        quantity: 0,
        supplier: '',
        cost: 0,
        location: ''
      });
      fetchInventory();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating inventory item:', error);
    }
  };

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    try {
      await api.patch(`/inventory/${id}/quantity`, { quantity });
      fetchInventory();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await api.delete(`/inventory/${id}`);
        fetchInventory();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
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
                    Inventory Management
                  </h1>
                  <p className="nav-subtitle">Manage equipment and supplies</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="stat-number">{inventory.filter(i => i.status === 'in_stock').length}</h3>
              <p className="stat-label">In Stock Items</p>
              <div className="stat-sublabel">Available inventory</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon approved">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="stat-number">{inventory.reduce((sum, i) => sum + i.quantity, 0)}</h3>
              <p className="stat-label">Total Quantity</p>
              <div className="stat-sublabel">All items combined</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon total">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="stat-number">${inventory.reduce((sum, i) => sum + (i.cost * i.quantity), 0).toFixed(2)}</h3>
              <p className="stat-label">Total Value</p>
              <div className="stat-sublabel">Inventory worth</div>
            </div>
          </div>

          {/* Add Item Form Modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">
                    Add New Inventory Item
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="modal-close"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleCreateItem} className="form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Item Name</label>
                      <input
                        type="text"
                        required
                        className="input-field"
                        value={newItem.itemName}
                        onChange={(e) => setNewItem({...newItem, itemName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="input-field"
                        value={newItem.category}
                        onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      >
                        <option value="equipment">Equipment</option>
                        <option value="lab">Lab</option>
                        <option value="stationery">Stationery</option>
                        <option value="furniture">Furniture</option>
                        <option value="electronics">Electronics</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        required
                        className="input-field"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({...newItem, quantity: e.target.valueAsNumber || 0})}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Supplier</label>
                      <input
                        type="text"
                        className="input-field"
                        value={newItem.supplier}
                        onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cost per Unit</label>
                      <input
                        type="number"
                        step="0.01"
                        className="input-field"
                        value={newItem.cost}
                        onChange={(e) => setNewItem({...newItem, cost: e.target.valueAsNumber || 0})}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="input-field"
                        value={newItem.location}
                        onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                        placeholder="e.g., Room 101, Storage A"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Add Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* All Inventory Items Section */}
          <div className="section">
            <div className="section-header">
              <div className="section-title-container">
                <div className="section-icon pending">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h2 className="section-title">
                    All Inventory Items
                  </h2>
                  <p className="section-subtitle">Complete overview of all equipment and supplies</p>
                </div>
              </div>
              <div className="section-badge">
                {inventory.length} total items
              </div>
            </div>

            <div className="table-container">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left">Item Details</th>
                      <th className="text-left">Category & Supplier</th>
                      <th className="text-left">Quantity & Cost</th>
                      <th className="text-left">Status</th>
                      <th className="text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item, index) => (
                      <tr key={item._id} style={{ animationDelay: `${index * 0.1}s` }}>
                        <td>
                          <div className="student-info">
                            <div className="student-avatar pending">
                              {item.itemName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="student-name">{item.itemName}</div>
                              <div className="student-email">{item.location || 'No location specified'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <div className="student-id">{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</div>
                            <div className="student-department">{item.supplier || 'No supplier'}</div>
                          </div>
                        </td>
                        <td>
                          <div className="academic-info">
                            <div className="student-id">Quantity: {item.quantity}</div>
                            <div className="student-department">${item.cost.toFixed(2)} per unit</div>
                            <div className="student-year">Total: ${(item.cost * item.quantity).toFixed(2)}</div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${
                            item.status === 'in_stock' ? 'approved' :
                            item.status === 'out_of_stock' ? 'rejected' :
                            'pending'
                          }`}>
                            {item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.replace('_', ' ').slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <input
                              type="number"
                              placeholder="Update qty"
                              className="quantity-input"
                              min="0"
                              onChange={(e) => {
                                const newQuantity = e.target.valueAsNumber;
                                if (!isNaN(newQuantity)) {
                                  handleUpdateQuantity(item._id, newQuantity);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleDeleteItem(item._id)}
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

            {inventory.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="empty-state-title">No Inventory Items</h3>
                <p className="empty-state-description">Start by adding your first inventory item. All equipment and supplies will appear here.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="back-button"
                >
                  Add First Item
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InventoryManagement;