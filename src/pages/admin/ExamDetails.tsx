import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { Exam, ExamResult } from '../../types/admin';
import useAdminAuth from '../../hooks/useAdminAuth';
import { 
  ArrowLeft,
  Clock,
  Calendar,
  AlertCircle,
  User,
  CheckCircle2,
  Timer,
  FileText,
  Users,
  BookOpen,
  Loader2,
  XCircle,
  CircleSlash,
  Image as ImageIcon
} from 'lucide-react';

export default function ExamDetails() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAdminAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'answers' | 'results'>('overview');

  const tabs = useMemo(() => [
    { id: 'overview', label: 'Exam Overview', icon: FileText },
    { id: 'answers', label: 'Answer Keys', icon: BookOpen },
    { id: 'results', label: 'Results', icon: Users }
  ], []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    
    if (!examId) {
      navigate('/admin/dashboard');
      return;
    }

    fetchExamData();
  }, [examId, isAuthenticated, navigate]);

  const fetchExamData = async () => {
    try {
      const [examData, examResults] = await Promise.all([
        adminService.getExamDetails(examId!),
        adminService.getExamResults(examId!)
      ]);
      setExam(examData);
      setResults(examResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch exam data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  );
  if (!exam) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <TabIcon className={`
                    -ml-0.5 mr-2 h-5 w-5
                    ${activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              View exam details and student results below.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 mb-6 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Exam Information</h2>
              <p className="mt-1 text-sm text-gray-500">Detailed overview of the exam configuration.</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-400" />
                  Description
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{exam.description}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Timer className="h-4 w-4 mr-2 text-gray-400" />
                  Duration
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{exam.duration} minutes</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  Start Time
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(exam.startTime).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  End Time
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(exam.endTime).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                  Total Questions
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{exam.questions?.length || 0}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-400" />
                  Participants
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{results.length}</dd>
              </div>
              </dl>
            </div>
          </div>
        )}

        {/* Answer Keys Tab */}
        {activeTab === 'answers' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Answer Keys</h2>
              <p className="mt-1 text-sm text-gray-500">Questions and their correct answers.</p>
            </div>
            <div className="border-t border-gray-200">
            {exam.questions?.map((question, index) => (
              <div key={question.id || index} className="px-6 py-6 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-900 flex items-center">
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-sm mr-2">Q{index + 1}</span>
                      {question.text}
                    </h3>
                  </div>
                  {question.imageUrls && question.imageUrls.length > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                      <ImageIcon className="h-4 w-4 mr-1" />
                      {question.imageUrls.length} image{question.imageUrls.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                {question.imageUrls && question.imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {question.imageUrls.map((url, imgIndex) => (
                      <div key={imgIndex} className="relative rounded-lg overflow-hidden h-24 border border-gray-200">
                        <img 
                          src={url} 
                          alt={`Question ${index + 1} image ${imgIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-3">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={option.id || optIndex}
                      className={`flex items-center p-3 rounded-lg ${
                        option.correct 
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <p className={`text-sm ${
                          option.correct ? 'text-green-900 font-medium' : 'text-gray-900'
                        }`}>
                          {option.text}
                        </p>
                      </div>
                      {option.correct && (
                        <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Results Tab */}

        {activeTab === 'results' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Results ({results.length})</h2>
              <p className="mt-1 text-sm text-gray-500">Student performance and completion status.</p>
            </div>
            <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        User
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Score
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Start Time
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        End Time
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Status
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result) => (
                    <tr key={result.sessionId} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{result.username}</div>
                        <div className="text-sm text-gray-500">{result.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {result.score}% ({result.score! / 100 * result.totalQuestions!} / {result.totalQuestions})
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(result.startTime).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.endTime ? new Date(result.endTime).toLocaleString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {result.completed ? (
                            <span className="px-3 py-1 inline-flex items-center text-xs font-medium rounded-full bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </span>
                          ) : (
                            <span className="px-3 py-1 inline-flex items-center text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 mr-1" />
                              In Progress
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
