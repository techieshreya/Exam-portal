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
  endTime: string;
  completed: boolean;
  userId: string;
  userEmail: string;
  username: string;
  score: number;
  totalQuestions: number;
  answers: ExamAnswer[];
}

export interface ExamAnswer {
  questionId: string;
  selectedOptionId: string;
  selectedOptionText: string;
  isCorrect: boolean;
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}
