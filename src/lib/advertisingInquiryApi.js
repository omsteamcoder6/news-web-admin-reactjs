// lib/advertisingInquiryApi.js
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// FIXED: Using Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL ;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token from store
apiClient.interceptors.request.use(
  (config) => {
    // Get token from authStore
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear auth store and redirect to login
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Cancel token for preventing multiple requests
let cancelTokenSource = null;

/**
 * Advertising Inquiry API Service
 */
class AdvertisingInquiryAPI {
  /**
   * Create a new inquiry (Public)
   */
  static async createInquiry(inquiryData) {
    try {
      const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
      const cleanedPhone = inquiryData.phone.replace(/\s/g, '');
      
      if (!phoneRegex.test(cleanedPhone)) {
        throw new Error('Please enter a valid Indian mobile number');
      }

      const response = await apiClient.post('/advertising-inquiry', {
        ...inquiryData,
        phone: cleanedPhone,
        email: inquiryData.email.toLowerCase(),
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all inquiries (Admin only) - NO LIMIT VERSION
   */
  static async getAllInquiries({ page = 1, limit = null, status = '', search = '' } = {}) {
    try {
      // Cancel previous request to prevent multiple simultaneous requests
      if (cancelTokenSource) {
        cancelTokenSource.cancel('Request cancelled due to new request');
      }
      cancelTokenSource = axios.CancelToken.source();

      const params = new URLSearchParams();
      params.append('page', page);
      // Only add limit if it has a value
      if (limit !== null && limit !== undefined) {
        params.append('limit', limit);
      }
      if (status && status !== 'all') params.append('status', status);
      if (search) params.append('search', search);

      const response = await apiClient.get(`/advertising-inquiry?${params.toString()}`, {
        cancelToken: cancelTokenSource.token
      });
      
      cancelTokenSource = null;
      return response.data;
    } catch (error) {
      cancelTokenSource = null;
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
        return { success: false, data: [], pagination: { total: 0 } };
      }
      throw this.handleError(error);
    }
  }

  /**
   * Get single inquiry by ID (Admin only)
   */
  static async getInquiryById(id) {
    try {
      const response = await apiClient.get(`/advertising-inquiry/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update inquiry status (Admin only)
   */
  static async updateInquiryStatus(id, status, notes = '') {
    try {
      const response = await apiClient.put(`/advertising-inquiry/${id}/status`, {
        status,
        notes,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Assign inquiry to admin (Admin only)
   */
  static async assignInquiry(id, assignedTo) {
    try {
      const response = await apiClient.put(`/advertising-inquiry/${id}/assign`, {
        assignedTo,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete inquiry (Admin only)
   */
  static async deleteInquiry(id) {
    try {
      const response = await apiClient.delete(`/advertising-inquiry/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get inquiry statistics for dashboard (Admin only)
   */
  static async getInquiryStats() {
    try {
      const response = await apiClient.get('/advertising-inquiry/stats/dashboard');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk update inquiry statuses (Admin only)
   */
  static async bulkUpdateStatus(ids, status) {
    try {
      const promises = ids.map(id => this.updateInquiryStatus(id, status));
      const results = await Promise.all(promises);
      return {
        success: true,
        message: `${results.length} inquiries updated successfully`,
        data: results.map(r => r.data),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export inquiries to CSV (Admin only)
   */
  static async exportToCSV(filters = {}) {
    try {
      const { data: { data: inquiries } } = await this.getAllInquiries({ 
        limit: 10000, 
        ...filters 
      });
      
      const csvHeaders = [
        'ID', 'Full Name', 'Company Name', 'Email', 'Phone', 
        'Message', 'Status', 'Notes', 'Created At', 'Contacted At', 
        'Converted At', 'Assigned To'
      ];
      
      const csvRows = inquiries.map(inquiry => [
        inquiry._id,
        inquiry.fullName,
        inquiry.companyName,
        inquiry.email,
        inquiry.phone,
        (inquiry.message || '').replace(/,/g, ' '),
        inquiry.status,
        (inquiry.notes || '').replace(/,/g, ' '),
        new Date(inquiry.createdAt).toLocaleString(),
        inquiry.contactedAt ? new Date(inquiry.contactedAt).toLocaleString() : '',
        inquiry.convertedAt ? new Date(inquiry.convertedAt).toLocaleString() : '',
        inquiry.assignedTo?.name || 'Unassigned',
      ]);
      
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      return csvContent;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get status badge configuration
   */
  static getStatusBadge(status) {
    const statusConfig = {
      pending: { label: 'Pending', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800' },
      contacted: { label: 'Contacted', color: 'blue', bg: 'bg-blue-100', text: 'text-blue-800' },
      converted: { label: 'Converted', color: 'green', bg: 'bg-green-100', text: 'text-green-800' },
      rejected: { label: 'Rejected', color: 'red', bg: 'bg-red-100', text: 'text-red-800' },
    };
    return statusConfig[status] || statusConfig.pending;
  }

  /**
   * Error handler
   */
  static handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || 'An error occurred';
      const errors = error.response.data?.errors || [];
      return new Error(message, { cause: { errors, status: error.response.status } });
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return error;
    }
  }
}

// React Hooks
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to fetch all inquiries with NO LIMIT - Shows all inquiries
 */
export const useInquiries = (options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: null, total: 0, pages: 0 });
  
  // Store options as a stable reference
  const optionsRef = useRef(options);
  const hasFetched = useRef(false);

  const fetchInquiries = useCallback(async (newOptions = {}) => {
    setLoading(true);
    try {
      const mergedOptions = { ...optionsRef.current, ...newOptions };
      const response = await AdvertisingInquiryAPI.getAllInquiries(mergedOptions);
      if (response.success !== false) {
        setData(response.data || []);
        setPagination(response.pagination || { page: 1, limit: null, total: 0, pages: 0 });
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchInquiries();
    }
  }, [fetchInquiries]);

  return { data, loading, error, pagination, refetch: fetchInquiries };
};

/**
 * Hook to fetch inquiry statistics (FIXED)
 */
export const useInquiryStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await AdvertisingInquiryAPI.getInquiryStats();
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchStats();
    }
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

/**
 * Hook to fetch single inquiry (FIXED)
 */
export const useInquiry = (id) => {
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  const fetchInquiry = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await AdvertisingInquiryAPI.getInquiryById(id);
      setInquiry(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!hasFetched.current && id) {
      hasFetched.current = true;
      fetchInquiry();
    }
  }, [fetchInquiry, id]);

  return { inquiry, loading, error, refetch: fetchInquiry };
};

/**
 * Hook for creating inquiry (form submission)
 */
export const useCreateInquiry = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createInquiry = async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await AdvertisingInquiryAPI.createInquiry(formData);
      setSuccess(true);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createInquiry, loading, error, success };
};

export default AdvertisingInquiryAPI;