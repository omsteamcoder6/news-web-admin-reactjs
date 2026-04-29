// trendapi.js - UPDATED with boolean logic for Live News
import { useAuthStore } from '../stores/authStore';

// ✅ FIXED: Dynamic API base URL — no more hardcoded localhost
const API_BASE_URL = (() => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:3001/api';
  }
  return '/api';
})();

/**
 * Helper function to get auth token from store
 */
const getAuthToken = () => {
  const { getToken } = useAuthStore.getState();
  return getToken();
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
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
};

/**
 * Helper function to get auth headers
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ==================== TRENDING BAR API ====================

class TrendingBarAPI {
  /**
   * Get trending bar settings (public)
   */
  static async getTrendingBar() {
    try {
      const response = await fetch(`${API_BASE_URL}/trending-bar`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching trending bar:', error);
      throw error;
    }
  }

  /**
   * Update trending bar settings (admin only)
   */
  static async updateTrendingBar(settings) {
    try {
      const backendData = {
        items: settings.items || [],
        isEnabled: settings.isEnabled !== undefined ? settings.isEnabled : true,
        title: settings.title || 'Trending Now',
        backgroundColor: settings.backgroundColor || '#f8f9fa',
        textColor: settings.textColor || '#333333',
      };

      console.log('Sending to backend:', backendData);

      const response = await fetch(`${API_BASE_URL}/trending-bar`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(backendData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating trending bar:', error);
      throw error;
    }
  }

  /**
   * Add item to trending bar (admin only)
   */
  static async addTrendingItem(item) {
    try {
      const response = await fetch(`${API_BASE_URL}/trending-bar/items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(item),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error adding trending item:', error);
      throw error;
    }
  }

  /**
   * Remove item from trending bar (admin only)
   */
  static async removeTrendingItem(itemId) {
    try {
      const response = await fetch(`${API_BASE_URL}/trending-bar/items/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error removing trending item:', error);
      throw error;
    }
  }

  /**
   * Reorder trending bar items (admin only)
   */
  static async reorderTrendingItems(items) {
    try {
      const response = await fetch(`${API_BASE_URL}/trending-bar/items/reorder`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ items }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error reordering trending items:', error);
      throw error;
    }
  }

  /**
   * Toggle trending item active status (admin only)
   */
  static async toggleTrendingItem(itemId) {
    try {
      const response = await fetch(`${API_BASE_URL}/trending-bar/items/${itemId}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error toggling trending item:', error);
      throw error;
    }
  }
}

// ==================== LIVE NEWS API ====================

class LiveNewsAPI {
  /**
   * Get live news items (public) — only returns where isLiveNews = true
   */
  static async getLiveNews(options = {}) {
    const { limit = 10, priority } = options;
    const params = new URLSearchParams();

    params.append('limit', limit);
    if (priority && priority !== 'all') {
      params.append('priority', priority);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/live-news?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching live news:', error);
      throw error;
    }
  }

  /**
   * Create live news item (authenticated)
   * @param {Object} newsData - { title, content, isLiveNews (boolean), priority, etc }
   */
  static async createLiveNews(newsData) {
    try {
      const backendData = {
        title: newsData.title,
        content: newsData.content,
        excerpt: newsData.content?.substring(0, 200) || '',
        liveNewsPriority: newsData.priority || 'normal',
        featuredImage: newsData.featuredImage || null,
        category: newsData.category || null,
        tags: newsData.tags || [],
        isLiveNews: newsData.isLiveNews === true, // BOOLEAN — default false
        status: 'published',
      };

      console.log('Sending live news to backend:', backendData);

      const response = await fetch(`${API_BASE_URL}/live-news`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(backendData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error creating live news:', error);
      throw error;
    }
  }

  /**
   * Update live news item (authenticated)
   * BOOLEAN LOGIC: isLiveNews = true → publish, false → remove from live news
   */
  static async updateLiveNews(id, newsData) {
    try {
      const backendData = {
        title: newsData.title,
        content: newsData.content,
        excerpt: newsData.content?.substring(0, 200) || '',
        liveNewsPriority: newsData.priority || 'normal',
        featuredImage: newsData.featuredImage || null,
        category: newsData.category || null,
        tags: newsData.tags || [],
        isLiveNews: newsData.isLiveNews, // BOOLEAN — controls publishing
      };

      console.log('Updating live news on backend:', {
        id,
        isLiveNews: backendData.isLiveNews,
        message: backendData.isLiveNews
          ? 'Will publish as Live News'
          : 'Will remove from Live News',
      });

      const response = await fetch(`${API_BASE_URL}/live-news/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(backendData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating live news:', error);
      throw error;
    }
  }

  /**
   * Toggle live news status (boolean helper)
   */
  static async toggleLiveNews(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/live-news/${id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error toggling live news:', error);
      throw error;
    }
  }

  /**
   * Delete live news item (authenticated)
   */
  static async deleteLiveNews(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/live-news/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error deleting live news:', error);
      throw error;
    }
  }

  /**
   * Get all news items (including non-live) for admin
   */
  static async getAllNewsForAdmin(options = {}) {
    const { limit = 50, includeNonLive = true } = options;
    const params = new URLSearchParams();
    params.append('limit', limit);
    if (includeNonLive) params.append('includeNonLive', 'true');

    try {
      const response = await fetch(`${API_BASE_URL}/live-news/admin?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching all news for admin:', error);
      throw error;
    }
  }
}

// ==================== COMBINED TREND API ====================

class TrendAPI {
  static trendingBar = TrendingBarAPI;
  static liveNews = LiveNewsAPI;

  /**
   * Get all trending and live news data in one request
   */
  static async getAllTrendingData() {
    try {
      const [trendingBar, liveNews] = await Promise.all([
        TrendingBarAPI.getTrendingBar(),
        LiveNewsAPI.getLiveNews({ limit: 10 }),
      ]);

      return {
        trendingBar: trendingBar.data,
        liveNews: liveNews.data,
        liveNewsCount: liveNews.count,
      };
    } catch (error) {
      console.error('Error fetching all trending data:', error);
      throw error;
    }
  }

  /**
   * Get admin dashboard data
   */
  static async getAdminDashboardData() {
    try {
      const trendingBar = await TrendingBarAPI.getTrendingBar();
      const liveNews = await LiveNewsAPI.getLiveNews({ limit: 50 });

      return {
        trendingBar: trendingBar.data,
        liveNews: liveNews.data,
        totalLiveNews: liveNews.count,
      };
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated() {
    const { isAuthenticated } = useAuthStore.getState();
    return isAuthenticated;
  }

  /**
   * Get current user
   */
  static getCurrentUser() {
    const { user } = useAuthStore.getState();
    return user;
  }
}

export { TrendingBarAPI, LiveNewsAPI, TrendAPI };
export default TrendAPI;