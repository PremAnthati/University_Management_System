import React, { useState } from 'react';
import { facultyAPI } from '../services/api';
import './FacultyLogin.css';

const FacultyLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await facultyAPI.login(formData);
      const { token, faculty } = response.data;

      // Store token and faculty data
      localStorage.setItem('token', token);
      localStorage.setItem('faculty', JSON.stringify(faculty));

      // Redirect to faculty dashboard
      window.location.href = '/faculty/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="faculty-login-container">
      <div className="faculty-login-card">
        <div className="login-header">
          <h1>Faculty Login</h1>
          <p>Access your faculty dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            <a href="/student/login">Student Login</a> |
            <a href="/admin/login"> Admin Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FacultyLogin;