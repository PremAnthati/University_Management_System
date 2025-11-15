import React, { useEffect, useState, useContext } from 'react';
import { studentAPI } from '../services/api';
import api from '../services/api';
import StudentLayout, { AcademicContext } from '../components/StudentLayout';
import './StudentProfile.css';

interface Student {
  _id: string;
  full_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  department_id: string;
  course_id: string;
  year: number;
  semester: number;
  profile_photo?: string;
  registration_status: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

const StudentProfile: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Student>>({});
  const academicContext = useContext(AcademicContext);

  useEffect(() => {
    fetchProfile();
    fetchEnrolledCourses();
  }, [academicContext?.selectedYear, academicContext?.selectedSemester]);

  const fetchProfile = async () => {
    try {
      const studentData = JSON.parse(localStorage.getItem('student') || '{}');
      const response = await studentAPI.getProfile(studentData.id);
      setStudent(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const studentData = JSON.parse(localStorage.getItem('student') || '{}');
      const params = new URLSearchParams();

      if (academicContext?.selectedYear) {
        params.append('year', academicContext.selectedYear.toString());
      }
      if (academicContext?.selectedSemester) {
        params.append('semester', academicContext.selectedSemester.toString());
      }

      const queryString = params.toString();
      const url = queryString ? `/students/${studentData.id}/courses?${queryString}` : `/students/${studentData.id}/courses`;

      const response = await api.get(url);
      setEnrolledCourses(response.data);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!student) return;
    setSaving(true);
    try {
      await studentAPI.updateProfile(student._id, formData);
      setStudent({ ...student, ...formData });
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(student || {});
    setIsEditing(false);
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!student) {
    return <div className="error">Failed to load profile</div>;
  }

  return (
    <StudentLayout activePage="profile">
        <div className="student-profile">
          <div className="profile-header">
            <h1>Student Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="edit-btn"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="profile-content">
            <div className="profile-photo-section">
              <div className="profile-photo">
                {student.profile_photo ? (
                  <img src={student.profile_photo} alt="Profile" />
                ) : (
                  <div className="default-avatar">
                    {(student.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {isEditing && (
                <button className="change-photo-btn">Change Photo</button>
              )}
            </div>

            <div className="profile-details">
          <div className="profile-section">
            <h2>Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{student.full_name}</p>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                <p>{student.email}</p>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{student.phone_number}</p>
                )}
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <p>{new Date(student.date_of_birth).toLocaleDateString()}</p>
              </div>

              <div className="form-group">
                <label>Gender</label>
                <p>{student.gender}</p>
              </div>

              <div className="form-group">
                <label>Registration Status</label>
                <span className={`status-badge ${student.registration_status.toLowerCase()}`}>
                  {student.registration_status}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2>Address Information</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Address</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{student.address}</p>
                )}
              </div>

              <div className="form-group">
                <label>City</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{student.city}</p>
                )}
              </div>

              <div className="form-group">
                <label>State</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={formData.state || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{student.state}</p>
                )}
              </div>

              <div className="form-group">
                <label>Pincode</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{student.pincode}</p>
                )}
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2>Academic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Department</label>
                <p>Computer Science</p> {/* Placeholder */}
              </div>

              <div className="form-group">
                <label>Course</label>
                <p>B.Tech</p> {/* Placeholder */}
              </div>

              <div className="form-group">
                <label>Year</label>
                <p>{student.year} Year</p>
              </div>

              <div className="form-group">
                <label>Semester</label>
                <p>{student.semester} Semester</p>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2>Current Semester Courses</h2>
            <div className="courses-list">
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map(course => (
                  <div key={course._id} className="course-item">
                    <div className="course-header">
                      <h3>{course.courseCode} - {course.courseName}</h3>
                      <span className="course-credits">{course.credits} Credits</span>
                    </div>
                    <div className="course-details">
                      <p className="course-description">{course.description}</p>
                      <div className="course-info">
                        <span className="course-faculty">
                          Faculty: {course.faculty?.name || 'TBA'}
                        </span>
                        <span className="course-schedule">
                          {course.schedule?.days?.join(', ')} | {course.schedule?.startTime} - {course.schedule?.endTime}
                        </span>
                        <span className="course-room">
                          Room: {course.schedule?.classroom || 'TBA'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-courses">
                  <p>No courses enrolled for the selected academic period.</p>
                  <p>Please select your current year and semester to view enrolled courses.</p>
                </div>
              )}
            </div>
          </div>

          {student.emergencyContact && (
            <div className="profile-section">
              <h2>Emergency Contact</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name</label>
                  <p>{student.emergencyContact.name}</p>
                </div>

                <div className="form-group">
                  <label>Relationship</label>
                  <p>{student.emergencyContact.relationship}</p>
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <p>{student.emergencyContact.phone}</p>
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="profile-actions">
              <button onClick={handleSave} disabled={saving} className="save-btn">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;