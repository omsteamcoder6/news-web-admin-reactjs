// StatsCards.jsx
'use client';

import { Card, CardContent } from '../ui/Card';
import { Eye, Shield, IndianRupee, Target } from 'lucide-react';

export function StatsCards({ ads }) {
  const activeAds = ads.filter(a => a.status === 'active').length;
  const pendingAds = ads.filter(a => a.status === 'pending_approval').length;
  const totalSpent = ads.reduce((sum, a) => sum + a.spent, 0) / 100;
  const avgCtr = (ads.reduce((sum, a) => sum + (a.impressions > 0 ? a.clicks / a.impressions : 0), 0) / Math.max(1, ads.length) * 100).toFixed(1);

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
              <p className="text-2xl font-bold">₹{totalSpent.toFixed(0)}</p>
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