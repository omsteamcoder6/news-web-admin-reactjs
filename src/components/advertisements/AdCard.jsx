// AdCard.jsx
'use client';

import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { 
  Edit2, 
  Trash2, 
  Eye, 
  MousePointerClick, 
  IndianRupee, 
  Target,
  AlertCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react';

export function AdCard({ ad, onEdit, onDelete, onApprove, onReject, onPause, onResume }) {
  // Prices are stored in paise/cents, convert to rupees for display
  const budgetInRupees = (ad.budget || 0) / 100;
  const spentInRupees = (ad.spent || 0) / 100;
  const costPerUnitInRupees = (ad.costPerUnit || 0) / 100;
  
  const spentPercent = (ad.spent / ad.budget) * 100;
  const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;
  const isBudgetExhausted = ad.spent >= ad.budget;

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    pending_approval: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    paused: 'bg-orange-100 text-orange-800',
    expired: 'bg-red-100 text-red-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const getPricingLabel = () => {
    switch (ad.pricingModel) {
      case 'cpc':
        return `CPC @ ₹${costPerUnitInRupees.toFixed(2)}`;
      case 'cpm':
        return `CPM @ ₹${costPerUnitInRupees.toFixed(2)}`;
      case 'fixed':
        return `Fixed @ ₹${costPerUnitInRupees.toFixed(2)}`;
      default:
        return `₹${costPerUnitInRupees.toFixed(2)}`;
    }
  };

  // Format duration display
  const getDurationDisplay = () => {
    if (ad.isCustomEndDate && ad.endDate) {
      return `Until ${new Date(ad.endDate).toLocaleDateString()}`;
    }
    if (ad.durationValue && ad.durationUnit && ad.durationUnit !== 'custom') {
      const unitText = {
        'hours': ad.durationValue === 1 ? 'hour' : 'hours',
        'days': ad.durationValue === 1 ? 'day' : 'days',
        'weeks': ad.durationValue === 1 ? 'week' : 'weeks',
        'months': ad.durationValue === 1 ? 'month' : 'months',
        'years': ad.durationValue === 1 ? 'year' : 'years'
      };
      return `${ad.durationValue} ${unitText[ad.durationUnit] || ad.durationUnit}`;
    }
    return null;
  };

  // ✅ FIXED: Handle delete - passes only the ID string
  const handleDelete = () => {
    const adId = ad._id || ad.id;
    if (!adId) {
      console.error('Cannot delete: No ad ID found', ad);
      alert('Error: Cannot find advertisement ID');
      return;
    }
    
    if (onDelete) {
      onDelete(adId);  // ✅ Pass only the ID string, not the whole object
    } else {
      console.error('onDelete prop is missing');
    }
  };

  // Handle resume
  const handleResume = () => {
    const adId = ad._id || ad.id;
    if (adId && onResume) {
      onResume(adId);
    }
  };

  // Handle pause
  const handlePause = () => {
    const adId = ad._id || ad.id;
    if (adId && onPause) {
      onPause(adId);
    }
  };

  // Handle approve
  const handleApprove = () => {
    const adId = ad._id || ad.id;
    if (adId && onApprove) {
      onApprove(adId);
    }
  };

  // Handle reject
  const handleReject = () => {
    const adId = ad._id || ad.id;
    if (adId && onReject) {
      onReject(adId);
    }
  };

  // Handle edit
  const handleEdit = () => {
    if (onEdit) {
      onEdit(ad);
    }
  };

  return (
    <div className={`p-4 border rounded-lg transition ${isBudgetExhausted && ad.status === 'active' ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:bg-slate-50'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-semibold text-slate-900">{ad.title}</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[ad.status]}`}>
              {ad.status.replace('_', ' ').toUpperCase()}
            </span>
            {isBudgetExhausted && ad.status === 'active' && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Budget Exhausted
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mb-2">{ad.description}</p>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-slate-500">Impressions</p>
                <p className="font-semibold">{ad.impressions?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs text-slate-500">Clicks</p>
                <p className="font-semibold">{ad.clicks?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-xs text-slate-500">CTR</p>
                <p className="font-semibold">{ctr.toFixed(2)}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-xs text-slate-500">Spent / Budget</p>
                <p className="font-semibold">₹{spentInRupees.toFixed(2)} / ₹{budgetInRupees.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Budget Usage</span>
              <span>{spentPercent.toFixed(1)}%</span>
            </div>
            <Progress value={spentPercent} className="h-2" />
          </div>

          {/* Targeting Summary */}
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="px-2 py-1 bg-slate-100 rounded">📍 {ad.placementCategory || ad.placement}</span>
            <span className="px-2 py-1 bg-slate-100 rounded">📱 {ad.targetDevices?.join(', ') || 'all'}</span>
            <span className="px-2 py-1 bg-slate-100 rounded">🎯 {ad.targetAudiences?.join(', ') || 'general'}</span>
            <span className="px-2 py-1 bg-slate-100 rounded">💰 {getPricingLabel()}</span>
          </div>

          {/* Duration Display */}
          {getDurationDisplay() && (
            <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-2">
              <span className="px-2 py-1 bg-slate-100 rounded flex items-center gap-1">
                ⏱️ Duration: {getDurationDisplay()}
              </span>
            </div>
          )}

          {/* Ad Size Display */}
          {ad.adSize && ad.adSize.width && ad.adSize.height && (
            <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-2">
              <span className="px-2 py-1 bg-slate-100 rounded flex items-center gap-1">
                📐 {ad.adSize.width}×{ad.adSize.height}px
                {ad.adSize.label && ` (${ad.adSize.label})`}
              </span>
              {ad.deviceCategory && (
                <span className="px-2 py-1 bg-slate-100 rounded flex items-center gap-1">
                  {ad.deviceCategory === 'desktop' ? '🖥️ Desktop' : ad.deviceCategory === 'mobile' ? '📱 Mobile' : '🔄 All Devices'}
                </span>
              )}
              {ad.adSize.isResponsive && (
                <span className="px-2 py-1 bg-slate-100 rounded">🔄 Responsive</span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 ml-4 flex-wrap">
          {ad.status === 'pending_approval' && onApprove && onReject && (
            <>
              <Button size="sm" variant="outline" className="text-green-600" onClick={handleApprove}>
                Approve
              </Button>
              <Button size="sm" variant="outline" className="text-red-600" onClick={handleReject}>
                Reject
              </Button>
            </>
          )}
          
          {ad.status === 'active' && onPause && (
            <Button size="sm" variant="outline" onClick={handlePause} className="gap-1">
              <PauseCircle className="w-3 h-3" /> Pause
            </Button>
          )}
          
          {ad.status === 'paused' && onResume && (
            <Button size="sm" variant="outline" onClick={handleResume} className="gap-1 text-green-600 border-green-600">
              <PlayCircle className="w-3 h-3" /> Resume
            </Button>
          )}
          
          <button className="p-2 hover:bg-slate-100 rounded transition" onClick={handleEdit}>
            <Edit2 className="w-4 h-4 text-slate-600" />
          </button>
          
          {/* ✅ FIXED: Delete button with proper handler - passes only ID */}
          <button 
            className="p-2 hover:bg-red-50 rounded transition" 
            onClick={handleDelete}
            aria-label="Delete advertisement"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}