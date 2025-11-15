import React from 'react';
import StudentLayout from '../components/StudentLayout';
import News from './News';

const StudentNews: React.FC = () => {
  return (
    <StudentLayout activePage="news">
      <News />
    </StudentLayout>
  );
};

export default StudentNews;