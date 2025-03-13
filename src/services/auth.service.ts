import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';
import { api } from './api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      // Store token immediately after successful login
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', credentials);
      // Store token immediately after successful registration
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
    }
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const token = this.getStoredToken();
    if (!token) {
      throw new Error('No token found');
    }
    const response = await api.get<AuthResponse>('/auth/me');
    return response.data;
  },

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    return !!token;
  },

  clearAuth(): void {
    localStorage.removeItem('token');
  }
};
