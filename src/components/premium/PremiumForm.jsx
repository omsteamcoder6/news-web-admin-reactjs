'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/textarea';
import { X } from 'lucide-react';

export default function PremiumForm({ initialData = null, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    price: initialData?.price || '',
    period: initialData?.period || 'per month',
    features: initialData?.features?.join('\n') || '',
    isLimitedOffer: initialData?.isLimitedOffer || false,
    isUnlimited: initialData?.isUnlimited || (initialData?.period === 'per year'), // Yearly plans default to unlimited
    magazineLimit: initialData?.magazineLimit || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const featuresArray = formData.features.split('\n').filter(f => f.trim());
    
    onSubmit({
      id: initialData?.id || Date.now(),
      name: formData.name,
      price: formData.price,
      period: formData.period,
      features: featuresArray,
      subscribers: 0,
      isLimitedOffer: formData.isLimitedOffer,
      isUnlimited: formData.isUnlimited,
      magazineLimit: formData.isUnlimited ? null : (formData.isLimitedOffer ? parseInt(formData.magazineLimit) : null),
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Auto-set unlimited for yearly plans
  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setFormData(prev => ({
      ...prev,
      period: newPeriod,
      isUnlimited: newPeriod === 'per year' || prev.isUnlimited
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-900">
            {initialData ? 'Edit Plan' : 'Create New Plan'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Premium"
            />
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="e.g., ₹399"
            />
          </div>

          <div>
            <Label htmlFor="period">Billing Period</Label>
            <select
              id="period"
              name="period"
              value={formData.period}
              onChange={handlePeriodChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="per month">per month</option>
              <option value="per year">per year</option>
              <option value="per week">per week</option>
            </select>
          </div>

          <div>
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea
              id="features"
              name="features"
              value={formData.features}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Unlimited articles&#10;Ad-free reading&#10;Offline access"
            />
          </div>

          {/* Unlimited Plan Toggle */}
          <div className="border-t border-slate-200 pt-4">
            <label className="flex items-center justify-between gap-2 cursor-pointer">
              <div>
                <span className="text-sm font-medium text-slate-700">Unlimited Plan</span>
                <p className="text-xs text-slate-500">No magazine limit for subscribers</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isUnlimited: !prev.isUnlimited }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                  formData.isUnlimited ? 'bg-orange-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isUnlimited ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Limited Offer Section - Only show if NOT unlimited */}
          {!formData.isUnlimited && (
            <>
              <div className="border-t border-slate-200 pt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isLimitedOffer"
                    checked={formData.isLimitedOffer}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">This is a Limited Offer</span>
                </label>
              </div>

              {formData.isLimitedOffer && (
                <div>
                  <Label htmlFor="magazineLimit">Magazines per month limit</Label>
                  <Input
                    id="magazineLimit"
                    name="magazineLimit"
                    type="number"
                    value={formData.magazineLimit}
                    onChange={handleChange}
                    placeholder="e.g., 20"
                  />
                  <p className="text-xs text-slate-500 mt-1">User can access only this many magazines per month</p>
                </div>
              )}
            </>
          )}

          {/* Show unlimited info message */}
          {formData.isUnlimited && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-700">✓ This plan offers unlimited access with no magazine limits</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600">
              {initialData ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}