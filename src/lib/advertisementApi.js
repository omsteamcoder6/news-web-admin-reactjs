// lib/advertisementApi.js

// Hardcoded API URL (change this to your actual API URL)
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Get current auth token from localStorage (where zustand persist stores it)
 */
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    try {
      // Get the persisted auth store data from localStorage
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        // The token is stored in state.token
        return parsed.state?.token || null;
      }
    } catch (error) {
      console.error('Error reading auth token:', error);
    }
  }
  return null;
};

/**
 * Clear auth data on 401
 */
const clearAuthAndRedirect = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-storage');
    // Redirect to login page if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
};

/**
 * Generic API request handler
 */
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

    // Handle 401 Unauthorized - token expired/invalid
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

/**
 * Retry wrapper for failed requests
 */
const withRetry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    // Don't retry on authentication errors
    if (error.message.includes('401') || error.message.includes('403')) {
      throw error;
    }
    // Don't retry on 4xx errors (client errors)
    if (error.message.includes('400') || error.message.includes('404')) {
      throw error;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
};

/**
 * Advertisement API Service
 */
const advertisementApi = {
  // ==================== Admin Routes ====================

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
      dataToSend.budget = Math.round(parseFloat(dataToSend.budget) * 100);
    }
    if (dataToSend.costPerUnit !== undefined && dataToSend.costPerUnit !== null) {
      dataToSend.costPerUnit = Math.round(parseFloat(dataToSend.costPerUnit) * 100);
    }

    // Handle file uploads
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
      dataToSend.budget = Math.round(parseFloat(dataToSend.budget) * 100);
    }
    if (dataToSend.costPerUnit !== undefined && dataToSend.costPerUnit !== null) {
      dataToSend.costPerUnit = Math.round(parseFloat(dataToSend.costPerUnit) * 100);
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

  deleteAdvertisement: async (id) => {
    if (!id) throw new Error('Advertisement ID is required');
    return apiRequest(`/advertisements/${id}`, {
      method: 'DELETE',
    });
  },

  getAdvertisementStats: async (signal = null) => {
    return apiRequest('/advertisements/stats/dashboard', { signal });
  },

  // ==================== Public Routes ====================

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
      return await withRetry(() => 
        apiRequest(`/advertisements/${id}/impression`, {
          method: 'POST',
        }), 2, 500
      );
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

  // ==================== Helper Methods ====================

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

  renderAdAndTrackImpression: async (ad, container) => {
    const containerEl = typeof container === 'string' 
      ? document.getElementById(container) 
      : container;
      
    if (!containerEl || !ad) {
      console.warn('Container or ad not found');
      return null;
    }

    // Track impression
    advertisementApi.trackImpression(ad._id).catch(console.warn);

    // Clear container
    containerEl.innerHTML = '';

    const adWrapper = document.createElement('div');
    adWrapper.className = `ad-wrapper ad-type-${ad.type}`;
    adWrapper.setAttribute('data-ad-id', ad._id);

    let contentHtml = '';
    switch (ad.type) {
      case 'banner':
        const imageUrl = ad.images?.[0]?.url || '';
        contentHtml = `
          <a href="#" class="ad-link" data-ad-id="${ad._id}">
            ${imageUrl ? `<img src="${imageUrl}" alt="${ad.title}" class="ad-image" />` : `<div class="ad-placeholder">${ad.title}</div>`}
          </a>
        `;
        break;
        
      case 'video':
        const videoSrc = ad.videoUrl || ad.videoFile?.path || '';
        contentHtml = `
          <div class="ad-video-container">
            <video controls class="ad-video">
              <source src="${videoSrc}" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        `;
        break;
        
      case 'popup':
        contentHtml = `
          <div class="ad-popup" style="display:none;">
            <div class="popup-overlay"></div>
            <div class="popup-content">
              <button class="popup-close">&times;</button>
              <a href="#" class="ad-link" data-ad-id="${ad._id}">
                ${ad.images?.[0]?.url ? `<img src="${ad.images[0].url}" alt="${ad.title}" />` : `<h3>${ad.title}</h3>`}
                ${ad.description ? `<p>${ad.description}</p>` : ''}
              </a>
            </div>
          </div>
        `;
        break;
        
      case 'native':
      default:
        contentHtml = `
          <div class="ad-native">
            <a href="#" class="ad-link" data-ad-id="${ad._id}" class="native-ad-link">
              ${ad.brandName ? `<span class="ad-brand">${ad.brandName}</span>` : ''}
              <span class="ad-title">${ad.title}</span>
              ${ad.description ? `<span class="ad-description">${ad.description}</span>` : ''}
            </a>
          </div>
        `;
        break;
    }

    adWrapper.innerHTML = contentHtml;
    containerEl.appendChild(adWrapper);

    // Add click handlers
    const links = adWrapper.querySelectorAll('.ad-link');
    links.forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        await advertisementApi.handleAdClick(ad._id, true);
      });
    });

    // Handle popup close
    const closeBtn = adWrapper.querySelector('.popup-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const popup = adWrapper.querySelector('.ad-popup');
        if (popup) popup.style.display = 'none';
      });
      
      setTimeout(() => {
        const popup = adWrapper.querySelector('.ad-popup');
        if (popup) popup.style.display = 'flex';
      }, 2000);
    }

    return containerEl;
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

  formatForApi: (formData) => {
    const formatted = { ...formData };
    
    if (formatted.budget) {
      formatted.budget = Math.round(parseFloat(formatted.budget) * 100);
    }
    if (formatted.costPerUnit) {
      formatted.costPerUnit = Math.round(parseFloat(formatted.costPerUnit) * 100);
    }
    
    return formatted;
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