// mergeapi.js - Complete API service for the application
import axios from 'axios';

// Base URL configuration - Fixed for browser environment
const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }
  return '/api';
};

const getMediaBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace('/api', '');
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace('/api', '');
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  return '';
};

const API_BASE_URL = getApiBaseUrl();
const MEDIA_BASE_URL = getMediaBaseUrl();

// FIX: Read the token from wherever it might be stored.
const getAuthToken = () => {
  // 1. Direct key (set manually via API.setAuthToken)
  const direct = localStorage.getItem('token');
  if (direct) return direct;

  // 2. Zustand persist key (written by authStore.js)
  try {
    const raw = localStorage.getItem('auth-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.token;
      if (token) return token;
    }
  } catch (e) {
    console.error('[mergeapi] Failed to parse auth-storage:', e);
  }

  return null;
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('[mergeapi] No auth token found – request will be unauthenticated.');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage');
      sessionStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-logout'));
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTHENTICATION APIS ====================

export const authAPI = {
  register:        (userData)                  => apiClient.post('/auth/register', userData),
  login:           (credentials)               => apiClient.post('/auth/login', credentials),
  logout:          ()                          => apiClient.post('/auth/logout'),
  getCurrentUser:  ()                          => apiClient.get('/auth/me'),
  updateProfile:   (userData)                  => apiClient.put('/auth/updatedetails', userData),
  updatePassword:  (passwordData)              => apiClient.put('/auth/updatepassword', passwordData),
  forgotPassword:  (email)                     => apiClient.post('/auth/forgotpassword', { email }),
  resetPassword:   (resetToken, newPassword)   =>
    apiClient.put(`/auth/resetpassword/${resetToken}`, { password: newPassword }),
};

// ==================== DOCUMENT APIS ====================

export const documentAPI = {
  createDocument: (documentData) =>
    apiClient.post('/documents', documentData),

  getDocuments: (params = {}) => {
    const { page = 1, limit, status, search, category, author } = params;
    let qs = `?page=${page}`;
    // Only add limit if explicitly provided
    if (limit !== undefined && limit !== null) {
      qs += `&limit=${limit}`;
    }
    if (status && status !== 'All Status') qs += `&status=${status}`;
    if (search) qs += `&search=${encodeURIComponent(search)}`;
    if (category) qs += `&category=${category}`;
    if (author) qs += `&author=${author}`;
    return apiClient.get(`/documents${qs}`);
  },

  getDocument:    (id)                => apiClient.get(`/documents/${id}`),
  getDocumentBySlug: (slug)           => apiClient.get(`/documents/slug/${slug}`),
  updateDocument: (id, documentData)  => apiClient.put(`/documents/${id}`, documentData),
  deleteDocument: (id)                => apiClient.delete(`/documents/${id}`),
  saveAsDraft:    (id, content)       => apiClient.post(`/documents/${id}/save-draft`, { content }),
  publishDocument:(id)                => apiClient.post(`/documents/${id}/publish`),
};

// ==================== MEDIA APIS ====================

export const mediaAPI = {
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();

    return axios.post(`${API_BASE_URL}/media/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(pct);
        }
      },
      timeout: 120000,
    });
  },

  uploadMultipleFiles: async (files, onProgress) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const token = getAuthToken();

    return axios.post(`${API_BASE_URL}/media/upload-multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(pct);
        }
      },
      timeout: 120000,
    });
  },

  uploadBase64Image: (imageData, filename = 'pasted-image.png') =>
    apiClient.post('/media/upload-base64', { image: imageData, filename }),

  getMediaFiles: (params = {}) => {
    const { type, page = 1, limit = 20 } = params;
    let qs = `?page=${page}&limit=${limit}`;
    if (type) qs += `&type=${type}`;
    return apiClient.get(`/media${qs}`);
  },

  getMediaFile:    (id)  => apiClient.get(`/media/${id}`),
  deleteMediaFile: (id)  => apiClient.delete(`/media/${id}`),

  getImageUrl: (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath;
    // Ensure proper path formatting
    const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `${MEDIA_BASE_URL}${cleanPath}`;
  },

  getThumbnailUrl: (mediaItem) => {
    if (mediaItem?.thumbnailUrl) {
      if (mediaItem.thumbnailUrl.startsWith('http')) return mediaItem.thumbnailUrl;
      return `${MEDIA_BASE_URL}${mediaItem.thumbnailUrl}`;
    }
    if (mediaItem?.url) {
      if (mediaItem.url.startsWith('http')) return mediaItem.url;
      return `${MEDIA_BASE_URL}${mediaItem.url}`;
    }
    return null;
  },
};

// ==================== COMBINED API EXPORTS ====================

const API = {
  auth:      authAPI,
  documents: documentAPI,
  media:     mediaAPI,

  get:    apiClient.get.bind(apiClient),
  post:   apiClient.post.bind(apiClient),
  put:    apiClient.put.bind(apiClient),
  delete: apiClient.delete.bind(apiClient),
  patch:  apiClient.patch.bind(apiClient),

  setAuthToken: (token) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  },

  clearAuthToken: () => {
    delete apiClient.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth-storage');
  },

  isAuthenticated: () => !!getAuthToken(),

  getCurrentUserFromStorage: () => {
    try {
      const raw = localStorage.getItem('auth-storage');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state?.user) return parsed.state.user;
      }
    } catch (e) { /* ignore */ }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { return JSON.parse(userStr); } catch (e) { return null; }
    }
    return null;
  },
};

export default API;