import { api } from './api';

// Configure admin-specific interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

import { Admin, AdminAuthResponse, Exam, ExamResult, StudentExamResult, User } from '../types/admin';

class AdminService {
  async login(email: string, password: string): Promise<AdminAuthResponse> {
    const response = await api.post('/admin/login', { email, password });
    return response.data;
  }

  async listExams(): Promise<Exam[]> {
    const response = await api.get('/admin/exams');
    return response.data;
  }

  async createExam(exam: Omit<Exam, 'id' | 'createdAt'>): Promise<Exam> {
    const response = await api.post('/admin/exams', exam);
    return response.data.exam;
  }

  async getExamDetails(examId: string): Promise<Exam> {
    const response = await api.get(`/admin/exams/${examId}`);
    return response.data;
  }

  async getExamResults(examId: string): Promise<ExamResult[]> {
    const response = await api.get(`/admin/exams/${examId}/results`);
    return response.data;
  }

  async deleteExam(examId: string): Promise<void> {
    await api.delete(`/admin/exams/${examId}`);
  }

  async listUsers(): Promise<User[]> {
    const response = await api.get('/admin/users');
    return response.data;
  }

  async getStudentExamResult(examId: string, userId: string): Promise<StudentExamResult> {
    const response = await api.get(`/admin/exams/${examId}/results/${userId}`);
    return response.data;
  }

  async bulkCreateUsers(users: Array<{ email: string; password: string; username: string }>): Promise<{
    created: User[];
    skipped: Array<{ email: string; reason: string }>;
  }> {
    const response = await api.post('/admin/users/bulk', { users });
    return response.data;
  }

  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post('/admin/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Since response.data has nested data property
    // console.log('Upload response:', response.data);
    
    if (!response.data.url) {
      throw new Error('Invalid response format from server: missing URL');
    }
    
    const data = response.data;

    // Ensure both URL and filename exist
    if (!data.url || !data.filename) {
      console.error('Invalid response data:', data);
      throw new Error('Invalid response format from server');
    }

    return {
      url: data.url,
      filename: data.filename
    };
  }
}

export const adminService = new AdminService();
