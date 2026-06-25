import { create } from 'zustand';
import apiClient from '../api/client';
import { studentApi } from '../api/studentApi';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('user'),

  // Performance Optimization: Preload dashboard data
  preloadDashboard: async (role) => {
    try {
      if (role === 'STUDENT' && typeof studentApi.getDashboardMetrics === 'function') {
        await studentApi.getDashboardMetrics();
        console.log("[Performance] Student Dashboard assets pre-warmed.");
      }
    } catch (e) {
      // Silent fail
    }
  },

  login: async (identifier, password) => {
    try {
      const response = await apiClient.post('/auth/login', { identifierType: 'EMAIL', identifier, password });
      const { id, username, profilePictureUrl, role, xp, solvedProblemIds, authProvider } = response.data;

      const userData = { id, username, profilePictureUrl, role, xp, solvedProblemIds, authProvider };

      localStorage.setItem('user', JSON.stringify(userData));
      
      set({
        user: userData,
        isAuthenticated: true,
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      throw errorMessage;
    }
  },

  loginWithGoogle: async (idToken) => {
    try {
      const response = await apiClient.post('/auth/google', { idToken });
      const { id, username, profilePictureUrl, role, xp, solvedProblemIds, authProvider } = response.data;

      const userData = { id, username, profilePictureUrl, role, xp, solvedProblemIds, authProvider };

      localStorage.setItem('user', JSON.stringify(userData));
      
      set({
        user: userData,
        isAuthenticated: true,
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Google Login failed';
      throw errorMessage;
    }
  },

  register: async (userDataInput) => {
    try {
      const response = await apiClient.post('/auth/register', userDataInput);
      const { id, username, profilePictureUrl, role, xp, solvedProblemIds, authProvider } = response.data;

      const user = { id, username, profilePictureUrl, role, xp, solvedProblemIds, authProvider };

      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        isAuthenticated: true,
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      throw errorMessage;
    }
  },

  logout: async () => {
    // Optionally call a backend /api/auth/logout endpoint to clear cookies
    localStorage.removeItem('user');
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  forgotPassword: async (email) => {
    try {
      await apiClient.post(`/auth/forgot-password?email=${email}`);
    } catch (error) {
      throw error.response?.data || 'Failed to send reset code';
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    try {
      await apiClient.post(`/auth/reset-password?email=${email}&otp=${otp}&newPassword=${newPassword}`);
    } catch (error) {
      throw error.response?.data || 'Failed to reset password';
    }
  },
}));

export default useAuthStore;
