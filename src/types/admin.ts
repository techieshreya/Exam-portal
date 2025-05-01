export interface Admin {
  id: string;
  email: string;
  name: string;
}

export interface AdminAuthResponse {
  admin: Admin;
  token: string;
}

export interface ExamQuestion {
  id?: string;
  text: string;
  imageUrls?: string[]; // Array of image URLs associated with the question
  options: ExamQuestionOption[];
}

export interface ExamQuestionOption {
  id?: string;
  text: string;
  correct: boolean;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  questions?: ExamQuestion[];
}

export interface ExamResult {
  sessionId: string;
  startTime: string;
  endTime: string | null;
  completed: boolean;
  userId: string;
  userEmail: string;
  username: string;
  score: number | null;
  totalQuestions: number | null;
  correctAnswers?: number;
  answers: ExamAnswer[];
}

export interface ExamAnswer {
  questionId: string;
  selectedOptionId: string;
  selectedOptionText: string;
  isCorrect: boolean;
  questionText?: string;
  correctOptionId?: string;
  correctOptionText?: string;
}

export interface StudentExamResult extends ExamResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  answers: Array<ExamAnswer & {
    questionText: string;
    correctOptionId: string;
    correctOptionText: string;
  }>;
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}
