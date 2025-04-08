import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { StudentExamResult as StudentResult } from '../../types/admin';

const StudentExamResult: React.FC = () => {
  const { examId, userId } = useParams<{ examId: string; userId: string }>();
  const [result, setResult] = useState<StudentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchResult();
  }, [examId, userId]);

  const fetchResult = async () => {
    if (!examId || !userId) return;
    
    try {
      const studentResult = await adminService.getStudentExamResult(examId, userId);
      setResult(studentResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student result');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center text-red-600">
              {error || 'No result found for this student'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Student Exam Result</h1>
          <button
            onClick={() => navigate(`/admin/exams/${examId}/results`)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Back to Results
          </button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {result.username}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {result.userEmail}
            </p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Score</dt>
                <dd className="mt-1 text-sm text-gray-900">{result.score}%</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Correct Answers</dt>
                <dd className="mt-1 text-sm text-gray-900">{result.correctAnswers}/{result.totalQuestions}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Start Time</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(result.startTime).toLocaleString()}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">End Time</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {result.endTime ? new Date(result.endTime).toLocaleString() : 'Not completed'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <h4 className="text-lg font-medium text-gray-900">Answers</h4>
            </div>
            <div className="divide-y divide-gray-200">
              {result.answers.map((answer, index) => (
                <div key={answer.questionId} className="px-4 py-5 sm:px-6">
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">
                        Question {index + 1}:
                      </h5>
                      <p className="mt-1 text-sm text-gray-600">{answer.questionText}</p>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">Selected Answer:</p>
                      <p className={`mt-1 text-sm ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {answer.selectedOptionText}
                      </p>
                      {!answer.isCorrect && (
                        <>
                          <p className="mt-2 text-sm text-gray-500">Correct Answer:</p>
                          <p className="mt-1 text-sm text-green-600">{answer.correctOptionText}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentExamResult;
