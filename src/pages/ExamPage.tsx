import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Exam } from '../types/exam';
import { Button } from '../components/ui/Button';

export function ExamPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [examStartTime] = useState(new Date()); // Capture when user starts the exam
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();

  const { data: exam, isLoading } = useQuery<Exam>({
    queryKey: ['exam', examId],
    queryFn: async () => {
      const response = await api.get(`/exams/${examId}`);
      const examData = response.data;
      
      if (!examData.questions || !Array.isArray(examData.questions)) {
        throw new Error('Invalid exam data structure');
      }
      return examData;
    },
  });

  useEffect(() => {
    if (exam) {
      // Calculate duration in milliseconds
      const durationMs = exam.duration * 60 * 1000;
      const end = new Date(examStartTime.getTime() + durationMs);

      // Set initial time
      const initialRemaining = end.getTime() - new Date().getTime();
      setTimeLeft(initialRemaining);

      // Start timer
      const interval = setInterval(() => {
        const currentRemaining = end.getTime() - new Date().getTime();
        
        if (currentRemaining <= 0) {
          clearInterval(interval);
          setTimeLeft(0);
          handleSubmitExam(); // Auto-submit only when timer actually reaches 0
        } else {
          setTimeLeft(currentRemaining);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [exam, examStartTime]);

  if (isLoading || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Question not found</div>
      </div>
    );
  }

  const handleAnswerSelect = (optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitExam = async () => {
    try {
      await api.post(`/exams/${examId}/submit`, {
        answers: Object.entries(selectedAnswers).map(([questionId, optionId]) => ({
          questionId,
          selectedOptionId: optionId,
        })),
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to submit exam:', error);
      alert('Failed to submit exam. Please try again.');
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content Area */}
      <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
                <p className="text-sm text-gray-500 mt-1">{exam.description}</p>
              </div>
              <div className="text-center">
                <div className={`text-lg font-mono font-bold rounded-lg p-3 ${
                  timeLeft && timeLeft < 300000 
                    ? 'bg-red-100 text-red-800 animate-pulse' 
                    : 'bg-blue-50 text-blue-800'
                }`}>
                  {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Time Remaining</div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 transition-all duration-300"
                  style={{ width: `${(currentQuestionIndex + 1) / exam.questions.length * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Question {currentQuestionIndex + 1} of {exam.questions.length}</span>
                <span>{Math.round((currentQuestionIndex + 1) / exam.questions.length * 100)}% Complete</span>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <div className="space-y-6">
              <div className="text-lg text-gray-900 font-medium">{currentQuestion.text}</div>
              
              {/* Question Images */}
              {currentQuestion.imageUrls && currentQuestion.imageUrls.length > 0 && (
                <div className="mt-4 mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentQuestion.imageUrls.map((url, index) => (
                      <div key={index} className="flex justify-center">
                        <img 
                          src={url} 
                          alt={`Question ${currentQuestionIndex + 1} image ${index + 1}`} 
                          className="max-h-64 object-contain rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => (
                  <label
                    key={option.id}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedAnswers[currentQuestion.id] === option.id
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                        : 'hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-6 h-6 border-2 rounded-full flex items-center justify-center mr-3 transition-colors ${
                        selectedAnswers[currentQuestion.id] === option.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedAnswers[currentQuestion.id] === option.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="flex-grow text-gray-900">{option.text}</span>
                    </div>
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option.id}
                      checked={selectedAnswers[currentQuestion.id] === option.id}
                      onChange={() => handleAnswerSelect(option.id)}
                      className="sr-only"
                    />
                  </label>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="secondary"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="w-32"
                >
                  Previous
                </Button>

                {currentQuestionIndex === exam.questions.length - 1 ? (
                  <Button onClick={handleSubmitExam} className="w-32 bg-green-600 hover:bg-green-700">
                    Submit Exam
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion} className="w-32">
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Navigation Panel */}
      <div className="hidden lg:block w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <div className="sticky top-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Question Navigator</h3>
          <div className="grid grid-cols-4 gap-2">
            {exam.questions.map((question, index) => {
              const isAnswered = selectedAnswers[question.id];
              const isCurrent = index === currentQuestionIndex;
              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`
                    relative p-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isCurrent 
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300' 
                      : isAnswered
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  <span>{index + 1}</span>
                  {isAnswered && !isCurrent && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center text-sm">
              <div className="w-4 h-4 bg-blue-600 rounded-lg mr-2" />
              <span>Current Question</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-4 h-4 bg-green-100 rounded-lg mr-2" />
              <span>Answered</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-4 h-4 bg-gray-100 rounded-lg mr-2" />
              <span>Not Answered</span>
            </div>
          </div>

          <div className="mt-8">
            <div className="text-sm text-gray-500 mb-2">Exam Summary</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="font-medium">{exam.questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Answered:</span>
                <span className="font-medium text-green-600">
                  {Object.keys(selectedAnswers).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Remaining:</span>
                <span className="font-medium text-blue-600">
                  {exam.questions.length - Object.keys(selectedAnswers).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
