import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

// FIXED: Using Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authAPI = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  register: (name, email, password, role) =>
    apiClient.post('/auth/register', { name, email, password, role }),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  changePassword: (currentPassword, newPassword) =>
    apiClient.put('/auth/change-password', { currentPassword, newPassword }),
  logout: () => apiClient.post('/auth/logout'),
  getAllUsers: (params) => apiClient.get('/auth/users', { params }),
  updateUserRole: (userId, role) =>
    apiClient.put(`/auth/users/${userId}/role`, { role }),
  toggleUserStatus: (userId) =>
    apiClient.put(`/auth/users/${userId}/toggle-status`),
  deleteUser: (userId) => apiClient.delete(`/auth/users/${userId}`),
  setupFirstAdmin: (name, email, password) =>
    apiClient.post('/auth/setup-first-admin', { name, email, password }),
}

// Articles endpoints
export const articlesAPI = {
  list: (params) => apiClient.get('/articles', { params }),
  get: (id) => apiClient.get(`/articles/${id}`),
  create: (data) => apiClient.post('/articles', data),
  update: (id, data) => apiClient.put(`/articles/${id}`, data),
  delete: (id) => apiClient.delete(`/articles/${id}`),
  publish: (id) => apiClient.post(`/articles/${id}/publish`),
  unpublish: (id) => apiClient.post(`/articles/${id}/unpublish`),
}

// Categories endpoints
export const categoriesAPI = {
  list: () => apiClient.get('/categories'),
  get: (id) => apiClient.get(`/categories/${id}`),
  create: (data) => apiClient.post('/categories', data),
  update: (id, data) => apiClient.put(`/categories/${id}`, data),
  delete: (id) => apiClient.delete(`/categories/${id}`),
}

// Tags endpoints
export const tagsAPI = {
  list: () => apiClient.get('/tags'),
  get: (id) => apiClient.get(`/tags/${id}`),
  create: (data) => apiClient.post('/tags', data),
  update: (id, data) => apiClient.put(`/tags/${id}`, data),
  delete: (id) => apiClient.delete(`/tags/${id}`),
}

// Media endpoints
export const mediaAPI = {
  list: (params) => apiClient.get('/media', { params }),
  get: (id) => apiClient.get(`/media/${id}`),
  upload: (formData) =>
    apiClient.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => apiClient.delete(`/media/${id}`),
}

// Users endpoints (admin only)
export const usersAPI = {
  list: (params) => apiClient.get('/auth/users', { params }),
  get: (id) => apiClient.get(`/auth/users/${id}`),
  updateRole: (id, role) => apiClient.put(`/auth/users/${id}/role`, { role }),
  toggleStatus: (id) => apiClient.put(`/auth/users/${id}/toggle-status`),
  delete: (id) => apiClient.delete(`/auth/users/${id}`),
}

// Comments endpoints
export const commentsAPI = {
  list: (params) => apiClient.get('/comments', { params }),
  get: (id) => apiClient.get(`/comments/${id}`),
  approve: (id) => apiClient.post(`/comments/${id}/approve`),
  reject: (id) => apiClient.post(`/comments/${id}/reject`),
  delete: (id) => apiClient.delete(`/comments/${id}`),
}

// Analytics endpoints
export const analyticsAPI = {
  stats: () => apiClient.get('/analytics/stats'),
  pageViews: (days = 30) =>
    apiClient.get('/analytics/page-views', { params: { days } }),
  topArticles: () => apiClient.get('/analytics/top-articles'),
  userActivity: () => apiClient.get('/analytics/user-activity'),
}

// Settings endpoints
export const settingsAPI = {
  get: () => apiClient.get('/settings'),
  update: (data) => apiClient.put('/settings', data),
}