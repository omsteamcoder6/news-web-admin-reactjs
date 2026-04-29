// galleryApi.js
import axios from 'axios';
import { useAuthStore } from '../stores/authStore'; // Adjust path as needed

// CHANGE THIS LINE for Vite:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance for JSON requests (GET, DELETE, etc.)
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create separate axios instance for FormData requests (POST, PUT with files)
// No Content-Type header - browser will set multipart/form-data automatically
const formDataApi = axios.create({
  baseURL: API_BASE_URL,
  // Intentionally no Content-Type header
});

// Add token to requests if it exists using auth store
const addAuthInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      // Get token from auth store
      const token = useAuthStore.getState().getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// Add auth interceptor to both instances
addAuthInterceptor(api);
addAuthInterceptor(formDataApi);

// Response interceptor for handling auth errors (apply to both)
const responseInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 Unauthorized errors
      if (error.response?.status === 401) {
        // Clear auth state on token expiration
        useAuthStore.getState().logout();
        
        // Optional: Redirect to login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
};

responseInterceptor(api);
responseInterceptor(formDataApi);

// Gallery API endpoints
const galleryApi = {
  /**
   * Get all gallery items with filters and pagination
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter by category
   * @param {string} params.date - Filter by date (YYYY-MM-DD)
   * @param {boolean} params.featured - Filter featured items
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise} Promise with gallery items
   */
  getGalleryItems: async (params = {}) => {
    try {
      const response = await api.get('/gallery', { params });
      return {
        success: true,
        data: response.data.data || response.data.items || [],
        pagination: response.data.pagination,
        total: response.data.total,
      };
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch gallery items',
        error: error.response?.data?.error || error.message,
        data: [],
      };
    }
  },

  /**
   * Get single gallery item by ID
   * @param {string} id - Gallery item ID
   * @returns {Promise} Promise with gallery item
   */
  getGalleryItemById: async (id) => {
    if (!id) {
      return {
        success: false,
        message: 'Gallery item ID is required',
      };
    }

    try {
      const response = await api.get(`/gallery/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      console.error(`Error fetching gallery item ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch gallery item',
        error: error.response?.data?.error || error.message,
      };
    }
  },

  /**
   * Create new gallery item (Admin/Editor only)
   * @param {FormData} formData - Form data with image and fields
   * @returns {Promise} Promise with created gallery item
   */
  createGalleryItem: async (formData) => {
    // Check authentication before making request
    const token = useAuthStore.getState().getToken();
    if (!token) {
      return {
        success: false,
        message: 'You must be logged in to create gallery items',
        unauthorized: true,
      };
    }

    try {
      // FIXED: Using formDataApi instead of api - no Content-Type header
      const response = await formDataApi.post('/gallery', formData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Gallery item created successfully',
      };
    } catch (error) {
      console.error('Error creating gallery item:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create gallery item',
        error: error.response?.data?.error || error.message,
        unauthorized: error.response?.status === 401,
        forbidden: error.response?.status === 403,
      };
    }
  },

  /**
   * Update gallery item (Admin/Editor only)
   * @param {string} id - Gallery item ID
   * @param {FormData} formData - Form data with updated fields and optional image
   * @returns {Promise} Promise with updated gallery item
   */
  updateGalleryItem: async (id, formData) => {
    if (!id) {
      return {
        success: false,
        message: 'Gallery item ID is required',
      };
    }

    // Check authentication before making request
    const token = useAuthStore.getState().getToken();
    if (!token) {
      return {
        success: false,
        message: 'You must be logged in to update gallery items',
        unauthorized: true,
      };
    }

    try {
      // FIXED: Using formDataApi instead of api - no Content-Type header
      const response = await formDataApi.put(`/gallery/${id}`, formData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Gallery item updated successfully',
      };
    } catch (error) {
      console.error(`Error updating gallery item ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update gallery item',
        error: error.response?.data?.error || error.message,
        unauthorized: error.response?.status === 401,
        forbidden: error.response?.status === 403,
      };
    }
  },

  /**
   * Delete gallery item (Admin/Editor only)
   * @param {string} id - Gallery item ID
   * @returns {Promise} Promise with deletion status
   */
  deleteGalleryItem: async (id) => {
    if (!id) {
      return {
        success: false,
        message: 'Gallery item ID is required',
      };
    }

    // Check authentication before making request
    const token = useAuthStore.getState().getToken();
    if (!token) {
      return {
        success: false,
        message: 'You must be logged in to delete gallery items',
        unauthorized: true,
      };
    }

    try {
      const response = await api.delete(`/gallery/${id}`);
      return {
        success: true,
        message: response.data.message || 'Gallery item deleted successfully',
        fileDeleted: response.data.fileDeleted || false,
      };
    } catch (error) {
      console.error(`Error deleting gallery item ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete gallery item',
        error: error.response?.data?.error || error.message,
        unauthorized: error.response?.status === 401,
        forbidden: error.response?.status === 403,
      };
    }
  },

  /**
   * Get all categories
   * @returns {Promise} Promise with categories list
   */
  getCategories: async () => {
    try {
      // FIXED: Changed from '/gallery/categories' to '/gallery/categories/list'
      const response = await api.get('/gallery/categories/list');
      return {
        success: true,
        data: response.data.data || response.data.categories || response.data,
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch categories',
        error: error.response?.data?.error || error.message,
        data: [], // Return empty array as fallback
      };
    }
  },

  /**
   * Get featured gallery items
   * @param {number} limit - Number of items to fetch
   * @returns {Promise} Promise with featured items
   */
  getFeaturedItems: async (limit = 6) => {
    try {
      const response = await api.get('/gallery/featured', { 
        params: { limit } 
      });
      return {
        success: true,
        data: response.data.data || response.data.items || [],
      };
    } catch (error) {
      console.error('Error fetching featured items:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch featured items',
        error: error.response?.data?.error || error.message,
        data: [], // Return empty array as fallback
      };
    }
  },

  /**
   * Get gallery statistics (Admin only)
   * @returns {Promise} Promise with gallery statistics
   */
  getGalleryStats: async () => {
    const token = useAuthStore.getState().getToken();
    if (!token) {
      return {
        success: false,
        message: 'You must be logged in to view gallery statistics',
        unauthorized: true,
      };
    }

    try {
      const response = await api.get('/gallery/stats');
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      console.error('Error fetching gallery stats:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch gallery statistics',
        error: error.response?.data?.error || error.message,
        unauthorized: error.response?.status === 401,
        forbidden: error.response?.status === 403,
      };
    }
  },

  /**
   * Bulk delete gallery items (Admin only)
   * @param {Array<string>} ids - Array of gallery item IDs to delete
   * @returns {Promise} Promise with deletion results
   */
  bulkDeleteGalleryItems: async (ids) => {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return {
        success: false,
        message: 'Invalid or empty IDs array',
      };
    }

    const token = useAuthStore.getState().getToken();
    if (!token) {
      return {
        success: false,
        message: 'You must be logged in to delete gallery items',
        unauthorized: true,
      };
    }

    try {
      const response = await api.post('/gallery/bulk-delete', { ids });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Gallery items deleted successfully',
      };
    } catch (error) {
      console.error('Error bulk deleting gallery items:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete gallery items',
        error: error.response?.data?.error || error.message,
        unauthorized: error.response?.status === 401,
        forbidden: error.response?.status === 403,
      };
    }
  },
};

// Helper function to create FormData for create/update operations
export const createGalleryFormData = (data) => {
  const formData = new FormData();
  
  if (data.image instanceof File) {
    formData.append('image', data.image);
  } else if (data.image && typeof data.image === 'string') {
    // If image is a URL string, don't append it (keep existing)
    // This is for update operations where image hasn't changed
    if (!data.image.startsWith('http')) {
      formData.append('image', data.image);
    }
  }
  
  if (data.title) {
    formData.append('title', data.title);
  }
  
  if (data.description) {
    formData.append('description', data.description);
  }
  
  if (data.altText) {
    formData.append('altText', data.altText);
  }
  
  if (data.category) {
    formData.append('category', data.category);
  }
  
  if (data.photographer) {
    formData.append('photographer', data.photographer);
  }
  
  if (data.date) {
    formData.append('date', data.date);
  }
  
  if (data.isFeatured !== undefined && data.isFeatured !== null) {
    formData.append('isFeatured', String(data.isFeatured));
  }
  
  if (data.order) {
    formData.append('order', String(data.order));
  }
  
  return formData;
};

// Helper function to format date for display
export const formatGalleryDate = (dateString) => {
  if (!dateString) return 'Date not available';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Helper function to format date for input (YYYY-MM-DD)
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  return date.toISOString().split('T')[0];
};

// Helper function to validate gallery item data
export const validateGalleryItem = (data) => {
  const errors = {};
  
  if (!data.title || data.title.trim() === '') {
    errors.title = 'Title is required';
  }
  
  if (!data.category || data.category.trim() === '') {
    errors.category = 'Category is required';
  }
  
  if (data.image && !(data.image instanceof File) && typeof data.image === 'string') {
    // Check if it's a valid URL or file path
    if (!data.image.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      errors.image = 'Invalid image format';
    }
  }
  
  if (data.date && !Date.parse(data.date)) {
    errors.date = 'Invalid date format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Helper function to get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  // For Vite, you might need to adjust this
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  return `${baseUrl.replace('/api', '')}${imagePath}`;
};

// Export individual functions for selective imports
export const {
  getGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getCategories,
  getFeaturedItems,
  getGalleryStats,
  bulkDeleteGalleryItems,
} = galleryApi;

export default galleryApi;