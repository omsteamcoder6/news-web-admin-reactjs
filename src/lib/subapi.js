// frontend/src/services/subapi.js
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// FIXED: Using Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token from Zustand store
api.interceptors.request.use(
  (config) => {
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// SUBSCRIPTION PLAN APIs
// ============================================

export const getAllPlans = async () => {
  try {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPlanById = async (planId) => {
  try {
    const response = await api.get(`/subscriptions/plans/${planId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createPlan = async (planData) => {
  try {
    const response = await api.post('/subscriptions/plans', planData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updatePlan = async (planId, planData) => {
  try {
    const response = await api.put(`/subscriptions/plans/${planId}`, planData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deletePlan = async (planId) => {
  try {
    const response = await api.delete(`/subscriptions/plans/${planId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const subscribeToPlan = async (subscriptionData) => {
  try {
    const response = await api.post('/subscriptions/subscribe', subscriptionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMySubscription = async () => {
  try {
    const response = await api.get('/subscriptions/my-subscription');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const cancelSubscription = async (cancellationReason = '') => {
  try {
    const response = await api.put('/subscriptions/cancel', { cancellationReason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPaymentHistory = async () => {
  try {
    const response = await api.get('/subscriptions/payments');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const trackMagazineAccess = async (magazineId) => {
  try {
    const response = await api.post('/subscriptions/track-magazine', { magazineId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getSubscriptionStats = async () => {
  try {
    const response = await api.get('/subscriptions/stats/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const hasActiveSubscription = async () => {
  try {
    const response = await getMySubscription();
    return response.success && response.data !== null;
  } catch (error) {
    return false;
  }
};

export const canAccessMagazine = async (magazineId) => {
  try {
    const subscription = await getMySubscription();
    if (!subscription.success || !subscription.data) return false;
    
    const plan = subscription.data.plan;
    if (plan.isUnlimited) return true;
    
    if (!plan.magazineLimit) return true;
    
    const monthlyAccess = subscription.data.magazinesAccessed?.filter(
      access => new Date(access.accessedAt) >= new Date(new Date().setDate(1))
    ).length || 0;
    
    return monthlyAccess < plan.magazineLimit;
  } catch (error) {
    return false;
  }
};

export const getRemainingQuota = async () => {
  try {
    const subscription = await getMySubscription();
    if (!subscription.success || !subscription.data) {
      return { hasSubscription: false, remaining: 0, limit: 0 };
    }
    
    const plan = subscription.data.plan;
    if (plan.isUnlimited) {
      return { hasSubscription: true, remaining: 'Unlimited', limit: 'Unlimited' };
    }
    
    if (!plan.magazineLimit) {
      return { hasSubscription: true, remaining: 'Unlimited', limit: 'Unlimited' };
    }
    
    const monthlyAccess = subscription.data.magazinesAccessed?.filter(
      access => new Date(access.accessedAt) >= new Date(new Date().setDate(1))
    ).length || 0;
    
    return {
      hasSubscription: true,
      remaining: Math.max(0, plan.magazineLimit - monthlyAccess),
      limit: plan.magazineLimit,
      used: monthlyAccess
    };
  } catch (error) {
    return { hasSubscription: false, remaining: 0, limit: 0 };
  }
};

const subapi = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  subscribeToPlan,
  getMySubscription,
  cancelSubscription,
  getPaymentHistory,
  trackMagazineAccess,
  getSubscriptionStats,
  hasActiveSubscription,
  canAccessMagazine,
  getRemainingQuota,
};

export default subapi;