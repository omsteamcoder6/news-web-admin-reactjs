// Advertisements.jsx (Page Component with direct API integration)
import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from "../../layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Plus, Loader2 } from 'lucide-react';
import { AdCard } from '../../components/advertisements/AdCard';
import { AdvertisementForm } from '../../components/advertisements/AdvertisementForm';
import { StatsCards } from '../../components/advertisements/StatsCards';
import { RejectDialog } from '../../components/advertisements/RejectDialog';
import { toast } from 'sonner';
import { useAuthStore } from '../../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function AdvertisementsPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [rejectAdId, setRejectAdId] = useState(null);
  const [stats, setStats] = useState(null);
  const [sizeFilter, setSizeFilter] = useState('all');
  
  const { token, isAuthenticated } = useAuthStore();

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    if (!token) {
      toast.error('Please login to continue');
      return null;
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchAds = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      const response = await fetch(`${API_BASE_URL}/advertisements`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch advertisements');
      }
      
      const data = await response.json();
      const adsData = data.data || data;
      setAds(adsData);
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      toast.error(error.message || 'Failed to load advertisements');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      const response = await fetch(`${API_BASE_URL}/advertisements/stats/dashboard`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      setStats(data.data || data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAds();
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [fetchAds, fetchStats, isAuthenticated, token]);

  // ✅ FIXED: Clean save function
  const saveAd = async (formData, imageFiles, videoFile) => {
    if (!token) {
      toast.error('Please login to continue');
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      
      // Append form data - clean version
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (typeof formData[key] === 'object') {
            formDataToSend.append(key, JSON.stringify(formData[key]));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });
      
      // Append images
      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach(file => {
          formDataToSend.append('images', file);
        });
      }
      
      // Append video
      if (videoFile) {
        formDataToSend.append('videoFile', videoFile);
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      // ✅ FIXED: Use consistent ID extraction
      const adId = editingAd?._id || editingAd?.id;
      const url = adId 
        ? `${API_BASE_URL}/advertisements/${adId}`
        : `${API_BASE_URL}/advertisements`;
      
      const response = await fetch(url, {
        method: adId ? 'PUT' : 'POST',
        headers,
        body: formDataToSend
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save advertisement');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(editingAd ? 'Advertisement updated successfully' : 'Advertisement created successfully');
        await fetchAds();
        await fetchStats();
        setShowCreateDialog(false);
        setEditingAd(null);
      } else {
        toast.error(result.message || 'Failed to save advertisement');
      }
    } catch (error) {
      console.error('Failed to save ad:', error);
      toast.error(error.message || 'Failed to save advertisement');
    }
  };

  // ✅ FIXED: Delete with proper ID
  const handleDeleteAd = async (adId) => {
    if (!adId) {
      console.error('Invalid ad ID:', adId);
      toast.error('Cannot delete: Invalid advertisement ID');
      return;
    }

    if (!token) {
      toast.error('Please login to continue');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this advertisement? This action cannot be undone.');
    if (!confirmDelete) return;

    const previousAds = ads;
    setAds(prev => prev.filter(ad => (ad._id || ad.id) !== adId));

    toast.loading('Deleting advertisement...', { id: 'delete-toast' });

    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error('Authentication required');
      
      const response = await fetch(`${API_BASE_URL}/advertisements/${adId}`, {
        method: 'DELETE',
        headers
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Advertisement deleted successfully', { id: 'delete-toast' });
        await fetchAds();
        await fetchStats();
      } else {
        setAds(previousAds);
        toast.error(result.message || 'Failed to delete advertisement', { id: 'delete-toast' });
      }
    } catch (error) {
      setAds(previousAds);
      console.error('❌ Failed to delete ad:', error);
      toast.error(error.message || 'Failed to delete advertisement', { id: 'delete-toast' });
    }
  };

  // ✅ FIXED: Approve
  const approveAd = async (id) => {
    if (!token) {
      toast.error('Please login to continue');
      return;
    }
    
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error('Authentication required');
      
      const response = await fetch(`${API_BASE_URL}/advertisements/${id}/approve`, {
        method: 'PUT',
        headers
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Advertisement approved successfully');
        await fetchAds();
        await fetchStats();
      } else {
        toast.error(result.message || 'Failed to approve advertisement');
      }
    } catch (error) {
      console.error('Failed to approve ad:', error);
      toast.error(error.message || 'Failed to approve advertisement');
    }
  };

  // ✅ FIXED: Reject
  const rejectAd = async (id, reason) => {
    if (!token) {
      toast.error('Please login to continue');
      return;
    }
    
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const response = await fetch(`${API_BASE_URL}/advertisements/${id}/reject`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ reason })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Advertisement rejected');
        await fetchAds();
        await fetchStats();
        setRejectAdId(null);
      } else {
        toast.error(result.message || 'Failed to reject advertisement');
      }
    } catch (error) {
      console.error('Failed to reject ad:', error);
      toast.error(error.message || 'Failed to reject advertisement');
    }
  };

  // ✅ FIXED: Pause
  const pauseAd = async (id) => {
    if (!token) {
      toast.error('Please login to continue');
      return;
    }
    
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error('Authentication required');
      
      const response = await fetch(`${API_BASE_URL}/advertisements/${id}/pause`, {
        method: 'PUT',
        headers
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Advertisement paused');
        await fetchAds();
        await fetchStats();
      } else {
        toast.error(result.message || 'Failed to pause advertisement');
      }
    } catch (error) {
      console.error('Failed to pause ad:', error);
      toast.error(error.message || 'Failed to pause advertisement');
    }
  };

  // ✅ FIXED: Resume
  const resumeAd = async (id) => {
    if (!token) {
      toast.error('Please login to continue');
      return;
    }
    
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error('Authentication required');
      
      const response = await fetch(`${API_BASE_URL}/advertisements/${id}/resume`, {
        method: 'PUT',
        headers
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Advertisement resumed successfully');
        await fetchAds();
        await fetchStats();
      } else {
        toast.error(result.message || 'Failed to resume advertisement');
      }
    } catch (error) {
      console.error('Failed to resume ad:', error);
      toast.error(error.message || 'Failed to resume advertisement');
    }
  };

  const filterBySize = (ad) => {
    if (sizeFilter === 'all') return true;
    const sizeKey = `${ad.adSize?.width || 0}x${ad.adSize?.height || 0}`;
    return sizeKey === sizeFilter;
  };

  const filteredAds = ads.filter(ad => {
    const tabMatch = (() => {
      if (activeTab === 'active') return ad.status === 'active';
      if (activeTab === 'pending') return ad.status === 'pending_approval';
      if (activeTab === 'paused') return ad.status === 'paused';
      if (activeTab === 'expired') return ad.status === 'expired' || ad.status === 'rejected';
      return true;
    })();
    return tabMatch && filterBySize(ad);
  });

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-slate-600">Please login to access advertisements</p>
        </div>
      </MainLayout>
    );
  }

  if (loading && ads.length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Advertisement Management</h1>
            <p className="text-slate-600 mt-1">Full lifecycle control: creation, targeting, performance, monetization & safety</p>
          </div>
          <Button 
            className="bg-orange-500 hover:bg-orange-600 gap-2" 
            onClick={() => { 
              setEditingAd(null); 
              setShowCreateDialog(true); 
            }}
          >
            <Plus className="w-4 h-4" />
            New Advertisement
          </Button>
        </div>

        <StatsCards ads={ads} stats={stats} />

        <Card>
          <CardHeader>
            <CardTitle>Advertisement Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Filter by size:</span>
                <select 
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="border rounded-lg px-3 py-1.5 text-sm bg-white"
                >
                  <option value="all">All sizes</option>
                  <option value="728x90">728×90 (Leaderboard)</option>
                  <option value="970x90">970×90 (Large Leaderboard)</option>
                  <option value="970x250">970×250 (Billboard)</option>
                  <option value="300x250">300×250 (Medium Rectangle)</option>
                  <option value="336x280">336×280 (Large Rectangle)</option>
                  <option value="160x600">160×600 (Wide Skyscraper)</option>
                  <option value="300x600">300×600 (Half Page)</option>
                  <option value="320x50">320×50 (Mobile Banner)</option>
                  <option value="320x100">320×100 (Large Mobile Banner)</option>
                </select>
              </div>
              <div className="text-sm text-slate-500">
                Showing {filteredAds.length} of {ads.length} ads
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="active">
                  Active ({ads.filter(a => a.status === 'active').length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending Approval ({ads.filter(a => a.status === 'pending_approval').length})
                </TabsTrigger>
                <TabsTrigger value="paused">
                  Paused ({ads.filter(a => a.status === 'paused').length})
                </TabsTrigger>
                <TabsTrigger value="expired">
                  Expired/Rejected ({ads.filter(a => a.status === 'expired' || a.status === 'rejected').length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {filteredAds.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <p>No advertisements in this category</p>
                  </div>
                ) : (
                  filteredAds.map(ad => {
                    // ✅ FIXED: Ensure consistent ID
                    const adId = ad._id || ad.id;
                    return (
                      <AdCard
                        key={adId}
                        ad={{
                          ...ad,
                          id: adId,
                        }}
                        // ✅ FIXED: Pass clean editing data
                        onEdit={(ad) => { 
                          // Clean the ad object before passing to form
                          const cleanAd = { ...ad };
                          delete cleanAd.__v;
                          delete cleanAd.createdAt;
                          delete cleanAd.updatedAt;
                          delete cleanAd.createdBy;
                          delete cleanAd.approvedBy;
                          delete cleanAd.rejectedBy;
                          delete cleanAd.deletedBy;
                          setEditingAd(cleanAd); 
                          setShowCreateDialog(true); 
                        }}
                        onDelete={handleDeleteAd}
                        onApprove={approveAd}
                        onReject={(id) => setRejectAdId(id)}
                        onPause={pauseAd}
                        onResume={resumeAd}
                      />
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <AdvertisementForm 
          isOpen={showCreateDialog}
          onClose={() => {
            setShowCreateDialog(false);
            setEditingAd(null);
          }}
          onSubmit={saveAd}
          editingAd={editingAd}
        />

        <RejectDialog 
          isOpen={rejectAdId !== null}
          onClose={() => setRejectAdId(null)}
          onConfirm={(reason) => rejectAd(rejectAdId, reason)}
        />
      </div>
    </MainLayout>
  );
}