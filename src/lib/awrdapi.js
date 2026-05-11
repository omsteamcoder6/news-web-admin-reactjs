// awrdapi.js
// API Client for Award Nomination System

import { useAuthStore } from '../stores/authStore'; // Adjust path as needed

// Fix: Use Vite's import.meta.env instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_URL;
class AwardAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Rest of your code remains exactly the same
  getToken() {
    const state = useAuthStore.getState();
    return state.token;
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

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        const authStore = useAuthStore.getState();
        authStore.logout();
        throw {
          status: 401,
          message: 'Session expired. Please login again.',
        };
      }

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'Something went wrong',
          data: data,
        };
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ... rest of your methods remain exactly the same
  setAuth(token, user) {
    const authStore = useAuthStore.getState();
    authStore.setAuth(token, user);
  }

  clearAuth() {
    const authStore = useAuthStore.getState();
    authStore.logout();
  }

  // ==================== AWARD ENDPOINTS ====================
  getAwards(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/awards?${queryString}` : '/awards';
    return this.request(endpoint, { method: 'GET' });
  }

  getAwardById(id) {
    return this.request(`/awards/${id}`, { method: 'GET' });
  }

  createAward(awardData) {
    return this.request('/awards', {
      method: 'POST',
      body: JSON.stringify(awardData),
    });
  }

  updateAward(id, awardData) {
    return this.request(`/awards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(awardData),
    });
  }

  deleteAward(id) {
    return this.request(`/awards/${id}`, { method: 'DELETE' });
  }

  updateAwardStatus(id, status) {
    return this.request(`/awards/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  getAwardStats() {
    return this.request('/awards/stats/dashboard', { method: 'GET' });
  }

  // ==================== NOMINATION ENDPOINTS ====================
  createNomination(nominationData) {
    return this.request('/nominations', {
      method: 'POST',
      body: JSON.stringify(nominationData),
    });
  }

  getNominations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/nominations?${queryString}` : '/nominations';
    return this.request(endpoint, { method: 'GET' });
  }

  getNominationById(id) {
    return this.request(`/nominations/${id}`, { method: 'GET' });
  }

  getNominationsByAward(awardId) {
    return this.request(`/nominations/award/${awardId}`, { method: 'GET' });
  }

  updateNominationStatus(id, status, adminRemarks = '') {
    return this.request(`/nominations/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminRemarks }),
    });
  }

  updatePaymentStatus(id, paymentStatus, paymentId = '', transactionId = '') {
    return this.request(`/nominations/${id}/payment`, {
      method: 'PUT',
      body: JSON.stringify({ paymentStatus, paymentId, transactionId }),
    });
  }

  // ==================== AUTH ENDPOINTS ====================
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token && response.user) {
      this.setAuth(response.token, response.user);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token && response.user) {
      this.setAuth(response.token, response.user);
    }
    
    return response;
  }

  logout() {
    this.clearAuth();
  }

  async getCurrentUser() {
    return this.request('/auth/me', { method: 'GET' });
  }

  // ==================== CONVENIENCE METHODS ====================
  getActiveAwards() {
    return this.getAwards({ status: 'active' });
  }

  getMyNominations(params = {}) {
    return this.getNominations(params);
  }

  getPendingNominations() {
    return this.getNominations({ status: 'pending' });
  }

  getPendingPaymentNominations() {
    return this.getNominations({ paymentStatus: 'pending' });
  }

  getCompletedNominations() {
    return this.getNominations({ paymentStatus: 'completed' });
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

  markPaymentCompleted(id, transactionId = '') {
    return this.updatePaymentStatus(id, 'completed', '', transactionId);
  }

  markPaymentFailed(id) {
    return this.updatePaymentStatus(id, 'failed');
  }
}

// Create and export singleton instance
const awardAPI = new AwardAPI();

export { AwardAPI, awardAPI as default };