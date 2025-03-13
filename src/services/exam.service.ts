import { api } from './api';
import { Exam, ExamSession } from '../types/exam';

export const examService = {
  async getAvailableExams(): Promise<Exam[]> {
    const { data } = await api.get<Exam[]>('/exams');
    return data;
  },

  async getExamById(examId: string): Promise<Exam> {
    const { data } = await api.get<Exam>(`/exams/${examId}`);
    return data;
  },

  async startExam(examId: string): Promise<ExamSession> {
    const { data } = await api.post<ExamSession>(`/exams/${examId}/start`);
    return data;
  },

  async submitExam(examId: string, answers: { questionId: string; selectedOptionId: string }[]): Promise<void> {
    await api.post(`/exams/${examId}/submit`, { answers });
  },

  async getExamResults(examId: string): Promise<{
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
  }> {
    const { data } = await api.get(`/exams/${examId}/results`);
    return data;
  },

  async getAllResults(): Promise<{
    examId: string;
    examTitle: string;
    score: number;
    totalQuestions: number;
    completedAt: string;
  }[]> {
    const { data } = await api.get('/exams/results');
    return data;
  }
};
