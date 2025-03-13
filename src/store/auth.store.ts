import { create } from 'zustand';
import { AuthState, User } from '../types/auth';
import { authService } from '../services/auth.service';

export const useAuthStore = create<AuthState & {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  initialize: () => Promise<void>;
  reset: () => void;
}>((set) => ({
  user: null,
  token: authService.getStoredToken(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: true,
  setUser: (user) => set((state) => ({ 
    ...state, 
    user, 
    isAuthenticated: !!user 
  })),
  setToken: (token) => set((state) => ({ 
    ...state, 
    token,
    isAuthenticated: !!token
  })),
  setIsLoading: (isLoading) => set((state) => ({ ...state, isLoading })),
  initialize: async () => {
    const token = authService.getStoredToken();
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }
    try {
      const { user } = await authService.getCurrentUser();
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
  reset: () => set({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false
  })
}));
