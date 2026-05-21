import { create } from 'zustand';
import apiClient from '../api/client';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (identifier, password) => {
    try {
      const response = await apiClient.post('/auth/login', { identifier, password });
      const { token, id, username, role, onboardingStatus, xp, solvedProblemIds } = response.data;

      const userData = { id, username, role, onboardingStatus, xp, solvedProblemIds };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      set({
        token,
        user: userData,
        isAuthenticated: true,
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      throw errorMessage;
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const { token, id, username, role, onboardingStatus, xp, solvedProblemIds } = response.data;

      const user = { id, username, role, onboardingStatus, xp, solvedProblemIds };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        token,
        user,
        isAuthenticated: true,
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      throw errorMessage;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;
