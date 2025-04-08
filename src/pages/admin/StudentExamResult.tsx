import React from 'react';
import { useParams } from 'react-router-dom';

const StudentExamResult: React.FC = () => {
  const { examId, userId } = useParams<{ examId: string; userId: string }>();
  // TODO: Fetch and display specific student result using /api/admin/exams/:examId/results/:userId
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Exam Result</h1>
      <p>Details for Exam ID: {examId}, User ID: {userId}</p>
      {/* Display detailed student result */}
    </div>
  );
};

export default StudentExamResult;
