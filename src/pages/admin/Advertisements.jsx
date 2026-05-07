// Advertisements.jsx (Page Component with API Integration)
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
import advertisementApi from '../../lib/advertisementApi';
import { toast } from 'sonner';

export default function AdvertisementsPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [rejectAdId, setRejectAdId] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const response = await advertisementApi.getAllAdvertisements();
      const adsData = response.data || response;
      setAds(adsData);
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      toast.error(error.message || 'Failed to load advertisements');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await advertisementApi.getAdvertisementStats();
      setStats(response.data || response);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchAds();
    fetchStats();
  }, [fetchAds, fetchStats]);

  const saveAd = async (formData, imageFiles, videoFile) => {
    try {
      if (editingAd) {
        const response = await advertisementApi.updateAdvertisement(editingAd.id || editingAd._id, formData);
        toast.success('Advertisement updated successfully');
        await fetchAds();
      } else {
        const response = await advertisementApi.createAdvertisement(formData, videoFile, imageFiles);
        toast.success('Advertisement created successfully');
        await fetchAds();
      }
      setShowCreateDialog(false);
      setEditingAd(null);
      fetchStats();
    } catch (error) {
      console.error('Failed to save ad:', error);
      toast.error(error.message || 'Failed to save advertisement');
    }
  };

  const softDeleteAd = async (id) => {
    const adId = id?._id || id;
    if (!adId) {
      console.error('Invalid ad ID:', id);
      toast.error('Cannot delete: Invalid advertisement ID');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this advertisement?')) return;
    
    try {
      await advertisementApi.deleteAdvertisement(adId);
      toast.success('Advertisement deleted successfully');
      await fetchAds();
      await fetchStats();
    } catch (error) {
      console.error('Failed to delete ad:', error);
      toast.error(error.message || 'Failed to delete advertisement');
    }
  };

  const approveAd = async (id) => {
    try {
      await advertisementApi.approveAdvertisement(id);
      toast.success('Advertisement approved successfully');
      await fetchAds();
      await fetchStats();
    } catch (error) {
      console.error('Failed to approve ad:', error);
      toast.error(error.message || 'Failed to approve advertisement');
    }
  };

  const rejectAd = async (id, reason) => {
    try {
      await advertisementApi.rejectAdvertisement(id, reason);
      toast.success('Advertisement rejected');
      await fetchAds();
      await fetchStats();
      setRejectAdId(null);
    } catch (error) {
      console.error('Failed to reject ad:', error);
      toast.error(error.message || 'Failed to reject advertisement');
    }
  };

  const pauseAd = async (id) => {
    try {
      await advertisementApi.pauseAdvertisement(id);
      toast.success('Advertisement paused');
      await fetchAds();
      await fetchStats();
    } catch (error) {
      console.error('Failed to pause ad:', error);
      toast.error(error.message || 'Failed to pause advertisement');
    }
  };

  const resumeAd = async (id) => {
    try {
      await advertisementApi.resumeAdvertisement(id);
      toast.success('Advertisement resumed');
      await fetchAds();
      await fetchStats();
    } catch (error) {
      console.error('Failed to resume ad:', error);
      toast.error(error.message || 'Failed to resume advertisement');
    }
  };

  const filteredAds = ads.filter(ad => {
    if (activeTab === 'active') return ad.status === 'active';
    if (activeTab === 'pending') return ad.status === 'pending_approval';
    if (activeTab === 'paused') return ad.status === 'paused';
    if (activeTab === 'expired') return ad.status === 'expired' || ad.status === 'rejected';
    return true;
  });

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
                  filteredAds.map(ad => (
                    <AdCard
                      key={ad.id || ad._id}
                      ad={{
                        ...ad,
                        id: ad.id || ad._id,
                      }}
                      onEdit={(ad) => { 
                        const formattedAd = advertisementApi.formatAdForForm(ad);
                        setEditingAd(formattedAd); 
                        setShowCreateDialog(true); 
                      }}
                      onDelete={softDeleteAd}
                      onApprove={approveAd}
                      onReject={(id) => setRejectAdId(id)}
                      onPause={pauseAd}
                      onResume={resumeAd}
                    />
                  ))
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