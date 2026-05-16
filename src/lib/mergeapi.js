// lib/mergeapi.js - Complete API service for the application with VITE_IMAGE_BASE_URL support
import axios from 'axios';

// Base URL configuration - Uses environment variables only
const getApiBaseUrl = () => {
  // Check for Vite environment variable first
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Check for React environment variable
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // Default fallback
  return '/api';
};

const getMediaBaseUrl = () => {
  // ✅ FIXED: Use VITE_IMAGE_BASE_URL if available (highest priority)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_IMAGE_BASE_URL) {
    console.log('[mergeapi] Using VITE_IMAGE_BASE_URL:', import.meta.env.VITE_IMAGE_BASE_URL);
    return import.meta.env.VITE_IMAGE_BASE_URL;
  }
  
  // Fallback to VITE_API_URL without /api
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace('/api', '');
  }
  
  // Check for React environment variable
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace('/api', '');
  }
  
  // Default fallback
  return '';
};

const API_BASE_URL = getApiBaseUrl();
const MEDIA_BASE_URL = getMediaBaseUrl();

// Log the configuration for debugging
if (typeof window !== 'undefined') {
  console.log('[mergeapi] API_BASE_URL:', API_BASE_URL);
  console.log('[mergeapi] MEDIA_BASE_URL:', MEDIA_BASE_URL);
  console.log('[mergeapi] VITE_API_URL:', typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL);
  console.log('[mergeapi] VITE_IMAGE_BASE_URL:', typeof import.meta !== 'undefined' && import.meta.env?.VITE_IMAGE_BASE_URL);
}

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

apiClient.interceptors.request.use(
  (config) => {
    // Get token from all possible locations
    let token =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token');

    // Zustand persisted auth
    if (!token) {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed?.state?.token || parsed?.token;
        }
      } catch (err) {
        console.error('Token parse error:', err);
      }
    }

    // Attach token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('NO TOKEN FOUND for request:', config.url);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== AUTHENTICATION APIS ====================

export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateProfile: (userData) => apiClient.put('/auth/updatedetails', userData),
  updatePassword: (passwordData) => apiClient.put('/auth/updatepassword', passwordData),
  forgotPassword: (email) => apiClient.post('/auth/forgotpassword', { email }),
  resetPassword: (resetToken, newPassword) =>
    apiClient.put(`/auth/resetpassword/${resetToken}`, { password: newPassword }),
};

// ==================== DOCUMENT APIS ====================

export const documentAPI = {
  createDocument: (documentData) =>
    apiClient.post('/documents', documentData),

  getDocuments: (params = {}) => {
    const { page = 1, limit, status, search, category, author, worldNews, liveNews } = params;
    let qs = `?page=${page}`;
    // Only add limit if explicitly provided
    if (limit !== undefined && limit !== null) {
      qs += `&limit=${limit}`;
    }
    if (status && status !== 'All Status') qs += `&status=${status}`;
    if (search) qs += `&search=${encodeURIComponent(search)}`;
    if (category) qs += `&category=${category}`;
    if (author) qs += `&author=${author}`;
    // ✅ World News filter
    if (worldNews === true) qs += `&worldNews=true`;
    // ✅ Live News filter
    if (liveNews === true) qs += `&liveNews=true`;
    return apiClient.get(`/documents${qs}`);
  },

  getDocument: (id) => apiClient.get(`/documents/${id}`),
  getDocumentBySlug: (slug) => apiClient.get(`/documents/slug/${slug}`),
  updateDocument: (id, documentData) => apiClient.put(`/documents/${id}`, documentData),
  deleteDocument: (id) => apiClient.delete(`/documents/${id}`),
  saveAsDraft: (id, content) => apiClient.post(`/documents/${id}/save-draft`, { content }),
  publishDocument: (id) => apiClient.post(`/documents/${id}/publish`),
  
  // ✅ Toggle World News status
  toggleWorldNews: (id) => apiClient.put(`/documents/${id}/toggle-world-news`),
};

// ==================== WORLD NEWS APIS ====================

export const worldNewsAPI = {
  // Get all world news articles
  getWorldNews: (params = {}) => {
    const { page = 1, limit = 10 } = params;
    return apiClient.get(`/documents/world-news/list?page=${page}&limit=${limit}`);
  },
  
  // Toggle world news status for an article
  toggleWorldNews: (id) => apiClient.put(`/documents/${id}/toggle-world-news`),
  
  // Get world news by category
  getWorldNewsByCategory: (categoryId, params = {}) => {
    const { page = 1, limit = 10 } = params;
    return apiClient.get(`/documents?worldNews=true&category=${categoryId}&page=${page}&limit=${limit}`);
  },
  
  // Get world news count
  getWorldNewsCount: async () => {
    const response = await apiClient.get('/documents?worldNews=true&limit=1');
    return response.data.pagination?.total || 0;
  },
};

// ==================== MEDIA APIS ====================

export const mediaAPI = {
  // ✅ FIXED: Changed field name from 'file' to 'image' to match backend expectation
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    // ✅ CORRECT: Backend expects 'image' field name (from upload.js: const uploadFile = upload.single('image'))
    formData.append('image', file);

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

  getMediaFile: (id) => apiClient.get(`/media/${id}`),
  deleteMediaFile: (id) => apiClient.delete(`/media/${id}`),

  // ✅ getImageUrl — replaces stored localhost URLs with correct MEDIA_BASE_URL
  getImageUrl: (filePath) => {
    if (!filePath) return null;

    // If it's an absolute URL pointing to localhost/127.0.0.1,
    // extract only the path and rebuild with the correct MEDIA_BASE_URL
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      try {
        const parsed = new URL(filePath);
        const isLocal =
          parsed.hostname === 'localhost' ||
          parsed.hostname === '127.0.0.1' ||
          parsed.hostname.startsWith('192.168.');

        if (isLocal && MEDIA_BASE_URL) {
          // Replace the localhost origin with the configured MEDIA_BASE_URL
          const fixedUrl = `${MEDIA_BASE_URL}${parsed.pathname}`;
          console.log('[mediaAPI.getImageUrl] Replaced localhost URL:', filePath, '→', fixedUrl);
          return fixedUrl;
        }
      } catch (e) {
        // If URL parsing fails, fall through to return as-is
      }
      return filePath;
    }

    // Relative path — prepend MEDIA_BASE_URL
    const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    const fullUrl = `${MEDIA_BASE_URL}${cleanPath}`;
    console.log('[mediaAPI.getImageUrl] Generated URL:', fullUrl);
    return fullUrl;
  },

  getThumbnailUrl: (mediaItem) => {
    if (!mediaItem) return null;
    
    if (mediaItem?.thumbnailUrl) {
      if (mediaItem.thumbnailUrl.startsWith('http://') || mediaItem.thumbnailUrl.startsWith('https://')) {
        return mediaItem.thumbnailUrl;
      }
      const cleanPath = mediaItem.thumbnailUrl.startsWith('/') ? mediaItem.thumbnailUrl : `/${mediaItem.thumbnailUrl}`;
      return `${MEDIA_BASE_URL}${cleanPath}`;
    }
    
    if (mediaItem?.url) {
      if (mediaItem.url.startsWith('http://') || mediaItem.url.startsWith('https://')) {
        return mediaItem.url;
      }
      const cleanPath = mediaItem.url.startsWith('/') ? mediaItem.url : `/${mediaItem.url}`;
      return `${MEDIA_BASE_URL}${cleanPath}`;
    }
    
    return null;
  },
};

// ✅ getFullImageUrl — same localhost replacement logic
export const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    try {
      const parsed = new URL(imagePath);
      const isLocal =
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1' ||
        parsed.hostname.startsWith('192.168.');

      if (isLocal && MEDIA_BASE_URL) {
        const fixedUrl = `${MEDIA_BASE_URL}${parsed.pathname}`;
        console.log('[getFullImageUrl] Replaced localhost URL:', imagePath, '→', fixedUrl);
        return fixedUrl;
      }
    } catch (e) {}
    return imagePath;
  }

  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  const fullUrl = `${MEDIA_BASE_URL}${cleanPath}`;
  console.log('[getFullImageUrl] Generated URL:', fullUrl);
  return fullUrl;
};

// ==================== CATEGORY APIS ====================

export const categoryAPI = {
  getCategories: (params = {}) => {
    const { status } = params;
    let qs = '';
    if (status) qs += `?status=${status}`;
    return apiClient.get(`/categories${qs}`);
  },
  getCategory: (id) => apiClient.get(`/categories/${id}`),
  createCategory: (data) => apiClient.post('/categories', data),
  updateCategory: (id, data) => apiClient.put(`/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/categories/${id}`),
};

// ==================== AUTHOR APIS ====================

export const authorAPI = {
  getAuthors: () => apiClient.get('/authors'),
  getAuthor: (id) => apiClient.get(`/authors/${id}`),
  createAuthor: (data) => apiClient.post('/authors', data),
  updateAuthor: (id, data) => apiClient.put(`/authors/${id}`, data),
  deleteAuthor: (id) => apiClient.delete(`/authors/${id}`),
};

// ==================== COMBINED API EXPORTS ====================

const API = {
  auth: authAPI,
  documents: documentAPI,
  media: mediaAPI,
  worldNews: worldNewsAPI,
  categories: categoryAPI,
  authors: authorAPI,

  get: apiClient.get.bind(apiClient),
  post: apiClient.post.bind(apiClient),
  put: apiClient.put.bind(apiClient),
  delete: apiClient.delete.bind(apiClient),
  patch: apiClient.patch.bind(apiClient),

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
  
  // Helper to get the current media base URL
  getMediaBaseUrl: () => MEDIA_BASE_URL,
  
  // Helper to get the current API base URL
  getApiBaseUrl: () => API_BASE_URL,
};

export default API;