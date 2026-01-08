import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

/**
 * Get the full storage URL for a file path
 * @param {string} path - The storage path (e.g., 'profile_pictures/filename.png')
 * @returns {string|null} - The full URL or null if no path
 */
export const getStorageUrl = (path) => {
  if (!path) return null;
  // If it's already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Otherwise, prepend the backend storage URL
  return `${BACKEND_URL}/storage/${path}`;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if already on auth pages
      const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/email-verification-notice'];
      const currentPath = window.location.pathname.replace('/taskflow', '');
      const isAuthPage = authPaths.some(path => currentPath.startsWith(path));
      
      if (!isAuthPage) {
        localStorage.removeItem('token');
        window.location.href = '/taskflow/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
  forgotPassword: (email) => api.post('/forgot-password', { email }),
  resetPassword: (data) => api.post('/reset-password', data),
  verifyEmail: (id, hash, expires) => api.get(`/email/verify/${id}/${hash}`, { params: { expires } }),
  resendVerification: () => api.post('/email/verification-notification'),
};

// User services
export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/users', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post(`/users/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/users/${id}`),
  updateProfile: (data) => api.put('/profile', data),
  updateProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    return api.post('/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  changePassword: (data) => api.put('/profile/password', data),
};

// Project services
export const projectService = {
  getAll: (params) => api.get('/projects', { params }),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  updateMembers: (id, data) => api.put(`/projects/${id}/members`, data),
  getStatistics: (id) => api.get(`/projects/${id}/statistics`),
};

// Task services
export const taskService = {
  getAll: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }),
  getOne: (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}`),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  update: (projectId, taskId, data) => api.put(`/projects/${projectId}/tasks/${taskId}`, data),
  delete: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`),
  assignUsers: (projectId, taskId, data) => api.put(`/projects/${projectId}/tasks/${taskId}/assign`, data),
  accept: (projectId, taskId) => api.post(`/projects/${projectId}/tasks/${taskId}/accept`),
  getMyTasks: (params) => api.get('/my-tasks', { params }),
  addComment: (projectId, taskId, content) => api.post(`/projects/${projectId}/tasks/${taskId}/comments`, { content }),
  deleteComment: (projectId, taskId, commentId) => api.delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`),
};

// Dashboard services
export const dashboardService = {
  getStats: () => api.get('/dashboard'),
};

export default api;

