import React from 'react';
import StudentLayout from '../components/StudentLayout';
import Chat from './Chat';

const StudentChat: React.FC = () => {
  return (
    <StudentLayout activePage="chat">
      <Chat />
    </StudentLayout>
  );
};

export default StudentChat;