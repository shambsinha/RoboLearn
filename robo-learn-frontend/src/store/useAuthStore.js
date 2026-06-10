import { create } from 'zustand';
import apiClient from '../api/client';
import { studentApi } from '../api/studentApi';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

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
      const response = await apiClient.post('/auth/login', { identifier, password });
      const { token, id, username, profilePictureUrl, role, xp, solvedProblemIds, authProvider } = response.data;

      const userData = { id, username, profilePictureUrl, role, xp, solvedProblemIds, authProvider };

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

  loginWithGoogle: async (idToken) => {
    try {
      const response = await apiClient.post('/auth/google', { idToken });
      const { token, id, username, profilePictureUrl, role, xp, solvedProblemIds, authProvider } = response.data;

      const userData = { id, username, profilePictureUrl, role, xp, solvedProblemIds, authProvider };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      set({
        token,
        user: userData,
        isAuthenticated: true,
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Google Login failed';
      throw errorMessage;
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const { token, id, username, profilePictureUrl, role, xp, solvedProblemIds, authProvider } = response.data;

      const user = { id, username, profilePictureUrl, role, xp, solvedProblemIds, authProvider };

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
