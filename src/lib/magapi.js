// frontend/src/lib/magapi.js
// Frontend API client for magazine management system with SEO support

import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env?.VITE_API_URL ;

class MagazineAPI {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // ─── Auth Token Management ────────────────────────────────────────────────

  getToken() {
    try {
      const state = useAuthStore.getState();
      const token = state.token;
      
      if (token) {
        return token;
      }
    } catch (e) {
      console.warn('Could not get token from auth store:', e.message);
    }
    
    // Fallback: check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      if (value && typeof value === 'string' && 
          value.startsWith('eyJ') && 
          value.split('.').length === 3 &&
          key !== 'refreshToken' &&
          key !== 'auth-storage') {
        return value;
      }
    }
    
    return null;
  }

  // ─── Headers ──────────────────────────────────────────────────────────────

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  getFormDataHeaders() {
    const headers = {};
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // ─── Response Handling ────────────────────────────────────────────────────

  async handleResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      if (!response.ok) throw { status: response.status, message: 'Request failed' };
      return response.blob();
    }

    const data = await response.json();
    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'An error occurred',
        data,
      };
    }
    return data;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, options);
    return this.handleResponse(response);
  }

  // ─── Magazine CRUD with SEO Support ───────────────────────────────────────

  async getMagazines(params = {}) {
    const qp = new URLSearchParams();
    if (params.page) qp.append('page', params.page);
    if (params.limit) qp.append('limit', params.limit);
    if (params.search) qp.append('search', params.search);
    if (params.accessType && params.accessType !== 'all')
      qp.append('accessType', params.accessType);
    
    if (params.showAll) {
      qp.append('showAll', 'true');
    }

    const qs = qp.toString();
    console.log('📡 Fetching magazines with params:', { ...params, showAll: params.showAll });
    
    return this.request(`/magazines${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  async getMagazineById(id) {
    return this.request(`/magazines/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  async getMagazineBySlug(slug) {
    return this.request(`/magazines/slug/${slug}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  // ─── SEO Methods (NEW) ───────────────────────────────────────────────────

  async getMagazineSEO(slug) {
    return this.request(`/magazines/seo/${slug}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  async getSitemapData() {
    return this.request('/magazines/sitemap', {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  async getStructuredData(slug) {
    return this.request(`/magazines/structured-data/${slug}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  // ─── Create/Update with SEO Fields ───────────────────────────────────────

  async createMagazine(magazineData) {
    const formData = this.createMagazineFormData(magazineData);

    console.log('📤 Creating magazine with SEO:', {
      title: magazineData.title,
      slug: magazineData.slug,
      accessType: magazineData.accessType,
      metaTitle: magazineData.metaTitle,
      hasMetaDescription: !!magazineData.metaDescription,
    });

    const url = `${this.baseURL}/magazines`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getFormDataHeaders(),
      body: formData,
    });
    
    if (response.status === 401) {
      console.error('❌ Authentication failed');
      throw { status: 401, message: 'Authentication failed. Please log in again.' };
    }
    
    return this.handleResponse(response);
  }

  async updateMagazine(id, magazineData) {
    const formData = this.createMagazineFormData(magazineData);

    const url = `${this.baseURL}/magazines/${id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getFormDataHeaders(),
      body: formData,
    });
    
    if (response.status === 401) {
      console.error('❌ Authentication failed');
      throw { status: 401, message: 'Authentication failed. Please log in again.' };
    }
    
    return this.handleResponse(response);
  }

  async deleteMagazine(id) {
    return this.request(`/magazines/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  }

  async downloadMagazine(id) {
    const token = this.getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${this.baseURL}/magazines/${id}/download`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw { status: response.status, message: err.message || 'Download failed' };
    }

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (data.downloadUrl) {
        const fileRes = await fetch(data.downloadUrl);
        if (!fileRes.ok) throw { status: fileRes.status, message: 'Signed URL fetch failed' };
        return fileRes.blob();
      }
    }

    return response.blob();
  }

  async triggerDownload(id, filename = null) {
    const blob = await this.downloadMagazine(id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `magazine-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // ─── Admin / Analytics ────────────────────────────────────────────────────

  async getMagazineStats() {
    return this.request('/magazines/stats', {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  async getMagazinesByDateRange(startDate, endDate) {
    const qp = new URLSearchParams({ startDate, endDate });
    return this.request(`/magazines/date-range?${qp.toString()}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  async getFreeMagazines(params = {}) {
    return this.getMagazines({ ...params, accessType: 'free' });
  }

  async getPremiumMagazines(params = {}) {
    return this.getMagazines({ ...params, accessType: 'premium' });
  }

  async searchMagazines(term, params = {}) {
    return this.getMagazines({ ...params, search: term });
  }

  async getRecentMagazines(limit = 5) {
    return this.getMagazines({ limit, page: 1 });
  }

  debugAuth() {
    console.log('=== 🔍 Auth Debug Info ===');
    const token = this.getToken();
    console.log('Token found:', token ? '✅ Yes' : '❌ No');
    return token ? true : false;
  }

  // ─── FormData Creation with SEO Fields (UPDATED) ─────────────────────────

  createMagazineFormData(d) {
    const fd = new FormData();

    // Basic fields
    if (d.title) fd.append('title', d.title);
    if (d.slug) fd.append('slug', d.slug);
    if (d.description) fd.append('description', d.description);
    if (d.pages) fd.append('pages', d.pages);
    if (d.issueDate) fd.append('issueDate', d.issueDate);
    if (d.issueDateTime) fd.append('issueDateTime', d.issueDateTime);
    if (d.accessType) fd.append('accessType', d.accessType);
    if (d.subscribers) fd.append('subscribers', d.subscribers);
    if (d.isPublished !== undefined) fd.append('isPublished', d.isPublished);

    // ============================================
    // SEO FIELDS (NEW)
    // ============================================
    if (d.metaTitle) fd.append('metaTitle', d.metaTitle);
    if (d.metaDescription) fd.append('metaDescription', d.metaDescription);
    if (d.metaKeywords) {
      // Send as JSON string if array, otherwise as string
      const keywords = Array.isArray(d.metaKeywords) 
        ? JSON.stringify(d.metaKeywords) 
        : d.metaKeywords;
      fd.append('metaKeywords', keywords);
    }
    if (d.canonicalUrl) fd.append('canonicalUrl', d.canonicalUrl);
    if (d.ogTitle) fd.append('ogTitle', d.ogTitle);
    if (d.ogDescription) fd.append('ogDescription', d.ogDescription);
    if (d.ogImage) fd.append('ogImage', d.ogImage);
    if (d.twitterTitle) fd.append('twitterTitle', d.twitterTitle);
    if (d.twitterDescription) fd.append('twitterDescription', d.twitterDescription);
    if (d.twitterImage) fd.append('twitterImage', d.twitterImage);
    if (d.robots) fd.append('robots', d.robots);
    if (d.schemaType) fd.append('schemaType', d.schemaType);

    // File uploads
    if (d.coverImageFile instanceof File) {
      fd.append('coverImage', d.coverImageFile);
    } else if (d.coverImage instanceof File) {
      fd.append('coverImage', d.coverImage);
    }

    if (d.pdfFile instanceof File) {
      fd.append('pdfFile', d.pdfFile);
    }

    return fd;
  }
}

const magazineAPI = new MagazineAPI();
export default magazineAPI;
export { MagazineAPI };