import React, { useEffect, useState, useContext } from 'react';
import { studentAPI } from '../services/api';
import StudentLayout, { AcademicContext } from '../components/StudentLayout';
import './StudentResults.css';

interface Result {
  _id: string;
  course_id: {
    _id: string;
    courseCode: string;
    courseName: string;
    credits: number;
  };
  semester: number;
  year: number;
  exam_type: string;
  internal_marks: number;
  external_marks: number;
  total_marks: number;
  grade: string;
  credits: number;
  status: string;
  published_date: string;
}

const StudentResults: React.FC = () => {
  const { selectedYear, selectedSemester } = useContext(AcademicContext) || {};
  const [results, setResults] = useState<Result[]>([]);
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    semester: selectedSemester?.toString() || '',
    year: selectedYear?.toString() || '',
    examType: ''
  });

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [results, filters]);

  const fetchResults = async () => {
    try {
      const studentData = JSON.parse(localStorage.getItem('student') || '{}');
      const params = selectedYear || selectedSemester ? {
        ...(selectedYear && { year: selectedYear }),
        ...(selectedSemester && { semester: selectedSemester })
      } : undefined;

      const response = await studentAPI.getResults(studentData.id, params);
      setResults(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = results;

    if (filters.semester) {
      filtered = filtered.filter(result => result.semester === parseInt(filters.semester));
    }

    if (filters.year) {
      filtered = filtered.filter(result => result.year === parseInt(filters.year));
    }

    if (filters.examType) {
      filtered = filtered.filter(result => result.exam_type === filters.examType);
    }

    setFilteredResults(filtered);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const calculateGPA = (results: Result[]) => {
    if (results.length === 0) return 0;
    const totalCredits = results.reduce((sum, result) => sum + result.credits, 0);
    const weightedPoints = results.reduce((sum, result) => {
      let points = 0;
      switch(result.grade) {
        case 'A': points = 4; break;
        case 'B': points = 3; break;
        case 'C': points = 2; break;
        case 'D': points = 1; break;
        default: points = 0;
      }
      return sum + (points * result.credits);
    }, 0);
    return totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : 0;
  };

  const downloadGradeSheet = () => {
    // Implementation for downloading grade sheet
    alert('Grade sheet download functionality would be implemented here');
  };

  if (loading) {
    return <div className="loading">Loading results...</div>;
  }

  return (
    <StudentLayout activePage="results">
      <div className="student-results">
      <div className="results-header">
        <h1>Academic Results</h1>
        <button onClick={downloadGradeSheet} className="download-btn">
          Download Grade Sheet
        </button>
      </div>

      <div className="results-summary">
        <div className="summary-card">
          <h3>Total Courses</h3>
          <p>{results.length}</p>
        </div>
        <div className="summary-card">
          <h3>Overall GPA</h3>
          <p>{calculateGPA(results)}</p>
        </div>
        <div className="summary-card">
          <h3>Passed Courses</h3>
          <p>{results.filter(r => r.status === 'Pass').length}</p>
        </div>
        <div className="summary-card">
          <h3>Failed Courses</h3>
          <p>{results.filter(r => r.status === 'Fail').length}</p>
        </div>
      </div>

      <div className="filters-section">
        <h2>Filter Results</h2>
        <div className="filters">
          <div className="filter-group">
            <label>Semester</label>
            <select name="semester" value={filters.semester} onChange={handleFilterChange}>
              <option value="">All Semesters</option>
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
              <option value="3">3rd Semester</option>
              <option value="4">4th Semester</option>
              <option value="5">5th Semester</option>
              <option value="6">6th Semester</option>
              <option value="7">7th Semester</option>
              <option value="8">8th Semester</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Year</label>
            <select name="year" value={filters.year} onChange={handleFilterChange}>
              <option value="">All Years</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Exam Type</label>
            <select name="examType" value={filters.examType} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="Mid-term">Mid-term</option>
              <option value="Final">Final</option>
            </select>
          </div>
        </div>
      </div>

      <div className="results-table">
        <table>
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Semester</th>
              <th>Year</th>
              <th>Exam Type</th>
              <th>Internal Marks</th>
              <th>External Marks</th>
              <th>Total Marks</th>
              <th>Grade</th>
              <th>Credits</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.length > 0 ? (
              filteredResults.map(result => (
                <tr key={result._id}>
                  <td>{result.course_id?.courseCode || 'N/A'}</td>
                  <td>{result.course_id?.courseName || 'N/A'}</td>
                  <td>{result.semester}</td>
                  <td>{result.year}</td>
                  <td>{result.exam_type}</td>
                  <td>{result.internal_marks}</td>
                  <td>{result.external_marks}</td>
                  <td>{result.total_marks}</td>
                  <td className={`grade ${result.grade.startsWith('A') ? 'excellent' : result.grade.startsWith('B') ? 'good' : 'average'}`}>
                    {result.grade}
                  </td>
                  <td>{result.credits}</td>
                  <td className={`status ${result.status.toLowerCase()}`}>
                    {result.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="no-results">No results found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredResults.length > 0 && (
        <div className="results-footer">
          <div className="gpa-summary">
            <h3>Semester GPA: {calculateGPA(filteredResults)}</h3>
            <p>Total Credits: {filteredResults.reduce((sum, r) => sum + r.credits, 0)}</p>
          </div>
        </div>
      )}
      </div>
    </StudentLayout>
  );
};

export default StudentResults;