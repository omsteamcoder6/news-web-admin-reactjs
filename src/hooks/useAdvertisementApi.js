// hooks/useAdvertisementApi.js
import { useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import advertisementApi from '../services/advertisementApi';

export const useAdvertisementApi = () => {
  const { token, isAuthenticated, user } = useAuthStore();

  // Wrapper to ensure authentication before making requests
  const requireAuth = useCallback(async (apiCall) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    return apiCall();
  }, [isAuthenticated]);

  return {
    // Admin methods (require auth)
    getAllAdvertisements: useCallback((filters, signal) => 
      requireAuth(() => advertisementApi.getAllAdvertisements(filters, signal)), 
      [requireAuth]
    ),
    
    getAdvertisementById: useCallback((id, signal) => 
      requireAuth(() => advertisementApi.getAdvertisementById(id, signal)), 
      [requireAuth]
    ),
    
    createAdvertisement: useCallback((adData, videoFile, imageFiles) => 
      requireAuth(() => advertisementApi.createAdvertisement(adData, videoFile, imageFiles)), 
      [requireAuth]
    ),
    
    updateAdvertisement: useCallback((id, adData) => 
      requireAuth(() => advertisementApi.updateAdvertisement(id, adData)), 
      [requireAuth]
    ),
    
    approveAdvertisement: useCallback((id) => 
      requireAuth(() => advertisementApi.approveAdvertisement(id)), 
      [requireAuth]
    ),
    
    rejectAdvertisement: useCallback((id, reason) => 
      requireAuth(() => advertisementApi.rejectAdvertisement(id, reason)), 
      [requireAuth]
    ),
    
    pauseAdvertisement: useCallback((id) => 
      requireAuth(() => advertisementApi.pauseAdvertisement(id)), 
      [requireAuth]
    ),
    
    resumeAdvertisement: useCallback((id) => 
      requireAuth(() => advertisementApi.resumeAdvertisement(id)), 
      [requireAuth]
    ),
    
    deleteAdvertisement: useCallback((id) => 
      requireAuth(() => advertisementApi.deleteAdvertisement(id)), 
      [requireAuth]
    ),
    
    getAdvertisementStats: useCallback((signal) => 
      requireAuth(() => advertisementApi.getAdvertisementStats(signal)), 
      [requireAuth]
    ),
    
    // Public methods (no auth required)
    getAdsForPlacement: advertisementApi.getAdsForPlacement,
    trackImpression: advertisementApi.trackImpression,
    handleAdClick: advertisementApi.handleAdClick,
    renderAdAndTrackImpression: advertisementApi.renderAdAndTrackImpression,
    
    // Helper methods
    formatAdForForm: advertisementApi.formatAdForForm,
    formatForApi: advertisementApi.formatForApi,
    getStatusInfo: advertisementApi.getStatusInfo,
    getPlacementCategories: advertisementApi.getPlacementCategories,
    getAdTypes: advertisementApi.getAdTypes,
    getPricingModels: advertisementApi.getPricingModels,
    getDeviceOptions: advertisementApi.getDeviceOptions,
    
    // Auth info
    isAuthenticated,
    currentUser: user,
  };
};