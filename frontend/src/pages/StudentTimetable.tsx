import React, { useEffect, useState, useContext } from 'react';
import { studentAPI } from '../services/api';
import api from '../services/api';
import StudentLayout, { AcademicContext } from '../components/StudentLayout';
import './StudentTimetable.css';

interface TimetableEntry {
  _id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject_name: string;
  faculty_id: string;
  room_number: string;
  class_type: string;
}

const StudentTimetable: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const academicContext = useContext(AcademicContext);

  useEffect(() => {
    fetchTimetable();
  }, [academicContext?.selectedYear, academicContext?.selectedSemester]);

  const fetchTimetable = async () => {
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
      const url = queryString ? `/students/${studentData.id}/timetable?${queryString}` : `/students/${studentData.id}/timetable`;

      const response = await api.get(url);
      setTimetable(response.data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const getClassForSlot = (day: string, time: string) => {
    return timetable.find(entry =>
      entry.day_of_week === day &&
      entry.start_time <= time &&
      entry.end_time > time
    );
  };

  const exportTimetable = (format: string) => {
    // Implementation for exporting timetable
    alert(`Timetable export as ${format} would be implemented here`);
  };

  if (loading) {
    return <div className="loading">Loading timetable...</div>;
  }

  return (
    <StudentLayout activePage="timetable">
        <div className="student-timetable">
      <div className="timetable-header">
        <h1>Class Timetable</h1>
        <div className="timetable-controls">
          <div className="view-toggle">
            <button
              onClick={() => setView('grid')}
              className={view === 'grid' ? 'active' : ''}
            >
              Grid View
            </button>
            <button
              onClick={() => setView('list')}
              className={view === 'list' ? 'active' : ''}
            >
              List View
            </button>
          </div>
          <div className="export-options">
            <button onClick={() => exportTimetable('PDF')} className="export-btn">
              Export PDF
            </button>
            <button onClick={() => exportTimetable('Excel')} className="export-btn">
              Export Excel
            </button>
            <button onClick={() => exportTimetable('iCal')} className="export-btn">
              Add to Calendar
            </button>
          </div>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="timetable-grid">
          <div className="time-column">
            <div className="time-header">Time</div>
            {timeSlots.map(time => (
              <div key={time} className="time-slot">
                {time}
              </div>
            ))}
          </div>

          {daysOfWeek.map(day => (
            <div key={day} className="day-column">
              <div className="day-header">{day}</div>
              {timeSlots.map(time => {
                const classEntry = getClassForSlot(day, time);
                return (
                  <div key={`${day}-${time}`} className={`time-slot ${classEntry ? 'has-class' : ''}`}>
                    {classEntry ? (
                      <div className="class-info">
                        <div className="subject-name">{classEntry.subject_name}</div>
                        <div className="class-details">
                          {classEntry.room_number} • {classEntry.class_type}
                        </div>
                        <div className="faculty-name">Prof. {classEntry.faculty_id.slice(-4)}</div>
                      </div>
                    ) : (
                      <div className="free-slot">Free</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="timetable-list">
          <div className="list-header">
            <span>Day</span>
            <span>Time</span>
            <span>Subject</span>
            <span>Room</span>
            <span>Type</span>
            <span>Faculty</span>
          </div>

          {timetable.map(entry => (
            <div key={entry._id} className="list-item">
              <span>{entry.day_of_week}</span>
              <span>{entry.start_time} - {entry.end_time}</span>
              <span>{entry.subject_name}</span>
              <span>{entry.room_number}</span>
              <span>{entry.class_type}</span>
              <span>Prof. {entry.faculty_id.slice(-4)}</span>
            </div>
          ))}

          {timetable.length === 0 && (
            <div className="no-classes">
              No classes scheduled for this semester
            </div>
          )}
        </div>
      )}

      <div className="timetable-legend">
        <h3>Legend</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color lecture"></div>
            <span>Lecture</span>
          </div>
          <div className="legend-item">
            <div className="legend-color lab"></div>
            <span>Lab</span>
          </div>
          <div className="legend-item">
            <div className="legend-color tutorial"></div>
            <span>Tutorial</span>
          </div>
          <div className="legend-item">
            <div className="legend-color free"></div>
            <span>Free Period</span>
          </div>
        </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentTimetable;