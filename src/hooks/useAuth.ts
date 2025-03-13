import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { LoginCredentials, RegisterCredentials } from '../types/auth';

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading, setUser, setToken, reset } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.token);
      navigate('/dashboard', { replace: true });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.token);
      navigate('/dashboard', { replace: true });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authService.logout();
      localStorage.removeItem('token');
    },
    onSuccess: () => {
      reset();
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });

  const login = async (credentials: LoginCredentials) => {
    try {
      await loginMutation.mutateAsync(credentials);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      await registerMutation.mutateAsync(credentials);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      localStorage.removeItem('token');
      reset();
      queryClient.clear();
      navigate('/login', { replace: true });
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
};
