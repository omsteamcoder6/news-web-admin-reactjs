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
  AlertCircle 
} from 'lucide-react';

export function AdCard({ ad, onEdit, onDelete, onApprove, onReject, onPause }) {
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

  return (
    <div className={`p-4 border rounded-lg transition ${isBudgetExhausted && ad.status === 'active' ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:bg-slate-50'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
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
                <p className="font-semibold">{ad.impressions.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs text-slate-500">Clicks</p>
                <p className="font-semibold">{ad.clicks.toLocaleString()}</p>
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
                <p className="font-semibold">₹{(ad.spent / 100).toFixed(2)} / ₹{(ad.budget / 100).toFixed(2)}</p>
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
            <span className="px-2 py-1 bg-slate-100 rounded">📍 {ad.placement}</span>
            <span className="px-2 py-1 bg-slate-100 rounded">📱 {ad.targetDevices.join(', ')}</span>
            <span className="px-2 py-1 bg-slate-100 rounded">🎯 {ad.targetAudiences.join(', ')}</span>
            <span className="px-2 py-1 bg-slate-100 rounded">💰 {ad.pricingModel.toUpperCase()} @ ₹{(ad.costPerUnit / 100).toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 ml-4">
          {ad.status === 'pending_approval' && onApprove && onReject && (
            <>
              <Button size="sm" variant="outline" className="text-green-600" onClick={() => onApprove(ad.id)}>
                Approve
              </Button>
              <Button size="sm" variant="outline" className="text-red-600" onClick={() => onReject(ad.id)}>
                Reject
              </Button>
            </>
          )}
          {ad.status === 'active' && onPause && (
            <Button size="sm" variant="outline" onClick={() => onPause(ad.id)}>
              Pause
            </Button>
          )}
          {ad.status === 'paused' && onApprove && (
            <Button size="sm" variant="outline" onClick={() => onApprove(ad.id)}>
              Resume
            </Button>
          )}
          <button className="p-2 hover:bg-slate-100 rounded transition" onClick={() => onEdit(ad)}>
            <Edit2 className="w-4 h-4 text-slate-600" />
          </button>
          <button className="p-2 hover:bg-red-50 rounded transition" onClick={() => onDelete(ad.id)}>
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}