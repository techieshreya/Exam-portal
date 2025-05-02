import { FormEvent, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { ExamQuestion } from '../../types/admin';
import useAdminAuth from '../../hooks/useAdminAuth';
import { ImageZoom } from '../../components/ui/ImageZoom';
import { 
  ArrowLeft,
  Clock,
  Calendar,
  Plus,
  Trash2,
  Image,
  X,
  PlusCircle,
  Loader2,
  Save,
  AlertCircle,
  FileJson
} from 'lucide-react';

export default function CreateExam() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAdminAuth();
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
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
      
      const results: { url: string }[] = [];
      for (const file of Array.from(files)) {
        try {
          const result = await adminService.uploadImage(file);
          if (!result || !result.url) {
            throw new Error(`Failed to get URL for ${file.name}`);
          }
          results.push(result);
        } catch (err) {
          console.error('Image upload error:', err);
          setError(`Failed to upload ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
      
      if (!results.length) {
        throw new Error('No images were uploaded successfully');
      }

      const newQuestions = [...questions];
      const question = newQuestions[questionIndex];
      
      // Initialize imageUrls array if it doesn't exist
      if (!question.imageUrls) {
        question.imageUrls = [];
      }
      
      // Filter out any failed uploads and add successful ones
      const validUrls = results
        .filter(result => result && result.url)
        .map(result => {
          if (!result.url) {
            console.error('Missing URL in result:', result);
            return null;
          }
          return result.url;
        })
        .filter((url): url is string => url !== null);
      
      if (validUrls.length) {
        question.imageUrls = [...question.imageUrls, ...validUrls];
        setQuestions(newQuestions);
      } else {
        throw new Error('No valid image URLs were received from the server');
      }
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
    <div className="min-h-screen bg-gray-50 flex flex-col relative pb-16">
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

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Create New Exam</h1>
            <p className="mt-1 text-sm text-gray-500">
              Fill in the exam details and add questions below.
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

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow px-6 py-6 sm:rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <div className="relative">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter exam title"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter exam description"
                />
              </div>

              <div className="relative">
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration (minutes)
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="duration"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="datetime-local"
                    id="startTime"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="datetime-local"
                    id="endTime"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow px-6 py-6 sm:rounded-lg">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-medium text-gray-900">Questions</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Add and manage exam questions below.
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowJsonImport(true)}
                  className="inline-flex items-center px-4 py-2 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  Import from JSON
                </button>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </button>
              </div>
            </div>

            {/* JSON Import Modal */}
            {showJsonImport && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-3xl w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Import Questions from JSON</h3>
                    <button
                      onClick={() => {
                        setShowJsonImport(false);
                        setJsonInput('');
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Paste your JSON array of questions. Format example:
                    </p>
                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-32">
{`[
  {
    "text": "What is 2 + 2?",
    "imageUrls": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "options": [
      { "text": "3", "correct": false },
      { "text": "4", "correct": true },
      { "text": "5", "correct": false }
    ]
  }
]`}
                    </pre>
                  </div>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="w-full h-64 px-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Paste your JSON here..."
                  />
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowJsonImport(false);
                        setJsonInput('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(jsonInput);
                          if (!Array.isArray(parsed)) {
                            throw new Error('Input must be an array of questions');
                          }
                          
                          // Validate each question
                          const validQuestions = parsed.map(q => {
                            if (!q.text || !Array.isArray(q.options) || q.options.length < 2) {
                              throw new Error('Each question must have text and at least 2 options');
                            }
                            
                            const hasCorrectOption = q.options.some((opt: { correct: boolean }) => opt.correct);
                            if (!hasCorrectOption) {
                              throw new Error('Each question must have one correct option');
                            }
                            
                            return {
                              text: q.text,
                              imageUrls: q.imageUrls || [],
                              options: q.options.map((opt: { text: string; correct: boolean }) => ({
                                text: opt.text,
                                correct: opt.correct
                              }))
                            };
                          });
                          
                          setQuestions([...questions, ...validQuestions]);
                          setShowJsonImport(false);
                          setJsonInput('');
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Invalid JSON format');
                        }
                      }}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Import Questions
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-medium">Question {qIndex + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="inline-flex items-center text-red-600 hover:text-red-900 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
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
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Enter your question here"
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
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedImage(url);
                                }}
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
                          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-700 focus:outline-none transition-colors duration-200"
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
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

          <div className="fixed bottom-0 left-0 right-0 z-10">
            <div className="bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] px-6 py-4 border-t border-gray-200">
              <div className="max-w-4xl mx-auto flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white ${
                  isUploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Exam...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Exam
                  </>
                )}
              </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {selectedImage && (
        <ImageZoom
          src={selectedImage}
          alt="Zoomed question image"
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
