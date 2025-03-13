import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { examService } from '../services/exam.service';
import { Exam } from '../types/exam';

export function Dashboard() {
  const { user, logout, isLogoutLoading } = useAuth();
  const navigate = useNavigate();

  const { data: exams, isLoading: isLoadingExams } = useQuery<Exam[]>({
    queryKey: ['exams'],
    queryFn: examService.getAvailableExams,
  });

  const { data: results, isLoading: isLoadingResults } = useQuery({
    queryKey: ['exam-results'],
    queryFn: examService.getAllResults,
  });

  const isExamAttempted = (examId: string) => {
    return results?.some(result => result.examId === examId);
  };

  const handleStartExam = async (examId: string) => {
    try {
      await examService.startExam(examId);
      navigate(`/exam/${examId}`);
    } catch (error) {
      console.error('Failed to start exam:', error);
      alert('Failed to start exam. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="font-semibold text-xl text-gray-800">Quiz App</div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.username}</span>
              <Button
                variant="secondary"
                isLoading={isLogoutLoading}
                onClick={logout}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Available Exams Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Exams</h2>
          {isLoadingExams ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {exams?.map((exam) => {
                const attempted = isExamAttempted(exam.id);
                return (
                  <div
                    key={exam.id}
                    className="bg-white rounded-lg shadow-sm p-6 space-y-4"
                  >
                    <h3 className="text-lg font-medium text-gray-900">{exam.title}</h3>
                    <p className="text-sm text-gray-500">{exam.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Duration: {exam.duration} minutes
                      </span>
                      <Button 
                        onClick={() => handleStartExam(exam.id)}
                        disabled={attempted}
                        variant={attempted ? "secondary" : "primary"}
                      >
                        {attempted ? "Already Attempted" : "Start Exam"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Results Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Past Results</h2>
          {isLoadingResults ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results?.map((result) => (
                    <tr key={`${result.examId}-${result.completedAt}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.examTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.score.toFixed(0)}/{"100%"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
