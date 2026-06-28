import apiClient from './client';

export const adminApi = {
  // Courses
  getCourses: async () => {
    const response = await apiClient.get('/courses');
    return response.data;
  },
  createCourse: async (courseData) => {
    const response = await apiClient.post('/courses', courseData);
    return response.data;
  },
  updateCourse: async (courseId, courseData) => {
    const response = await apiClient.put(`/courses/${courseId}`, courseData);
    return response.data;
  },
  deleteCourse: async (courseId) => {
    await apiClient.delete(`/courses/${courseId}`);
  },
  getCourseDetails: async (courseId) => {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data;
  },
  addModule: async (courseId, moduleData) => {
    const response = await apiClient.post(`/courses/${courseId}/modules`, moduleData);
    return response.data;
  },
  deleteModule: async (moduleId) => {
    const response = await apiClient.delete(`/courses/modules/${moduleId}`);
    return response.data;
  },
  updateModuleItems: async (moduleId, items) => {
    const response = await apiClient.put(`/courses/modules/${moduleId}/items`, items);
    return response.data;
  },
  uploadContentImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/courses/upload-image', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  // Problems
  getProblems: async () => {
    const response = await apiClient.get('/admin/problems');
    return response.data;
  },
  createProblem: async (problemData) => {
    const response = await apiClient.post('/admin/problems', problemData);
    return response.data;
  },
  getProblemDetails: async (problemId) => {
    const response = await apiClient.get(`/admin/problems/${problemId}`);
    return response.data;
  },
  updateProblem: async (problemId, problemData) => {
    const response = await apiClient.put(`/admin/problems/${problemId}`, problemData);
    return response.data;
  },
  deleteProblem: async (problemId) => {
    await apiClient.delete(`/admin/problems/${problemId}`);
  },
  addTestCase: async (problemId, testCaseData) => {
    const response = await apiClient.post(`/admin/problems/${problemId}/testcases`, testCaseData);
    return response.data;
  },

  // Course Problems Management
  addProblemToCourse: async (courseId, problemId) => {
    await apiClient.post(`/courses/${courseId}/problems/${problemId}`);
  },
  removeProblemFromCourse: async (courseId, problemId) => {
    await apiClient.delete(`/courses/${courseId}/problems/${problemId}`);
  },
  getCourseProblems: async (courseId) => {
    const response = await apiClient.get(`/courses/${courseId}/problems`);
    return response.data;
  },

  // Dashboard
  getDashboardMetrics: async () => {
    const response = await apiClient.get('/admin/dashboard/metrics');
    return response.data;
  },

  // Users
  getUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },
  getUserProfile: async (userId) => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },
  toggleSuspendUser: async (userId) => {
    const response = await apiClient.put(`/admin/users/${userId}/suspend`);
    return response.data;
  },
};
