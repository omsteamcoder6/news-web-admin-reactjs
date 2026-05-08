// lib/apiClient.js - Enhanced version
import { useAuthStore } from '../stores/authStore';

// FIXED: Using Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from auth store instead of localStorage
  getToken() {
    if (typeof window !== 'undefined') {
      // Try to get from store first
      try {
        const token = useAuthStore.getState().token;
        if (token) return token;
      } catch (e) {
        // Store might not be initialized yet
      }
      // Fallback to localStorage
      return localStorage.getItem('token');
    }
    return null;
  }

  // Set auth token in both store and localStorage
  setToken(token) {
    if (typeof window !== 'undefined') {
      // Update store if available
      try {
        const store = useAuthStore.getState();
        if (store.setAuth && token) {
          // Don't overwrite user data, just update token
          store.setAuth(token, store.user);
        }
      } catch (e) {
        // Store not available, just set in localStorage
        localStorage.setItem('token', token);
      }
    }
  }

  // Remove auth token from both store and localStorage
  removeToken() {
    if (typeof window !== 'undefined') {
      try {
        const store = useAuthStore.getState();
        if (store.logout) {
          store.logout();
        } else {
          localStorage.removeItem('token');
        }
      } catch (e) {
        localStorage.removeItem('token');
      }
    }
  }

  // Rest of your methods remain the same...
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async handleResponse(response) {
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = {};
    }
    
    if (!response.ok) {
      if (response.status === 401) {
        this.removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
      }
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  }

  async get(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async post(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async put(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async delete(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient();
export default apiClient;