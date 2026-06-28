import apiClient from './client';

export const studentApi = {
  // AI Tutor
  generateAiPath: async (learningGoal) => {
    const response = await apiClient.post('/student/ai/path', { learningGoal });
    return response.data;
  },
  getAiPaths: async () => {
    const response = await apiClient.get('/student/ai/paths');
    return response.data;
  },
  aiChat: async (message) => {
    const response = await apiClient.post('/student/ai/chat', { message });
    return response.data;
  },

  // Leaderboard
  getLeaderboard: async () => {
    const response = await apiClient.get('/leaderboard');
    return response.data;
  },

  // Courses
  getAvailableCourses: async () => {
    const response = await apiClient.get('/courses');
    return response.data;
  },
  getEnrolledCourses: async () => {
    const response = await apiClient.get('/courses/enrolled');
    return response.data;
  },
  enrollInCourse: async (courseId) => {
    const response = await apiClient.post(`/courses/${courseId}/enroll`);
    return response.data;
  },
  getCourseDetails: async (courseId) => {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data;
  },
  getCourseProblems: async (courseId) => {
    const response = await apiClient.get(`/courses/${courseId}/problems`);
    return response.data;
  },
  getCourseProgress: async (courseId) => {
    const response = await apiClient.get(`/courses/${courseId}/progress`);
    return response.data;
  },
  markItemComplete: async (courseId, moduleId, itemOrder, type) => {
    const response = await apiClient.post(`/courses/${courseId}/modules/${moduleId}/items/${itemOrder}/complete?type=${type}`);
    return response.data;
  },

  // Dashboard
  getDashboardMetrics: async () => {
    const response = await apiClient.get('/student/dashboard/metrics');
    return response.data;
  },

  // Arena (Problems)
  getAvailableProblems: async () => {
    const response = await apiClient.get('/student/arena/problems');
    return response.data;
  },
  getArenaProblem: async (id) => {
    const response = await apiClient.get(`/student/arena/problems/${id}`);
    return response.data;
  },
  submitCode: async (data) => {
    const response = await apiClient.post('/student/arena/submit', data);
    return response.data;
  },
  getSubmissionStatus: async (submissionId) => {
    const response = await apiClient.get(`/student/arena/submissions/${submissionId}`);
    return response.data;
  },

  // Profile
  getUserProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },
  uploadProfileImage: async (formData) => {
    const response = await apiClient.put('/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  deleteProfileImage: async () => {
    const response = await apiClient.delete('/users/profile/image');
    return response.data;
  },
  changePassword: async (data) => {
    const response = await apiClient.post('/users/profile/change-password', data);
    return response.data;
  },
  requestSetPasswordOtp: async () => {
    const response = await apiClient.post('/users/profile/request-set-password-otp');
    return response.data;
  },
  setPassword: async (data) => {
    const response = await apiClient.post('/users/profile/set-password', data);
    return response.data;
  },
};
