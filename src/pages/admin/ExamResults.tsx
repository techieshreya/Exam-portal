import React from 'react';
import { useParams } from 'react-router-dom';

const ExamResults: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  // TODO: Fetch and display results for the exam using /api/admin/exams/:examId/results
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Exam Results (Exam ID: {examId})</h1>
      <p>List of student results for this exam will be displayed here.</p>
      {/* Add table or list to display results */}
    </div>
  );
};

export default ExamResults;
