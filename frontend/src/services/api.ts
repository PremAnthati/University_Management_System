import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Utility function to convert MongoDB Decimal128 objects to numbers
const convertDecimal128 = (value: any): any => {
  if (value && typeof value === 'object' && value.$numberDecimal) {
    return parseFloat(value.$numberDecimal);
  }
  if (Array.isArray(value)) {
    return value.map(convertDecimal128);
  }
  if (value && typeof value === 'object') {
    const converted: any = {};
    for (const key in value) {
      converted[key] = convertDecimal128(value[key]);
    }
    return converted;
  }
  return value;
};

// Add response interceptor to convert Decimal128 objects
api.interceptors.response.use((response) => {
  response.data = convertDecimal128(response.data);
  return response;
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Student APIs
export const studentAPI = {
  register: (data: any) => api.post('/students/register', data),
  login: (data: any) => api.post('/auth/student/login', data),
  logout: () => api.post('/auth/student/logout'),
  getProfile: (id: string) => api.get(`/students/profile/${id}`),
  updateProfile: (id: string, data: any) => api.put(`/students/profile/${id}`, data),
  getFees: (id: string, params?: { year?: number; semester?: number }) => api.get(`/students/${id}/fees`, { params }),
  getFeePayments: (id: string) => api.get(`/students/${id}/fee-payments`),
  payFee: (data: any) => api.post('/students/pay-fee', data),
  getResults: (id: string, params?: { year?: number; semester?: number }) => api.get(`/students/${id}/results`, { params }),
  getTimetable: (id: string) => api.get(`/students/${id}/timetable`),
  getAttendance: (id: string, params?: { year?: number; semester?: number }) => api.get(`/students/${id}/attendance`, { params }),
  getNotifications: (id: string) => api.get(`/students/${id}/notifications`),
  markAsRead: (id: string) => api.put(`/notifications/notifications/${id}/read`),
  getCourses: (id: string) => api.get(`/students/${id}/courses`),
};

// Faculty APIs
export const facultyAPI = {
  login: (data: any) => api.post('/auth/faculty/login', data),
  logout: () => api.post('/auth/faculty/logout'),
  getProfile: () => api.get('/faculty-operations/profile'),
  getCourses: () => api.get('/faculty-operations/courses'),
  getStudentsForCourse: (courseId: string) => api.get(`/faculty-operations/courses/${courseId}/students`),
  getStudentDetails: (studentId: string) => api.get(`/faculty-operations/students/${studentId}`),
  postGrade: (data: any) => api.post('/faculty-operations/grades', data),
  postBulkGrades: (data: any) => api.post('/faculty-operations/grades/bulk', data),
  getGradesForCourse: (courseId: string) => api.get(`/faculty-operations/courses/${courseId}/grades`),
  markAttendance: (data: any) => api.post('/faculty-operations/attendance', data),
  getAttendanceForCourse: (courseId: string, params?: { startDate?: string; endDate?: string }) => api.get(`/faculty-operations/courses/${courseId}/attendance`, { params }),
  getAttendanceSummary: (courseId: string) => api.get(`/faculty-operations/courses/${courseId}/attendance-summary`),
};

// Course Materials APIs
export const courseMaterialsAPI = {
  getMaterialsForCourse: (courseId: string, params?: { type?: string; isVisible?: boolean }) => api.get(`/course-materials/course/${courseId}`, { params }),
  getMaterial: (id: string) => api.get(`/course-materials/${id}`),
  uploadMaterial: (formData: FormData) => api.post('/course-materials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateMaterial: (id: string, formData: FormData) => api.put(`/course-materials/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteMaterial: (id: string) => api.delete(`/course-materials/${id}`),
  downloadMaterial: (id: string) => api.get(`/course-materials/${id}/download`, { responseType: 'blob' }),
  getMaterialsByFaculty: (facultyId: string) => api.get(`/course-materials/faculty/${facultyId}`),
};

// Admin APIs
export const adminAPI = {
  // Student management
  getStudents: () => api.get('/students'),
  getPendingStudents: () => api.get('/students/status/pending'),
  approveStudent: (id: string) => api.patch(`/students/${id}/approve`),
  rejectStudent: (id: string) => api.patch(`/students/${id}/reject`),
  getStudentStats: () => api.get('/students/stats/overview'),

  // Department management
  getDepartments: () => api.get('/departments'),
  createDepartment: (data: any) => api.post('/departments', data),
  updateDepartment: (id: string, data: any) => api.put(`/departments/${id}`, data),
  deleteDepartment: (id: string) => api.delete(`/departments/${id}`),

  // Course management
  getCourses: () => api.get('/courses'),
  createCourse: (data: any) => api.post('/courses', data),
  updateCourse: (id: string, data: any) => api.put(`/courses/${id}`, data),
  deleteCourse: (id: string) => api.delete(`/courses/${id}`),

  // Faculty management
  getFaculty: () => api.get('/faculty'),
  createFaculty: (data: any) => api.post('/faculty', data),
  updateFaculty: (id: string, data: any) => api.put(`/faculty/${id}`, data),
  deleteFaculty: (id: string) => api.delete(`/faculty/${id}`),

  // Attendance management
  getAttendance: () => api.get('/attendance'),
  markAttendance: (data: any) => api.post('/attendance', data),
  updateAttendance: (id: string, data: any) => api.put(`/attendance/${id}`, data),

  // Fees management
  getFees: () => api.get('/fees'),
  createFee: (data: any) => api.post('/fees', data),
  updateFee: (id: string, data: any) => api.put(`/fees/${id}`, data),

  // Notifications
  getNotifications: () => api.get('/notifications'),
  sendNotification: (data: any) => api.post('/notifications', data),
  updateNotification: (id: string, data: any) => api.put(`/notifications/${id}`, data),

  // Announcements
  getAnnouncements: () => api.get('/announcements'),
  createAnnouncement: (data: any) => api.post('/announcements', data),
  updateAnnouncement: (id: string, data: any) => api.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id: string) => api.delete(`/announcements/${id}`),
  getActiveAnnouncements: (params?: any) => api.get('/announcements/student/active', { params }),
  markAnnouncementRead: (id: string) => api.post(`/announcements/${id}/read`),
};

export default api;