import axios from 'axios';

let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Strictly format the baseURL so it ALWAYS ends with /api
if (API_BASE_URL) {
  API_BASE_URL = API_BASE_URL.replace(/\/+$/, ''); // Remove trailing slashes
  if (!API_BASE_URL.endsWith('/api')) {
    API_BASE_URL += '/api';
  }
} else {
  API_BASE_URL = '/api';
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Interceptor (No longer attaching Authorization header since we use HttpOnly cookies)
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios Interceptor to handle expired tokens
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if it's a 401 and NOT an auth request (like login/register)
    if (error.response && error.response.status === 401) {
      const originalRequestUrl = error.config.url;
      if (!originalRequestUrl.includes('/auth/')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
