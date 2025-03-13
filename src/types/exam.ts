export interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  questions: Question[];
  startTime: string;
  endTime: string;
}

export interface ExamSession {
  id: string;
  examId: string;
  userId: string;
  startTime: string;
  endTime: string | null;
  answers: {
    questionId: string;
    selectedOptionId: string;
  }[];
  completed: boolean;
}
