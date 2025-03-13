import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Exam } from '../types/exam';
import { Button } from '../components/ui/Button';

export function ExamPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();

  const { data: exam, isLoading } = useQuery<Exam>({
    queryKey: ['exam', examId],
    queryFn: async () => {
      const response = await api.get(`/exams/${examId}`);
      console.log('Raw API Response:', response);
      console.log('Response data:', response.data);
      
      const examData = response.data;
      console.log('Questions array:', examData.questions);
      
      // Log each question's structure
      examData.questions.forEach((question: any, index: number) => {
        console.log(`Question ${index + 1}:`, {
          id: question.id,
          text: question.text,
          options: question.options
        });
      });

      if (!examData.questions || !Array.isArray(examData.questions)) {
        throw new Error('Invalid exam data structure');
      }
      return examData;
    },
  });

  if (isLoading || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  console.log('Current Question:', currentQuestion);
  console.log('Current Question Options:', currentQuestion?.options);
  
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {exam.questions.length}
              </p>
              <p className="text-sm text-gray-500">
                Duration: {exam.duration} minutes
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-lg text-gray-900">{currentQuestion.text}</div>

            <div className="space-y-4">
              {currentQuestion.options?.map((option) => (
                <label
                  key={option.id}
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAnswers[currentQuestion.id] === option.id
                      ? 'bg-blue-50 border-blue-500'
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option.id}
                      checked={selectedAnswers[currentQuestion.id] === option.id}
                      onChange={() => handleAnswerSelect(option.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-900">{option.text}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-between mt-6 pt-6 border-t">
              <Button
                variant="secondary"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              {currentQuestionIndex === exam.questions.length - 1 ? (
                <Button onClick={handleSubmitExam}>Submit Exam</Button>
              ) : (
                <Button onClick={handleNextQuestion}>Next</Button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="flex gap-2 flex-wrap justify-center">
            {exam.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-medium ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : selectedAnswers[exam.questions[index].id]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
