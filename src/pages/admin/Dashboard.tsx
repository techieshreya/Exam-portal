import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { Exam } from '../../types/admin';
import useAdminAuth from '../../hooks/useAdminAuth';
import { 
  LogOut, 
  Users, 
  Calendar, 
  PlusCircle, 
  Eye, 
  ChartBar,
  Trash2,
  Loader2,
  UserPlus,
  Timer,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const getExamStatus = (exam: Exam): 'upcoming' | 'active' | 'completed' => {
  const now = new Date();
  const startTime = new Date(exam.startTime);
  const endTime = new Date(exam.endTime);

  if (now < startTime) return 'upcoming';
  if (now > endTime) return 'completed';
  return 'active';
};

export default function AdminDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    
    fetchExams();
  }, [isAuthenticated, navigate]);

  const fetchExams = async () => {
    try {
      const examsList = await adminService.listExams();
      setExams(examsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    
    try {
      await adminService.deleteExam(examId);
      setExams(exams.filter(exam => exam.id !== examId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete exam');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Exams</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{exams.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Exams</dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {exams.filter(exam => new Date(exam.endTime) > new Date()).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed Exams</dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {exams.filter(exam => new Date(exam.endTime) <= new Date()).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/admin/users/bulk')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Bulk Create Users
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <Users className="h-4 w-4 mr-2" />
              View Users
            </button>
            <button
              onClick={() => navigate('/admin/exams/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Exam
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 mb-6 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Exam List</h2>
            <p className="mt-1 text-sm text-gray-500">
              View and manage all exams.
            </p>
          </div>
          <div className="px-6 py-4">
            <table className="w-full">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-4 bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Exam Details
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Timer className="h-4 w-4 mr-2" />
                          Duration
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Schedule
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 bg-gray-50 border-b border-gray-200 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {exams.map((exam) => (
                      <tr key={exam.id}>
                        <td className="py-5 border-b border-gray-200">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900 mb-1">{exam.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-2">{exam.description}</div>
                            {getExamStatus(exam) === 'active' && (
                              <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </span>
                            )}
                            {getExamStatus(exam) === 'upcoming' && (
                              <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Upcoming
                              </span>
                            )}
                            {getExamStatus(exam) === 'completed' && (
                              <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Completed
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-5 border-b border-gray-200">
                          <div className="text-sm text-gray-900">{exam.duration} minutes</div>
                        </td>
                        <td className="py-5 border-b border-gray-200">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">
                              <span className="font-medium">Start:</span> {new Date(exam.startTime).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-900">
                              <span className="font-medium">End:</span> {new Date(exam.endTime).toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => navigate(`/admin/exams/${exam.id}`)}
                              className="inline-flex items-center text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => navigate(`/admin/exams/${exam.id}/results`)}
                              className="inline-flex items-center text-green-600 hover:text-green-900 transition-colors duration-200"
                            >
                              <ChartBar className="h-4 w-4 mr-1" />
                              Results
                            </button>
                            <button
                              onClick={() => handleDeleteExam(exam.id)}
                              className="inline-flex items-center text-red-600 hover:text-red-900 transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        </div>
      </div>
    </div>
  );
}
