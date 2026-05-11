// lib/advertisementApi.js

const API_BASE_URL = import.meta.env.VITE_API_URL 

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.token || null;
      }
    } catch (error) {
      console.error('Error reading auth token:', error);
    }
  }
  return null;
};

const clearAuthAndRedirect = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-storage');
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }
};

const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : defaultHeaders),
    ...options.headers,
  };

  const config = {
    method: options.method || 'GET',
    headers,
    ...(options.body && { body: options.body }),
    signal: options.signal,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`Request aborted: ${endpoint}`);
      throw error;
    }
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

const advertisementApi = {
  getAllAdvertisements: async (filters = {}, signal = null) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const queryParams = new URLSearchParams(cleanFilters).toString();
    const endpoint = `/advertisements${queryParams ? `?${queryParams}` : ''}`;
    return apiRequest(endpoint, { signal });
  },

  getAdvertisementById: async (id, signal = null) => {
    if (!id) throw new Error('Advertisement ID is required');
    return apiRequest(`/advertisements/${id}`, { signal });
  },

  createAdvertisement: async (adData, videoFile = null, imageFiles = []) => {
    const dataToSend = { ...adData };

    if (dataToSend.budget !== undefined && dataToSend.budget !== null) {
      dataToSend.budget = parseFloat(dataToSend.budget);
    }
    if (dataToSend.costPerUnit !== undefined && dataToSend.costPerUnit !== null) {
      dataToSend.costPerUnit = parseFloat(dataToSend.costPerUnit);
    }

    if (videoFile || imageFiles.length > 0) {
      const formData = new FormData();

      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] !== undefined && dataToSend[key] !== null) {
          if (Array.isArray(dataToSend[key])) {
            formData.append(key, JSON.stringify(dataToSend[key]));
          } else if (typeof dataToSend[key] === 'object') {
            formData.append(key, JSON.stringify(dataToSend[key]));
          } else {
            formData.append(key, String(dataToSend[key]));
          }
        }
      });

      if (videoFile) {
        formData.append('videoFile', videoFile);
      }

      imageFiles.forEach((file, index) => {
        formData.append('images', file);
      });

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/advertisements`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (response.status === 401) {
        clearAuthAndRedirect();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create advertisement');
      }
      return data;
    }

    return apiRequest('/advertisements', {
      method: 'POST',
      body: JSON.stringify(dataToSend),
    });
  },

  updateAdvertisement: async (id, adData) => {
    if (!id) throw new Error('Advertisement ID is required');

    const dataToSend = { ...adData };

    if (dataToSend.budget !== undefined && dataToSend.budget !== null) {
      dataToSend.budget = parseFloat(dataToSend.budget);
    }
    if (dataToSend.costPerUnit !== undefined && dataToSend.costPerUnit !== null) {
      dataToSend.costPerUnit = parseFloat(dataToSend.costPerUnit);
    }

    return apiRequest(`/advertisements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dataToSend),
    });
  },

  approveAdvertisement: async (id) => {
    if (!id) throw new Error('Advertisement ID is required');
    return apiRequest(`/advertisements/${id}/approve`, {
      method: 'PUT',
    });
  },

  rejectAdvertisement: async (id, reason) => {
    if (!id) throw new Error('Advertisement ID is required');
    if (!reason) throw new Error('Rejection reason is required');

    return apiRequest(`/advertisements/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },

  pauseAdvertisement: async (id) => {
    if (!id) throw new Error('Advertisement ID is required');
    return apiRequest(`/advertisements/${id}/pause`, {
      method: 'PUT',
    });
  },

  resumeAdvertisement: async (id) => {
    if (!id) throw new Error('Advertisement ID is required');
    return apiRequest(`/advertisements/${id}/resume`, {
      method: 'PUT',
    });
  },

  // FIXED: Delete advertisement - soft delete
  deleteAdvertisement: async (id) => {
    if (!id) {
      throw new Error('Advertisement ID is required');
    }
    console.log('Deleting advertisement with ID:', id);
    return apiRequest(`/advertisements/${id}`, {
      method: 'DELETE',
    });
  },

  getAdvertisementStats: async (signal = null) => {
    return apiRequest('/advertisements/stats/dashboard', { signal });
  },

  getAdsForPlacement: async (category, position, options = {}, signal = null) => {
    if (!category || !position) {
      throw new Error('Category and position are required');
    }

    const cleanOptions = Object.fromEntries(
      Object.entries(options).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const queryParams = new URLSearchParams(cleanOptions).toString();
    const endpoint = `/advertisements/placement/${encodeURIComponent(category)}/${encodeURIComponent(position)}${queryParams ? `?${queryParams}` : ''}`;
    return apiRequest(endpoint, { signal });
  },

  trackImpression: async (id) => {
    if (!id) return { success: false, message: 'No ad ID provided' };
    try {
      return await apiRequest(`/advertisements/${id}/impression`, {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Impression tracking failed:', error);
      return { success: false, message: error.message };
    }
  },

  trackClick: async (id) => {
    if (!id) throw new Error('Advertisement ID is required');
    return apiRequest(`/advertisements/${id}/click`, {
      method: 'POST',
    });
  },

  handleAdClick: async (id, openInNewTab = true) => {
    try {
      const result = await advertisementApi.trackClick(id);
      if (result.redirectUrl) {
        if (openInNewTab) {
          window.open(result.redirectUrl, '_blank');
        } else {
          window.location.href = result.redirectUrl;
        }
        return result.redirectUrl;
      }
      return null;
    } catch (error) {
      console.error('Click handling failed:', error);
      return null;
    }
  },

  formatAdForForm: (ad) => {
    if (!ad) return null;

    return {
      ...ad,
      id: ad._id || ad.id,
      budget: (ad.budget || 0) / 100,
      costPerUnit: (ad.costPerUnit || 0) / 100,
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : '',
    };
  },

  getStatusInfo: (status) => {
    const statusMap = {
      draft: { text: 'Draft', color: 'gray', bgColor: '#f3f4f6', icon: '📝' },
      pending_approval: { text: 'Pending Approval', color: 'yellow', bgColor: '#fef3c7', icon: '⏳' },
      active: { text: 'Active', color: 'green', bgColor: '#d1fae5', icon: '✅' },
      paused: { text: 'Paused', color: 'orange', bgColor: '#ffedd5', icon: '⏸️' },
      expired: { text: 'Expired', color: 'red', bgColor: '#fee2e2', icon: '⌛' },
      rejected: { text: 'Rejected', color: 'red', bgColor: '#fee2e2', icon: '❌' },
    };
    return statusMap[status] || { text: status, color: 'gray', bgColor: '#f3f4f6', icon: '❓' };
  },

  getPlacementCategories: () => {
    return [
      'Header', 'Navigation', 'Content', 'Sidebar', 'Footer',
      'Between Posts', 'Video Player', 'Popup', 'Floating', 'Interstitial'
    ];
  },

  getAdTypes: () => {
    return ['banner', 'video', 'popup', 'native'];
  },

  getPricingModels: () => {
    return [
      { value: 'cpc', label: 'Cost Per Click (CPC)' },
      { value: 'cpm', label: 'Cost Per Mille (CPM)' },
      { value: 'fixed', label: 'Fixed Rate' },
    ];
  },

  getDeviceOptions: () => {
    return ['desktop', 'mobile', 'tablet'];
  },

  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          return !!parsed.state?.token && !!parsed.state?.isAuthenticated;
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    }
    return false;
  },

  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          return parsed.state?.user || null;
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    }
    return null;
  },
};

export default advertisementApi;