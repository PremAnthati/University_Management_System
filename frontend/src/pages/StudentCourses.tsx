import React, { useEffect, useState } from 'react';
import { studentAPI } from '../services/api';
import StudentLayout from '../components/StudentLayout';
import './StudentCourses.css';

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  department: string;
  credits: number;
  faculty: string;
  semester: string;
  description?: string;
  syllabus?: string;
  objectives?: string[];
  outcomes?: string[];
  studyMaterials?: string[];
}

const StudentCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const studentData = JSON.parse(localStorage.getItem('student') || '{}');
      const response = await studentAPI.getCourses(studentData.id);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
  };

  const closeCourseDetails = () => {
    setSelectedCourse(null);
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <StudentLayout activePage="courses">
      <div className="student-courses">
      <div className="courses-header">
        <h1>My Courses</h1>
        <p className="courses-count">{courses.length} enrolled courses</p>
      </div>

      <div className="courses-content">
        <div className="courses-grid">
          {courses.map(course => (
            <div
              key={course._id}
              className="course-card"
              onClick={() => handleCourseClick(course)}
            >
              <div className="course-header">
                <div className="course-code">{course.courseCode}</div>
                <div className="course-credits">{course.credits} Credits</div>
              </div>

              <h3 className="course-name">{course.courseName}</h3>

              <div className="course-info">
                <div className="info-item">
                  <span className="label">Department:</span>
                  <span className="value">{course.department}</span>
                </div>
                <div className="info-item">
                  <span className="label">Faculty:</span>
                  <span className="value">{course.faculty || 'TBA'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Semester:</span>
                  <span className="value">{course.semester}</span>
                </div>
              </div>

              <div className="course-actions">
                <button className="view-details-btn">View Details</button>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="no-courses">
            <div className="no-courses-icon">📚</div>
            <h3>No Courses Enrolled</h3>
            <p>You haven't enrolled in any courses yet.</p>
          </div>
        )}
      </div>

      {selectedCourse && (
        <div className="course-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedCourse.courseName}</h2>
              <button onClick={closeCourseDetails} className="close-btn">×</button>
            </div>

            <div className="modal-body">
              <div className="course-overview">
                <div className="overview-item">
                  <strong>Course Code:</strong> {selectedCourse.courseCode}
                </div>
                <div className="overview-item">
                  <strong>Credits:</strong> {selectedCourse.credits}
                </div>
                <div className="overview-item">
                  <strong>Department:</strong> {selectedCourse.department}
                </div>
                <div className="overview-item">
                  <strong>Faculty:</strong> {selectedCourse.faculty || 'To be assigned'}
                </div>
                <div className="overview-item">
                  <strong>Semester:</strong> {selectedCourse.semester}
                </div>
              </div>

              {selectedCourse.description && (
                <div className="course-section">
                  <h3>Course Description</h3>
                  <p>{selectedCourse.description}</p>
                </div>
              )}

              {selectedCourse.objectives && selectedCourse.objectives.length > 0 && (
                <div className="course-section">
                  <h3>Course Objectives</h3>
                  <ul>
                    {selectedCourse.objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedCourse.outcomes && selectedCourse.outcomes.length > 0 && (
                <div className="course-section">
                  <h3>Learning Outcomes</h3>
                  <ul>
                    {selectedCourse.outcomes.map((outcome, index) => (
                      <li key={index}>{outcome}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedCourse.syllabus && (
                <div className="course-section">
                  <h3>Syllabus</h3>
                  <div className="syllabus-content">
                    {selectedCourse.syllabus}
                  </div>
                </div>
              )}

              {selectedCourse.studyMaterials && selectedCourse.studyMaterials.length > 0 && (
                <div className="course-section">
                  <h3>Study Materials</h3>
                  <div className="materials-list">
                    {selectedCourse.studyMaterials.map((material, index) => (
                      <div key={index} className="material-item">
                        <span className="material-icon">📄</span>
                        <span className="material-name">{material}</span>
                        <button className="download-btn">Download</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="course-actions">
                <button className="contact-faculty-btn">Contact Faculty</button>
                <button className="view-timetable-btn">View in Timetable</button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </StudentLayout>
  );
};

export default StudentCourses;