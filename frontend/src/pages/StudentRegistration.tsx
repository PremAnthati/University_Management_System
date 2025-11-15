import React, { useState, useEffect } from 'react';
import { studentAPI, adminAPI } from '../services/api';
import './StudentRegistration.css';

interface Department {
  _id: string;
  name: string;
  code?: string;
}

interface Course {
  _id: string;
  courseCode?: string;
  courseName?: string;
  name?: string;
  code?: string;
  department?: {
    _id: string;
    name: string;
    code?: string;
  };
}

const StudentRegistration: React.FC = () => {
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    department_id: '',
    course_id: '',
    year: '',
    semester: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetchDepartmentsAndCourses();
  }, []);

  const fetchDepartmentsAndCourses = async () => {
    try {
      setFetchLoading(true);
      const [deptResponse, courseResponse] = await Promise.all([
        adminAPI.getDepartments(),
        adminAPI.getCourses()
      ]);
      setDepartments(deptResponse.data);
      setCourses(courseResponse.data);
    } catch (error) {
      console.error('Error fetching departments and courses:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Reset course selection when department changes
      if (name === 'department_id') {
        newData.course_id = '';
      }
      return newData;
    });
  };


  const validateStep = (currentStep: number) => {
    const newErrors: any = {};

    if (currentStep === 1) {
      if (!formData.full_name || formData.full_name.length < 2 || formData.full_name.length > 100 || !/^[a-zA-Z\s]+$/.test(formData.full_name)) {
        newErrors.full_name = 'Full name must be 2-100 characters, letters and spaces only';
      }
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please provide a valid email';
      }
      if (!formData.phone_number || !/^[6-9]\d{9}$/.test(formData.phone_number)) {
        newErrors.phone_number = 'Please provide a valid 10-digit Indian mobile number';
      }
      if (!formData.date_of_birth) {
        newErrors.date_of_birth = 'Date of birth is required';
      }
      if (!formData.gender) {
        newErrors.gender = 'Gender is required';
      }
      if (!formData.address || formData.address.length < 10 || formData.address.length > 500) {
        newErrors.address = 'Address must be 10-500 characters';
      }
      if (!formData.city || formData.city.length < 2 || formData.city.length > 50) {
        newErrors.city = 'City must be 2-50 characters';
      }
      if (!formData.state || formData.state.length < 2 || formData.state.length > 50) {
        newErrors.state = 'State must be 2-50 characters';
      }
      if (!formData.pincode || !/^[1-9]\d{5}$/.test(formData.pincode)) {
        newErrors.pincode = 'Please provide a valid 6-digit pincode';
      }
    } else if (currentStep === 2) {
      if (!formData.department_id) newErrors.department_id = 'Department is required';
      if (!formData.course_id) newErrors.course_id = 'Course is required';
      if (!formData.year || parseInt(formData.year) < 1 || parseInt(formData.year) > 4) {
        newErrors.year = 'Year must be between 1 and 4';
      }
      if (!formData.semester || parseInt(formData.semester) < 1 || parseInt(formData.semester) > 8) {
        newErrors.semester = 'Semester must be between 1 and 8';
      }
    } else if (currentStep === 3) {
      if (formData.password.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
        newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.termsAccepted) {
        newErrors.termsAccepted = 'Please accept terms and conditions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const { confirmPassword, termsAccepted, ...submitData } = formData;
      // Convert string values to numbers where needed
      const formattedData = {
        ...submitData,
        year: parseInt(submitData.year),
        semester: parseInt(submitData.semester)
      };

      const response = await studentAPI.register(formattedData);
      alert(`Registration successful! Your registration ID is: ${response.data.registration_id}`);
      // Reset form and redirect to login
      setFormData({
        full_name: '',
        email: '',
        phone_number: '',
        date_of_birth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        department_id: '',
        course_id: '',
        year: '',
        semester: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false
      });
      setStep(1);
      // Could add navigation to login page here
    } catch (error: any) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on selected department
  const filteredCourses = formData.department_id
    ? courses.filter(course =>
        course.department && typeof course.department === 'object' && course.department._id === formData.department_id
      )
    : courses; // Show all courses if no department selected

  if (fetchLoading) {
    return (
      <div className="registration-container">
        <div className="registration-form">
          <h2>Student Registration</h2>
          <div className="loading">Loading form data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-container">
      <div className="registration-form">
        <h2>Student Registration</h2>

        {/* Progress Indicator */}
        <div className="progress-bar">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step">
              <h3>Personal Information</h3>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required />
                {errors.full_name && <span className="error">{errors.full_name}</span>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleInputChange} required />
                {errors.phone_number && <span className="error">{errors.phone_number}</span>}
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} required />
                {errors.date_of_birth && <span className="error">{errors.date_of_birth}</span>}
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <span className="error">{errors.gender}</span>}
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} required />
                {errors.address && <span className="error">{errors.address}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
                  {errors.city && <span className="error">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} required />
                  {errors.state && <span className="error">{errors.state}</span>}
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} required />
                  {errors.pincode && <span className="error">{errors.pincode}</span>}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h3>Academic Information</h3>
              <div className="form-group">
                <label>Department</label>
                <select name="department_id" value={formData.department_id} onChange={handleInputChange} required>
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
                {errors.department_id && <span className="error">{errors.department_id}</span>}
              </div>
              <div className="form-group">
                <label>Course/Program</label>
                <select name="course_id" value={formData.course_id} onChange={handleInputChange} required>
                  <option value="">Select Course</option>
                  {filteredCourses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.courseName || course.name} ({course.courseCode || course.code})
                    </option>
                  ))}
                </select>
                {errors.course_id && <span className="error">{errors.course_id}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Year</label>
                  <select name="year" value={formData.year} onChange={handleInputChange} required>
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                  {errors.year && <span className="error">{errors.year}</span>}
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <select name="semester" value={formData.semester} onChange={handleInputChange} required>
                    <option value="">Select Semester</option>
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                  </select>
                  {errors.semester && <span className="error">{errors.semester}</span>}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h3>Security</h3>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
                {errors.password && <span className="error">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))} />
                  I accept the Terms & Conditions
                </label>
                {errors.termsAccepted && <span className="error">{errors.termsAccepted}</span>}
              </div>
            </div>
          )}

          <div className="form-actions">
            {step > 1 && <button type="button" onClick={prevStep}>Previous</button>}
            {step < 3 && <button type="button" onClick={nextStep}>Next</button>}
            {step === 3 && <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistration;