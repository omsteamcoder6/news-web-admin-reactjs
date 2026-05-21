import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL;

class AwardAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getToken() {
    const token = useAuthStore.getState().token;
    return token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        const authStore = useAuthStore.getState();
        authStore.logout();
        throw { status: 401, message: 'Session expired. Please login again.' };
      }

      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw { status: response.status, message: data.message || data || 'Something went wrong' };
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async uploadAwardImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    return this.request('/awards/upload-image', { method: 'POST', body: formData });
  }

  // Award endpoints
  getAwards(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/awards?${queryString}` : '/awards';
    return this.request(endpoint, { method: 'GET' });
  }

  getAwardById(id) {
    return this.request(`/awards/${id}`, { method: 'GET' });
  }

  createAward(awardData) {
    return this.request('/awards', { method: 'POST', body: JSON.stringify(awardData) });
  }

  updateAward(id, awardData) {
    return this.request(`/awards/${id}`, { method: 'PUT', body: JSON.stringify(awardData) });
  }

  deleteAward(id) {
    return this.request(`/awards/${id}`, { method: 'DELETE' });
  }

  updateAwardStatus(id, status) {
    return this.request(`/awards/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }

  // NEW: Update SEO settings only
  updateAwardSEO(id, seoData) {
    return this.request(`/awards/${id}/seo`, { 
      method: 'PATCH', 
      body: JSON.stringify({ seo: seoData }) 
    });
  }

  getAwardStats() {
    return this.request('/awards/stats/dashboard', { method: 'GET' });
  }

  // Nomination endpoints
  createNomination(nominationData) {
    return this.request('/nominations', { method: 'POST', body: JSON.stringify(nominationData) });
  }

  getNominations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/nominations${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  }

  getNominationById(id) {
    return this.request(`/nominations/${id}`, { method: 'GET' });
  }

  updateNominationStatus(id, status, adminRemarks = '') {
    return this.request(`/nominations/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, adminRemarks }) });
  }

  updatePaymentStatus(id, paymentStatus, paymentId = '', transactionId = '') {
    return this.request(`/nominations/${id}/payment`, { method: 'PUT', body: JSON.stringify({ paymentStatus, paymentId, transactionId }) });
  }

  // Helper methods
  getActiveAwards() {
    return this.getAwards({ status: 'active' });
  }

  approveNomination(id, remarks = '') {
    return this.updateNominationStatus(id, 'approved', remarks);
  }

  rejectNomination(id, remarks = '') {
    return this.updateNominationStatus(id, 'rejected', remarks);
  }

  shortlistNomination(id, remarks = '') {
    return this.updateNominationStatus(id, 'shortlisted', remarks);
  }

  markAsWinner(id, remarks = '') {
    return this.updateNominationStatus(id, 'winner', remarks);
  }
}

const awardAPI = new AwardAPI();
export default awardAPI;