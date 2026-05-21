import apiClient from './client';

export const arenaApi = {
  getProblems: async () => {
    const response = await apiClient.get('/student/arena/problems');
    return response.data;
  },
  getProblemDetails: async (id) => {
    const response = await apiClient.get(`/student/arena/problems/${id}`);
    return response.data;
  },
  submitCode: async (submissionRequest) => {
    // Backend returns a string (submissionId) directly
    const response = await apiClient.post('/student/arena/submit', submissionRequest);
    return response.data;
  },
  getSubmissionStatus: async (submissionId) => {
    const response = await apiClient.get(`/student/arena/submissions/${submissionId}`);
    return response.data;
  },
  getProblemSubmissions: async (problemId) => {
    const response = await apiClient.get(`/student/arena/problems/${problemId}/submissions`);
    return response.data;
  },
};
