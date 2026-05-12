// lib/headerApi.js
// API Client for Header Management System

import { useAuthStore } from '../stores/authStore';

// Get API base URL from environment
const API_BASE_URL = (() => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return '/api';
})();

/**
 * Helper function to get auth token from store
 */
const getAuthToken = () => {
  try {
    const { getToken } = useAuthStore.getState();
    return getToken();
  } catch (e) {
    // Fallback to localStorage
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.token || null;
      }
    } catch (err) {
      console.error('Error getting token:', err);
    }
    return null;
  }
};

/**
 * Helper function to get auth headers
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

/**
 * Helper function to handle API responses
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // If response is not JSON
    }
    
    if (response.status === 401) {
      // Clear auth on unauthorized
      try {
        const { logout } = useAuthStore.getState();
        logout();
      } catch (e) {
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('token');
      }
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
};

// ==================== HEADER API CLASS ====================

class HeaderAPI {
  /**
   * Get header settings (public - no auth required)
   * @returns {Promise} Header settings data
   */
  static async getHeaderSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/header`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching header settings:', error);
      throw error;
    }
  }

  /**
   * Update header settings (admin only)
   * @param {Object} settings - Header settings object
   * @returns {Promise} Updated header settings
   */
  static async updateHeaderSettings(settings) {
    try {
      const response = await fetch(`${API_BASE_URL}/header`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating header settings:', error);
      throw error;
    }
  }

  /**
   * Reset header to default settings (admin only)
   * @returns {Promise} Reset header settings
   */
  static async resetHeaderSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/header/reset`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error resetting header settings:', error);
      throw error;
    }
  }

  /**
   * Add navigation item (admin only)
   * @param {Object} item - Navigation item object { label, href, hasDropdown, dropdownItems, order, isActive }
   * @returns {Promise} Updated header settings
   */
  static async addNavItem(item) {
    try {
      const response = await fetch(`${API_BASE_URL}/header/nav-items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(item),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error adding navigation item:', error);
      throw error;
    }
  }

  /**
   * Update navigation item (admin only)
   * @param {string} itemId - Navigation item ID
   * @param {Object} item - Updated navigation item data
   * @returns {Promise} Updated header settings
   */
  static async updateNavItem(itemId, item) {
    try {
      const response = await fetch(`${API_BASE_URL}/header/nav-items/${itemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(item),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating navigation item:', error);
      throw error;
    }
  }

  /**
   * Delete navigation item (admin only)
   * @param {string} itemId - Navigation item ID
   * @returns {Promise} Updated header settings
   */
  static async deleteNavItem(itemId) {
    try {
      const response = await fetch(`${API_BASE_URL}/header/nav-items/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error deleting navigation item:', error);
      throw error;
    }
  }

  /**
   * Reorder navigation items (drag-drop - admin only)
   * @param {Array} items - Array of item IDs in desired order
   * @returns {Promise} Updated header settings
   */
  static async reorderNavItems(items) {
    try {
      const response = await fetch(`${API_BASE_URL}/header/nav-items/reorder`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ items }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error reordering navigation items:', error);
      throw error;
    }
  }

  /**
   * Toggle header section visibility (admin only)
   * @param {string} sectionName - Section name (topBar, logoArea, searchBar, navMenu, trendingBar, subscribeBtn, userArea, mobileMenu)
   * @param {boolean} isEnabled - Whether section is enabled
   * @returns {Promise} Updated header settings
   */
  static async toggleSection(sectionName, isEnabled) {
    try {
      const response = await fetch(`${API_BASE_URL}/header/section/${sectionName}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isEnabled }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error toggling section:', error);
      throw error;
    }
  }

  /**
   * Reorder header sections (drag-drop layout - admin only)
   * @param {Array} sections - Array of section objects { name, order }
   * @returns {Promise} Updated header settings
   */
  static async reorderSections(sections) {
    try {
      const response = await fetch(`${API_BASE_URL}/header/sections/reorder`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ sections }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error reordering sections:', error);
      throw error;
    }
  }

  /**
   * Upload header logo (admin only)
   * @param {File} file - Image file
   * @returns {Promise} Updated header settings with new logo URL
   */
  static async uploadLogo(file) {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/header/upload-logo`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  }

  /**
   * Check if user is admin (has permission for header management)
   * @returns {boolean} True if user is admin
   */
  static isAdmin() {
    try {
      const { user } = useAuthStore.getState();
      return user?.role === 'admin' || user?.role === 'super_admin';
    } catch (e) {
      return false;
    }
  }

  /**
   * Get current user
   * @returns {Object|null} Current user or null
   */
  static getCurrentUser() {
    try {
      const { user } = useAuthStore.getState();
      return user;
    } catch (e) {
      return null;
    }
  }
}

// ==================== REACT HOOKS FOR HEADER ====================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to fetch and manage header settings
 * @returns {Object} { headerSettings, loading, error, refetch }
 */
export const useHeaderSettings = () => {
  const [headerSettings, setHeaderSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  const fetchHeaderSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await HeaderAPI.getHeaderSettings();
      if (response.success) {
        setHeaderSettings(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to fetch header settings');
      }
    } catch (err) {
      setError(err.message);
      console.error('useHeaderSettings error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchHeaderSettings();
    }
  }, [fetchHeaderSettings]);

  return { headerSettings, loading, error, refetch: fetchHeaderSettings };
};

/**
 * Hook for updating header settings
 * @returns {Object} { updateSettings, loading, error, success }
 */
export const useUpdateHeaderSettings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateSettings = async (settings) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await HeaderAPI.updateHeaderSettings(settings);
      if (response.success) {
        setSuccess(true);
        return response.data;
      } else {
        setError(response.message || 'Update failed');
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateSettings, loading, error, success };
};

/**
 * Hook for navigation item operations
 * @returns {Object} { addItem, updateItem, deleteItem, reorderItems, loading, error }
 */
export const useNavItems = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addItem = async (item) => {
    setLoading(true);
    setError(null);
    try {
      const response = await HeaderAPI.addNavItem(item);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId, item) => {
    setLoading(true);
    setError(null);
    try {
      const response = await HeaderAPI.updateNavItem(itemId, item);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await HeaderAPI.deleteNavItem(itemId);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reorderItems = async (items) => {
    setLoading(true);
    setError(null);
    try {
      const response = await HeaderAPI.reorderNavItems(items);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addItem, updateItem, deleteItem, reorderItems, loading, error };
};

/**
 * Hook for section management (drag-drop layout)
 * @returns {Object} { toggleSection, reorderSections, loading, error }
 */
export const useHeaderSections = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleSection = async (sectionName, isEnabled) => {
    setLoading(true);
    setError(null);
    try {
      const response = await HeaderAPI.toggleSection(sectionName, isEnabled);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reorderSections = async (sections) => {
    setLoading(true);
    setError(null);
    try {
      const response = await HeaderAPI.reorderSections(sections);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { toggleSection, reorderSections, loading, error };
};

/**
 * Hook for resetting header to default
 * @returns {Object} { resetSettings, loading, error, success }
 */
export const useResetHeader = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const resetSettings = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await HeaderAPI.resetHeaderSettings();
      if (response.success) {
        setSuccess(true);
        return response.data;
      } else {
        setError(response.message || 'Reset failed');
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { resetSettings, loading, error, success };
};

// Export main API as default
export default HeaderAPI;