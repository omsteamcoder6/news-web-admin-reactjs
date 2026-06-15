// StatsCards.jsx (Updated with API integration)
'use client';

import { Card, CardContent } from '../ui/Card';
import { Eye, Shield, IndianRupee, Target, Loader2 } from 'lucide-react';

export function StatsCards({ ads = [], stats = null, loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-slate-200 rounded animate-pulse mt-2" />
                </div>
                <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ✅ FIX: Values are already in rupees from backend, NO division needed
  const activeAds = stats?.activeAds ?? ads.filter(a => a.status === 'active').length;
  const pendingAds = stats?.pendingApproval ?? ads.filter(a => a.status === 'pending_approval').length;
  const totalSpent = stats?.totalSpent !== undefined 
    ? stats.totalSpent
    : ads.reduce((sum, a) => sum + (a.spent || 0), 0);
  
  const avgCtr = stats?.avgCtr !== undefined 
    ? stats.avgCtr.toFixed(1)
    : (() => {
        const validAds = ads.filter(a => a.impressions > 0);
        if (validAds.length === 0) return '0.0';
        const totalCtr = validAds.reduce((sum, a) => sum + (a.clicks / a.impressions), 0);
        return ((totalCtr / validAds.length) * 100).toFixed(1);
      })();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Ads</p>
              <p className="text-2xl font-bold">{activeAds}</p>
            </div>
            <Eye className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pending Approval</p>
              <p className="text-2xl font-bold">{pendingAds}</p>
            </div>
            <Shield className="w-8 h-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Spend (MTD)</p>
              <p className="text-2xl font-bold">₹{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            </div>
            <IndianRupee className="w-8 h-8 text-amber-500" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Avg. CTR</p>
              <p className="text-2xl font-bold">{avgCtr}%</p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}