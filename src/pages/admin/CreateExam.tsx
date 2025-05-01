import { FormEvent, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { ExamQuestion } from '../../types/admin';
import useAdminAuth from '../../hooks/useAdminAuth';

export default function CreateExam() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAdminAuth();
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    startTime: '',
    endTime: '',
  });
  
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);

  // Use useEffect for redirection instead of conditional return before hooks
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // If not authenticated, render nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    // Validate that each question has at least one correct option
    const invalidQuestions = questions.filter(
      q => !q.options.some(opt => opt.correct)
    );
    if (invalidQuestions.length > 0) {
      setError('Each question must have one correct option selected');
      return;
    }

    try {
      await adminService.createExam({
        ...formData,
        questions,
      });
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create exam');
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        imageUrls: [], // Initialize empty array for image URLs
        options: [
          { text: '', correct: true },
          { text: '', correct: false },
          { text: '', correct: false },
        ],
      },
    ]);
  };

  const addOptionToQuestion = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      options: [...newQuestions[questionIndex].options, { text: '', correct: false }],
    };
    setQuestions(newQuestions);
  };

  const updateQuestion = (index: number, question: ExamQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = question;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };
  
  const handleImageUpload = async (questionIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    try {
      setIsUploading(true);
      setError('');
      
      const uploadPromises = Array.from(files).map(file => adminService.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      
      const newQuestions = [...questions];
      const question = newQuestions[questionIndex];
      
      // Initialize imageUrls array if it doesn't exist
      if (!question.imageUrls) {
        question.imageUrls = [];
      }
      
      // Add new image URLs
      question.imageUrls = [...question.imageUrls, ...results.map(result => result.url)];
      
      setQuestions(newQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image(s)');
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRefs.current[questionIndex]) {
        fileInputRefs.current[questionIndex]!.value = '';
      }
    }
  };
  
  const removeImage = (questionIndex: number, imageUrlIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];
    
    if (question.imageUrls) {
      question.imageUrls = question.imageUrls.filter((_, i) => i !== imageUrlIndex);
      setQuestions(newQuestions);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Exam</h1>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-medium text-gray-900">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Question
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-medium">Question {qIndex + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Question Text
                      </label>
                      <input
                        type="text"
                        required
                        value={question.text}
                        onChange={(e) =>
                          updateQuestion(qIndex, { ...question, text: e.target.value })
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    {/* Image Upload Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Images (optional)
                      </label>
                      
                      {/* Display uploaded images */}
                      {question.imageUrls && question.imageUrls.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                          {question.imageUrls.map((url, imgIndex) => (
                            <div 
                              key={imgIndex} 
                              className="relative border rounded-md overflow-hidden h-24"
                            >
                              <img 
                                src={url} 
                                alt={`Question ${qIndex + 1} image ${imgIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(qIndex, imgIndex)}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                                aria-label="Remove image"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          id={`question-image-${qIndex}`}
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImageUpload(qIndex, e.target.files)}
                          ref={(ref) => {
                            fileInputRefs.current[qIndex] = ref;
                          }}

                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100"
                        />
                        {isUploading && <span className="text-sm text-gray-500">Uploading...</span>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">Options</label>
                        <button
                          type="button"
                          onClick={() => addOptionToQuestion(qIndex)}
                          className="inline-flex items-center px-2 py-1 border border-transparent rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-700 focus:outline-none"
                        >
                          Add Option
                        </button>
                      </div>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center space-x-2">
                          <input
                            type="text"
                            required
                            value={option.text}
                            onChange={(e) => {
                              const newOptions = [...question.options];
                              newOptions[oIndex] = { ...option, text: e.target.value };
                              updateQuestion(qIndex, { ...question, options: newOptions });
                            }}
                            className="flex-1 block border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder={`Option ${oIndex + 1}`}
                          />
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={option.correct}
                            onChange={() => {
                              const newOptions = question.options.map((opt, i) => ({
                                ...opt,
                                correct: i === oIndex,
                              }));
                              updateQuestion(qIndex, { ...question, options: newOptions });
                            }}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <label className="text-sm text-gray-500">Correct</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                isUploading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isUploading ? 'Uploading...' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
