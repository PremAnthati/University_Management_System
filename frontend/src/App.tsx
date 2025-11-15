import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import MainDashboard from './pages/MainDashboard';
import StudentManagement from './pages/StudentManagement';
import CourseManagement from './pages/CourseManagement';
import FacultyManagement from './pages/FacultyManagement';
import ResourceManagement from './pages/ResourceManagement';
import InventoryManagement from './pages/InventoryManagement';
import Reports from './pages/Reports';
import GradeManagement from './pages/GradeManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import UserManagement from './pages/UserManagement';
import NotificationManagement from './pages/NotificationManagement';
import AnnouncementManagement from './pages/AnnouncementManagement';
import StudentPortal from './pages/StudentPortal';
import StudentLogin from './pages/StudentLogin';
import StudentRegistration from './pages/StudentRegistration';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import StudentResults from './pages/StudentResults';
import StudentFees from './pages/StudentFees';
import StudentTimetable from './pages/StudentTimetable';
import StudentAttendance from './pages/StudentAttendance';
import StudentNotifications from './pages/StudentNotifications';
import StudentCourses from './pages/StudentCourses';
import StudentNews from './pages/StudentNews';
import StudentChat from './pages/StudentChat';
import FacultyLogin from './pages/FacultyLogin';
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyGradePosting from './pages/FacultyGradePosting';
import FacultyAttendanceManagement from './pages/FacultyAttendanceManagement';
import FacultyCourseMaterials from './pages/FacultyCourseMaterials';
import FacultyStudentDetails from './pages/FacultyStudentDetails';

const App: React.FC = () => {
  const token = localStorage.getItem('token');
  const studentToken = localStorage.getItem('studentToken');
  const facultyData = localStorage.getItem('faculty');

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main Dashboard - Public */}
          <Route path="/" element={<MainDashboard />} />

          {/* Faculty Routes - Public */}
          <Route path="/faculty/login" element={<FacultyLogin />} />

          {/* Student Routes - Public */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/register" element={<StudentRegistration />} />

          {/* Student Routes - Protected */}
          <Route path="/student/dashboard" element={studentToken ? <StudentDashboard /> : <Navigate to="/student/login" />} />
          <Route path="/student/profile" element={studentToken ? <StudentProfile /> : <Navigate to="/student/login" />} />
          <Route path="/student/results" element={studentToken ? <StudentResults /> : <Navigate to="/student/login" />} />
          <Route path="/student/fees" element={studentToken ? <StudentFees /> : <Navigate to="/student/login" />} />
          <Route path="/student/timetable" element={studentToken ? <StudentTimetable /> : <Navigate to="/student/login" />} />
          <Route path="/student/attendance" element={studentToken ? <StudentAttendance /> : <Navigate to="/student/login" />} />
          <Route path="/student/notifications" element={studentToken ? <StudentNotifications /> : <Navigate to="/student/login" />} />
          <Route path="/student/news" element={studentToken ? <StudentNews /> : <Navigate to="/student/login" />} />
          <Route path="/student/chat" element={studentToken ? <StudentChat /> : <Navigate to="/student/login" />} />
          <Route path="/student/courses" element={studentToken ? <StudentCourses /> : <Navigate to="/student/login" />} />

          {/* Faculty Routes - Protected */}
          <Route path="/faculty/dashboard" element={facultyData ? <FacultyDashboard /> : <Navigate to="/faculty/login" />} />
          <Route path="/faculty/grades" element={facultyData ? <FacultyGradePosting /> : <Navigate to="/faculty/login" />} />
          <Route path="/faculty/attendance" element={facultyData ? <FacultyAttendanceManagement /> : <Navigate to="/faculty/login" />} />
          <Route path="/faculty/materials" element={facultyData ? <FacultyCourseMaterials /> : <Navigate to="/faculty/login" />} />
          <Route path="/faculty/students" element={facultyData ? <FacultyStudentDetails /> : <Navigate to="/faculty/login" />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/admin/login" />} />
          <Route path="/students" element={token ? <StudentManagement /> : <Navigate to="/admin/login" />} />
          <Route path="/courses" element={token ? <CourseManagement /> : <Navigate to="/admin/login" />} />
          <Route path="/faculty" element={token ? <FacultyManagement /> : <Navigate to="/admin/login" />} />
          <Route path="/resources" element={token ? <ResourceManagement /> : <Navigate to="/admin/login" />} />
          <Route path="/inventory" element={token ? <InventoryManagement /> : <Navigate to="/admin/login" />} />
          <Route path="/reports" element={token ? <Reports /> : <Navigate to="/admin/login" />} />
          <Route path="/grades" element={token ? <GradeManagement /> : <Navigate to="/admin/login" />} />
          <Route path="/attendance" element={token ? <AttendanceManagement /> : <Navigate to="/admin/login" />} />
          <Route path="/users" element={token ? <UserManagement /> : <Navigate to="/admin/login" />} />
          <Route path="/notifications" element={token ? <NotificationManagement /> : <Navigate to="/admin/login" />} />
          <Route path="/announcements" element={token ? <AnnouncementManagement /> : <Navigate to="/admin/login" />} />
          <Route path="/student-portal" element={token ? <StudentPortal /> : <Navigate to="/admin/login" />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
