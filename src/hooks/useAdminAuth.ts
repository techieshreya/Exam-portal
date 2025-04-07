import { create } from 'zustand';
import { Admin } from '../types/admin';
import { adminService } from '../services/admin.service';

interface AdminAuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const useAdminAuth = create<AdminAuthState>((set) => ({
  admin: null,
  token: localStorage.getItem('adminToken'),
  isAuthenticated: !!localStorage.getItem('adminToken'),

  login: async (email: string, password: string) => {
    try {
      const response = await adminService.login(email, password);
      localStorage.setItem('adminToken', response.token);
      set({ admin: response.admin, token: response.token, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  register: async (email: string, password: string, name: string) => {
    try {
      const response = await adminService.register(email, password, name);
      localStorage.setItem('adminToken', response.token);
      set({ admin: response.admin, token: response.token, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    set({ admin: null, token: null, isAuthenticated: false });
  },
}));

export default useAdminAuth;
