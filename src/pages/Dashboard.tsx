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

  const isExamAttempted = (examId: string) => {
    return false; // No longer tracking completed exams
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="font-bold text-2xl text-indigo-600">UniSphere</div>
              <div className="hidden sm:flex sm:ml-6 space-x-8">
                <a href="#exams" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Available Exams
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-500">Welcome,</span>
                <span className="ml-1 font-medium text-gray-900">{user?.username}</span>
              </div>
              <Button
                variant="secondary"
                isLoading={isLogoutLoading}
                onClick={logout}
                className="ml-4"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and start your available examinations
          </p>
        </div>

        {/* Available Exams Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6" id="exams">Available Exams</h2>
          {isLoadingExams ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {exams?.map((exam) => {
                const isUpcoming = new Date(exam.startTime) > new Date();
                const isOngoing = new Date(exam.startTime) <= new Date() && new Date(exam.endTime) > new Date();
                const statusColor = isOngoing ? 'green' : isUpcoming ? 'blue' : 'gray';
                
                return (
                  <div
                    key={exam.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${statusColor}-100 text-${statusColor}-800`}>
                          {isOngoing ? 'In Progress' : isUpcoming ? 'Upcoming' : 'Ended'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{exam.description}</p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Duration: {exam.duration} minutes
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Starts: {new Date(exam.startTime).toLocaleString()}
                        </div>
                      </div>

                      <Button 
                        onClick={() => handleStartExam(exam.id)}
                        disabled={!isOngoing}
                        variant={isOngoing ? "primary" : "secondary"}
                        className="w-full justify-center"
                      >
                        {isOngoing ? "Start Exam" : isUpcoming ? "Not Yet Started" : "Exam Ended"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
