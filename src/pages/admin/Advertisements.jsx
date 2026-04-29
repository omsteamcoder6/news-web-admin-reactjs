// Advertisements.jsx (Page Component)
import { useState, useEffect } from 'react';
import { MainLayout } from "../../layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Plus } from 'lucide-react';
import { AdCard } from '../../components/advertisements/AdCard';
import { AdvertisementForm } from '../../components/advertisements/AdvertisementForm';
import { StatsCards } from '../../components/advertisements/StatsCards';
import { RejectDialog } from '../../components/advertisements/RejectDialog';

// Mock data (replace with real API)
const mockAds = [
  {
    id: '1',
    title: 'Tech Company Q2 Campaign',
    description: 'Promote new SaaS product',
    type: 'banner',
    imageUrl: 'https://placehold.co/600x400',
    linkUrl: 'https://techcompany.com/campaign',
    placement: 'Header Banner',
    targetPages: ['/home', '/products'],
    targetDevices: ['desktop', 'tablet'],
    targetAudiences: ['tech_enthusiasts', 'business_owners'],
    startDate: '2024-04-01',
    endDate: '2024-04-30',
    status: 'active',
    pricingModel: 'cpc',
    budget: 50000,
    costPerUnit: 250,
    spent: 12500,
    impressions: 15000,
    clicks: 50,
    createdAt: '2024-03-25',
    isSoftDeleted: false,
  },
  {
    id: '2',
    title: 'Car Brand Summer Event',
    description: 'Test drive promotion',
    type: 'video',
    imageUrl: 'https://placehold.co/600x400',
    linkUrl: 'https://carbrand.com/summer',
    placement: 'Sidebar',
    targetPages: ['all'],
    targetDevices: ['desktop', 'mobile', 'tablet'],
    targetAudiences: ['auto_enthusiasts'],
    startDate: '2024-04-05',
    endDate: '2024-04-15',
    status: 'active',
    pricingModel: 'cpm',
    budget: 100000,
    costPerUnit: 500,
    spent: 45000,
    impressions: 90000,
    clicks: 180,
    createdAt: '2024-03-28',
    isSoftDeleted: false,
  },
  {
    id: '3',
    title: 'Real Estate Promo',
    description: 'Luxury apartments',
    type: 'native',
    imageUrl: 'https://placehold.co/600x400',
    linkUrl: 'https://realestate.com/listings',
    placement: 'In-article',
    targetPages: ['/blog', '/news'],
    targetDevices: ['mobile'],
    targetAudiences: ['home_buyers'],
    startDate: '2024-04-10',
    endDate: '2024-04-20',
    status: 'pending_approval',
    pricingModel: 'fixed',
    budget: 25000,
    costPerUnit: 25000,
    spent: 0,
    impressions: 0,
    clicks: 0,
    createdAt: '2024-04-09',
    isSoftDeleted: false,
  },
];

export default function AdvertisementsPage() {
  const [ads, setAds] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [rejectAdId, setRejectAdId] = useState(null);

  useEffect(() => {
    setAds(mockAds.filter(ad => !ad.isSoftDeleted));
  }, []);

  const checkAdLifecycle = (ad) => {
    const today = new Date().toISOString().split('T')[0];
    if (ad.endDate < today && ad.status === 'active') {
      return { ...ad, status: 'expired' };
    }
    if (ad.spent >= ad.budget && ad.status === 'active') {
      return { ...ad, status: 'paused' };
    }
    return ad;
  };

  const saveAd = (formData) => {
    if (editingAd) {
      setAds(prev => prev.map(ad => 
        ad.id === editingAd.id ? { ...ad, ...formData, status: 'pending_approval' } : ad
      ));
    } else {
      const newAd = {
        id: Date.now().toString(),
        ...formData,
        status: 'pending_approval',
        spent: 0,
        impressions: 0,
        clicks: 0,
        createdAt: new Date().toISOString().split('T')[0],
        isSoftDeleted: false,
      };
      setAds(prev => [...prev, newAd]);
    }
    setShowCreateDialog(false);
    setEditingAd(null);
  };

  const softDeleteAd = (id) => {
    setAds(prev => prev.map(ad => ad.id === id ? { ...ad, isSoftDeleted: true } : ad));
  };

  const approveAd = (id) => {
    setAds(prev => prev.map(ad => {
      if (ad.id === id) {
        const updated = { ...ad, status: 'active' };
        return checkAdLifecycle(updated);
      }
      return ad;
    }));
  };

  const rejectAd = (id, reason) => {
    setAds(prev => prev.map(ad => 
      ad.id === id ? { ...ad, status: 'rejected', rejectionReason: reason } : ad
    ));
    setRejectAdId(null);
  };

  const pauseAd = (id) => {
    setAds(prev => prev.map(ad => ad.id === id ? { ...ad, status: 'paused' } : ad));
  };

  const filteredAds = ads.filter(ad => {
    if (activeTab === 'active') return ad.status === 'active';
    if (activeTab === 'pending') return ad.status === 'pending_approval';
    if (activeTab === 'paused') return ad.status === 'paused';
    if (activeTab === 'expired') return ad.status === 'expired' || ad.status === 'rejected';
    return true;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Advertisement Management</h1>
            <p className="text-slate-600 mt-1">Full lifecycle control: creation, targeting, performance, monetization & safety</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 gap-2" onClick={() => { setEditingAd(null); setShowCreateDialog(true); }}>
            <Plus className="w-4 h-4" />
            New Advertisement
          </Button>
        </div>

        {/* Stats Summary */}
        <StatsCards ads={ads} />

        {/* Ads List with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Advertisement Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                <TabsTrigger value="paused">Paused</TabsTrigger>
                <TabsTrigger value="expired">Expired/Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {filteredAds.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <p>No advertisements in this category</p>
                  </div>
                ) : (
                  filteredAds.map(ad => (
                    <AdCard
                      key={ad.id}
                      ad={ad}
                      onEdit={(ad) => { setEditingAd(ad); setShowCreateDialog(true); }}
                      onDelete={softDeleteAd}
                      onApprove={approveAd}
                      onReject={(id) => setRejectAdId(id)}
                      onPause={pauseAd}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <AdvertisementForm 
          isOpen={showCreateDialog}
          onClose={() => {
            setShowCreateDialog(false);
            setEditingAd(null);
          }}
          onSubmit={saveAd}
          editingAd={editingAd}
        />

        {/* Reject Dialog */}
        <RejectDialog 
          isOpen={rejectAdId !== null}
          onClose={() => setRejectAdId(null)}
          onConfirm={(reason) => rejectAd(rejectAdId, reason)}
        />
      </div>
    </MainLayout>
  );
}