import React, { useEffect, useState } from 'react';
import { courseMaterialsAPI, facultyAPI } from '../services/api';
import './FacultyCourseMaterials.css';

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

interface CourseMaterial {
  _id: string;
  title: string;
  description: string;
  type: 'document' | 'presentation' | 'video' | 'link' | 'assignment' | 'quiz' | 'other';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  externalLink?: string;
  isVisible: boolean;
  downloadCount: number;
  tags: string[];
  uploadedAt: string;
  updatedAt: string;
  semester?: string;
  year?: number;
  dueDate?: string;
  maxMarks?: number;
  instructions?: string;
  faculty: {
    name: string;
  };
  course: {
    courseCode: string;
    courseName: string;
  };
}

const FacultyCourseMaterials: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Upload form data
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    type: 'document',
    externalLink: '',
    tags: '',
    semester: '',
    year: new Date().getFullYear().toString(),
    dueDate: '',
    maxMarks: '',
    instructions: '',
    isVisible: true
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchMaterials();
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

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await courseMaterialsAPI.getMaterialsForCourse(selectedCourse);
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setUploadData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const validateUploadForm = () => {
    if (!selectedCourse || !uploadData.title || !uploadData.type) {
      alert('Please fill in all required fields');
      return false;
    }

    if (uploadData.type === 'link' && !uploadData.externalLink) {
      alert('Please provide an external link');
      return false;
    }

    if (uploadData.type !== 'link' && !selectedFile) {
      alert('Please select a file to upload');
      return false;
    }

    if (uploadData.maxMarks && isNaN(parseFloat(uploadData.maxMarks))) {
      alert('Please enter a valid maximum marks');
      return false;
    }

    return true;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUploadForm()) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('courseId', selectedCourse);
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('type', uploadData.type);
      formData.append('tags', uploadData.tags);
      formData.append('semester', uploadData.semester);
      formData.append('year', uploadData.year);
      formData.append('isVisible', uploadData.isVisible.toString());

      if (uploadData.type === 'link') {
        formData.append('externalLink', uploadData.externalLink);
      } else if (selectedFile) {
        formData.append('file', selectedFile);
      }

      if (uploadData.dueDate) {
        formData.append('dueDate', uploadData.dueDate);
      }

      if (uploadData.maxMarks) {
        formData.append('maxMarks', uploadData.maxMarks);
      }

      if (uploadData.instructions) {
        formData.append('instructions', uploadData.instructions);
      }

      await courseMaterialsAPI.uploadMaterial(formData);

      alert('Material uploaded successfully!');

      // Reset form
      setUploadData({
        title: '',
        description: '',
        type: 'document',
        externalLink: '',
        tags: '',
        semester: '',
        year: new Date().getFullYear().toString(),
        dueDate: '',
        maxMarks: '',
        instructions: '',
        isVisible: true
      });
      setSelectedFile(null);
      setShowUploadForm(false);

      // Refresh materials list
      fetchMaterials();

    } catch (error: any) {
      console.error('Error uploading material:', error);
      alert(error.response?.data?.message || 'Failed to upload material. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      await courseMaterialsAPI.deleteMaterial(materialId);
      alert('Material deleted successfully!');
      fetchMaterials();
    } catch (error: any) {
      console.error('Error deleting material:', error);
      alert(error.response?.data?.message || 'Failed to delete material.');
    }
  };

  const handleDownload = async (materialId: string, fileName: string) => {
    try {
      const response = await courseMaterialsAPI.downloadMaterial(materialId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading material:', error);
      alert('Failed to download material.');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return '📄';
      case 'presentation': return '📊';
      case 'video': return '🎥';
      case 'link': return '🔗';
      case 'assignment': return '📝';
      case 'quiz': return '❓';
      default: return '📁';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="faculty-materials-loading">
        <div className="loading-spinner"></div>
        <p>Loading course materials...</p>
      </div>
    );
  }

  return (
    <div className="faculty-course-materials">
      <div className="header">
        <h1>Course Materials</h1>
        <p>Upload and manage course content for your students</p>
      </div>

      {/* Course Selection */}
      <div className="course-selection">
        <div className="form-group">
          <label htmlFor="course">Select Course:</label>
          <select
            id="course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
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

      {selectedCourse && (
        <>
          {/* Upload Button */}
          <div className="upload-section">
            <button
              className="upload-btn"
              onClick={() => setShowUploadForm(!showUploadForm)}
            >
              {showUploadForm ? 'Cancel Upload' : '+ Upload Material'}
            </button>
          </div>

          {/* Upload Form */}
          {showUploadForm && (
            <form onSubmit={handleUpload} className="upload-form">
              <div className="form-section">
                <h2>Upload New Material</h2>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={uploadData.title}
                      onChange={handleUploadDataChange}
                      placeholder="Material title"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="type">Type *</label>
                    <select
                      id="type"
                      name="type"
                      value={uploadData.type}
                      onChange={handleUploadDataChange}
                      required
                    >
                      <option value="document">Document</option>
                      <option value="presentation">Presentation</option>
                      <option value="video">Video</option>
                      <option value="link">External Link</option>
                      <option value="assignment">Assignment</option>
                      <option value="quiz">Quiz</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={uploadData.description}
                      onChange={handleUploadDataChange}
                      placeholder="Brief description of the material"
                      rows={3}
                    />
                  </div>

                  {uploadData.type === 'link' ? (
                    <div className="form-group full-width">
                      <label htmlFor="externalLink">External Link *</label>
                      <input
                        type="url"
                        id="externalLink"
                        name="externalLink"
                        value={uploadData.externalLink}
                        onChange={handleUploadDataChange}
                        placeholder="https://example.com"
                        required
                      />
                    </div>
                  ) : (
                    <div className="form-group full-width">
                      <label htmlFor="file">File *</label>
                      <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov,.jpg,.jpeg,.png,.gif"
                        required
                      />
                      {selectedFile && (
                        <small className="file-info">
                          Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                        </small>
                      )}
                    </div>
                  )}

                  {(uploadData.type === 'assignment' || uploadData.type === 'quiz') && (
                    <>
                      <div className="form-group">
                        <label htmlFor="dueDate">Due Date</label>
                        <input
                          type="datetime-local"
                          id="dueDate"
                          name="dueDate"
                          value={uploadData.dueDate}
                          onChange={handleUploadDataChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="maxMarks">Maximum Marks</label>
                        <input
                          type="number"
                          id="maxMarks"
                          name="maxMarks"
                          value={uploadData.maxMarks}
                          onChange={handleUploadDataChange}
                          placeholder="100"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="form-group full-width">
                        <label htmlFor="instructions">Instructions</label>
                        <textarea
                          id="instructions"
                          name="instructions"
                          value={uploadData.instructions}
                          onChange={handleUploadDataChange}
                          placeholder="Special instructions for students"
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label htmlFor="semester">Semester</label>
                    <input
                      type="text"
                      id="semester"
                      name="semester"
                      value={uploadData.semester}
                      onChange={handleUploadDataChange}
                      placeholder="e.g., Fall 2024"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="year">Year</label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      value={uploadData.year}
                      onChange={handleUploadDataChange}
                      placeholder="2024"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="tags">Tags</label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={uploadData.tags}
                      onChange={handleUploadDataChange}
                      placeholder="lecture, notes, homework (comma-separated)"
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isVisible"
                        checked={uploadData.isVisible}
                        onChange={handleUploadDataChange}
                      />
                      Make visible to students
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Material'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Materials List */}
          <div className="materials-section">
            <h2>Course Materials ({materials.length})</h2>

            {materials.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>No materials uploaded yet</h3>
                <p>Upload your first course material to get started</p>
              </div>
            ) : (
              <div className="materials-grid">
                {materials.map(material => (
                  <div key={material._id} className="material-card">
                    <div className="material-header">
                      <div className="material-icon">
                        {getTypeIcon(material.type)}
                      </div>
                      <div className="material-actions">
                        {material.fileUrl && (
                          <button
                            className="action-btn download"
                            onClick={() => handleDownload(material._id, material.fileName || 'download')}
                            title="Download"
                          >
                            ⬇️
                          </button>
                        )}
                        {material.externalLink && (
                          <a
                            href={material.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-btn link"
                            title="Open Link"
                          >
                            🔗
                          </a>
                        )}
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteMaterial(material._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="material-content">
                      <h3>{material.title}</h3>
                      {material.description && (
                        <p className="description">{material.description}</p>
                      )}

                      <div className="material-meta">
                        <span className="type-badge">{material.type}</span>
                        {material.fileSize && (
                          <span className="file-size">{formatFileSize(material.fileSize)}</span>
                        )}
                        <span className="upload-date">
                          {new Date(material.uploadedAt).toLocaleDateString()}
                        </span>
                        <span className="downloads">{material.downloadCount} downloads</span>
                      </div>

                      {material.dueDate && (
                        <div className="due-info">
                          <strong>Due:</strong> {new Date(material.dueDate).toLocaleString()}
                          {material.maxMarks && <span> | Max Marks: {material.maxMarks}</span>}
                        </div>
                      )}

                      {material.tags.length > 0 && (
                        <div className="tags">
                          {material.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}

                      <div className="visibility-status">
                        {material.isVisible ? (
                          <span className="visible">👁️ Visible to students</span>
                        ) : (
                          <span className="hidden">🙈 Hidden from students</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FacultyCourseMaterials;