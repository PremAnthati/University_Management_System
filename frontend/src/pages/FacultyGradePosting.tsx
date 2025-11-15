import React, { useEffect, useState } from 'react';
import { facultyAPI } from '../services/api';
import './FacultyGradePosting.css';

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  department: string;
  credits: number;
  enrolledStudents: string[];
  semester: string;
  year: number;
}

interface Student {
  _id: string;
  full_name: string;
  email: string;
  registration_id: string;
}

interface GradeEntry {
  studentId: string;
  studentName: string;
  score: string;
  remarks: string;
}

const FacultyGradePosting: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [gradeEntries, setGradeEntries] = useState<GradeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [assessmentData, setAssessmentData] = useState({
    assessmentType: 'quiz',
    assessmentName: '',
    maxScore: '',
    weightage: '',
    semester: '',
    year: new Date().getFullYear().toString()
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsForCourse();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await facultyAPI.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForCourse = async () => {
    try {
      const response = await facultyAPI.getStudentsForCourse(selectedCourse);
      const courseStudents = response.data;

      // Initialize grade entries for all students
      const entries: GradeEntry[] = courseStudents.map((student: Student) => ({
        studentId: student._id,
        studentName: student.full_name,
        score: '',
        remarks: ''
      }));

      setStudents(courseStudents);
      setGradeEntries(entries);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleAssessmentDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssessmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGradeEntryChange = (studentId: string, field: 'score' | 'remarks', value: string) => {
    setGradeEntries(prev =>
      prev.map(entry =>
        entry.studentId === studentId
          ? { ...entry, [field]: value }
          : entry
      )
    );
  };

  const validateForm = () => {
    if (!selectedCourse || !assessmentData.assessmentName || !assessmentData.maxScore || !assessmentData.weightage) {
      alert('Please fill in all required fields');
      return false;
    }

    const maxScore = parseFloat(assessmentData.maxScore);
    const weightage = parseFloat(assessmentData.weightage);

    if (isNaN(maxScore) || maxScore <= 0) {
      alert('Please enter a valid maximum score');
      return false;
    }

    if (isNaN(weightage) || weightage <= 0 || weightage > 100) {
      alert('Please enter a valid weightage (1-100)');
      return false;
    }

    // Check if at least one student has a score
    const hasValidScores = gradeEntries.some(entry => {
      const score = parseFloat(entry.score);
      return !isNaN(score) && score >= 0 && score <= maxScore;
    });

    if (!hasValidScores) {
      alert('Please enter valid scores for at least one student');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // Filter out entries without scores
      const validEntries = gradeEntries.filter(entry => {
        const score = parseFloat(entry.score);
        return !isNaN(score) && score >= 0;
      });

      const gradesData = validEntries.map(entry => ({
        studentId: entry.studentId,
        score: parseFloat(entry.score),
        remarks: entry.remarks
      }));

      await facultyAPI.postBulkGrades({
        courseId: selectedCourse,
        assessmentType: assessmentData.assessmentType,
        assessmentName: assessmentData.assessmentName,
        maxScore: parseFloat(assessmentData.maxScore),
        weightage: parseFloat(assessmentData.weightage),
        grades: gradesData,
        semester: assessmentData.semester,
        year: parseInt(assessmentData.year)
      });

      alert('Grades posted successfully!');

      // Reset form
      setSelectedCourse('');
      setStudents([]);
      setGradeEntries([]);
      setAssessmentData({
        assessmentType: 'quiz',
        assessmentName: '',
        maxScore: '',
        weightage: '',
        semester: '',
        year: new Date().getFullYear().toString()
      });

    } catch (error: any) {
      console.error('Error posting grades:', error);
      alert(error.response?.data?.message || 'Failed to post grades. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="faculty-grade-posting-loading">
        <div className="loading-spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="faculty-grade-posting">
      <div className="header">
        <h1>Post Grades</h1>
        <p>Enter assessment details and student grades</p>
      </div>

      <form onSubmit={handleSubmit} className="grade-posting-form">
        {/* Course Selection */}
        <div className="form-section">
          <h2>Select Course</h2>
          <div className="form-group">
            <label htmlFor="course">Course:</label>
            <select
              id="course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              required
            >
              <option value="">Select a course...</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.courseCode} - {course.courseName} ({course.enrolledStudents.length} students)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assessment Details */}
        {selectedCourse && (
          <div className="form-section">
            <h2>Assessment Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="assessmentType">Assessment Type:</label>
                <select
                  id="assessmentType"
                  name="assessmentType"
                  value={assessmentData.assessmentType}
                  onChange={handleAssessmentDataChange}
                  required
                >
                  <option value="quiz">Quiz</option>
                  <option value="midterm">Midterm Exam</option>
                  <option value="final">Final Exam</option>
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                  <option value="lab">Lab Work</option>
                  <option value="presentation">Presentation</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="assessmentName">Assessment Name:</label>
                <input
                  type="text"
                  id="assessmentName"
                  name="assessmentName"
                  value={assessmentData.assessmentName}
                  onChange={handleAssessmentDataChange}
                  placeholder="e.g., Quiz 1, Midterm Exam"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxScore">Maximum Score:</label>
                <input
                  type="number"
                  id="maxScore"
                  name="maxScore"
                  value={assessmentData.maxScore}
                  onChange={handleAssessmentDataChange}
                  placeholder="e.g., 100"
                  min="1"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="weightage">Weightage (%):</label>
                <input
                  type="number"
                  id="weightage"
                  name="weightage"
                  value={assessmentData.weightage}
                  onChange={handleAssessmentDataChange}
                  placeholder="e.g., 20"
                  min="0.01"
                  max="100"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="semester">Semester:</label>
                <input
                  type="text"
                  id="semester"
                  name="semester"
                  value={assessmentData.semester}
                  onChange={handleAssessmentDataChange}
                  placeholder="e.g., Fall 2024"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="year">Year:</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={assessmentData.year}
                  onChange={handleAssessmentDataChange}
                  placeholder="e.g., 2024"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Student Grades */}
        {selectedCourse && students.length > 0 && (
          <div className="form-section">
            <h2>Student Grades</h2>
            <div className="grades-table-container">
              <table className="grades-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Registration ID</th>
                    <th>Score</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeEntries.map(entry => (
                    <tr key={entry.studentId}>
                      <td>{entry.studentName}</td>
                      <td>{students.find(s => s._id === entry.studentId)?.registration_id}</td>
                      <td>
                        <input
                          type="number"
                          value={entry.score}
                          onChange={(e) => handleGradeEntryChange(entry.studentId, 'score', e.target.value)}
                          placeholder="Score"
                          min="0"
                          max={assessmentData.maxScore}
                          step="0.01"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={entry.remarks}
                          onChange={(e) => handleGradeEntryChange(entry.studentId, 'remarks', e.target.value)}
                          placeholder="Remarks (optional)"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {selectedCourse && students.length > 0 && (
          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Posting Grades...' : 'Post Grades'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default FacultyGradePosting;