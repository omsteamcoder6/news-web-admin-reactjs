// AdvertisementForm.jsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../ui/dialog';

export function AdvertisementForm({ isOpen, onClose, onSubmit, editingAd }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'banner',
        imageUrl: '',
        linkUrl: '',
        placement: '',
        targetPages: ['all'],
        targetDevices: ['desktop'],
        targetAudiences: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        pricingModel: 'cpc',
        budget: 0,
        costPerUnit: 0,
    });

    useEffect(() => {
        if (editingAd) {
            setFormData({
                title: editingAd.title || '',
                description: editingAd.description || '',
                type: editingAd.type || 'banner',
                imageUrl: editingAd.imageUrl || '',
                linkUrl: editingAd.linkUrl || '',
                placement: editingAd.placement || '',
                targetPages: editingAd.targetPages || ['all'],
                targetDevices: editingAd.targetDevices || ['desktop'],
                targetAudiences: editingAd.targetAudiences || [],
                startDate: editingAd.startDate || new Date().toISOString().split('T')[0],
                endDate: editingAd.endDate || '',
                pricingModel: editingAd.pricingModel || 'cpc',
                budget: editingAd.budget ? editingAd.budget / 100 : 0,
                costPerUnit: editingAd.costPerUnit ? editingAd.costPerUnit / 100 : 0,
            });
        } else {
            setFormData({
                title: '',
                description: '',
                type: 'banner',
                imageUrl: '',
                linkUrl: '',
                placement: '',
                targetPages: ['all'],
                targetDevices: ['desktop'],
                targetAudiences: [],
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                pricingModel: 'cpc',
                budget: 0,
                costPerUnit: 0,
            });
        }
    }, [editingAd]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        const submitData = {
            ...formData,
            budget: Math.round(formData.budget * 100),
            costPerUnit: Math.round(formData.costPerUnit * 100),
        };
        onSubmit(submitData);
        onClose();
    };

    // Get label for cost per unit based on pricing model
    const getCostPerUnitLabel = () => {
        switch (formData.pricingModel) {
            case 'cpc':
                return 'Cost Per Click (₹)';
            case 'cpm':
                return 'Cost Per 1,000 Impressions (₹)';
            case 'fixed':
                return 'Campaign Cost (₹)';
            default:
                return 'Cost per unit (₹)';
        }
    };

    // Get placeholder for cost per unit based on pricing model
    const getCostPerUnitPlaceholder = () => {
        switch (formData.pricingModel) {
            case 'cpc':
                return '0.50';
            case 'cpm':
                return '5.00';
            case 'fixed':
                return '500.00';
            default:
                return '0.00';
        }
    };

    // Get budget label based on pricing model
    const getBudgetLabel = () => {
        switch (formData.pricingModel) {
            case 'cpc':
                return 'Total Budget (Based on Clicks) (₹)';
            case 'cpm':
                return 'Total Budget (Based on Impressions) (₹)';
            case 'fixed':
                return 'Campaign Budget (₹)';
            default:
                return 'Budget (₹)';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}</DialogTitle>
                    <DialogDescription>
                        Set up targeting, budget, and creative details. All new ads require approval.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-4 space-y-4">
                    {/* Title and Type Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="Summer Sale Campaign"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Ad Type *</Label>
                            <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                                <SelectTrigger id="type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="banner">Banner</SelectItem>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="popup">Popup</SelectItem>
                                    <SelectItem value="native">Native</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe your campaign"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Image URL and Link */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Image URL</Label>
                            <Input
                                id="imageUrl"
                                placeholder="https://example.com/image.jpg"
                                value={formData.imageUrl}
                                onChange={(e) => handleChange('imageUrl', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkUrl">Destination Link</Label>
                            <Input
                                id="linkUrl"
                                placeholder="https://example.com/landing-page"
                                value={formData.linkUrl}
                                onChange={(e) => handleChange('linkUrl', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Placement and Devices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="placement">Placement</Label>
                            <Input
                                id="placement"
                                placeholder="Header Banner, Sidebar, etc"
                                value={formData.placement}
                                onChange={(e) => handleChange('placement', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="devices">Target Devices</Label>
                            <Select
                                value={formData.targetDevices.join(',')}
                                onValueChange={(v) => handleChange('targetDevices', v.split(','))}
                            >
                                <SelectTrigger id="devices">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desktop">Desktop Only</SelectItem>
                                    <SelectItem value="desktop,mobile">Desktop + Mobile</SelectItem>
                                    <SelectItem value="mobile">Mobile Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => handleChange('startDate', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => handleChange('endDate', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Pricing and Budget */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pricingModel">Pricing Model *</Label>
                                <Select value={formData.pricingModel} onValueChange={(v) => {
                                    handleChange('pricingModel', v);
                                    // Reset cost per unit when changing pricing model to avoid confusion
                                    handleChange('costPerUnit', 0);
                                }}>
                                    <SelectTrigger id="pricingModel" className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cpc">
                                            Cost Per Click (CPC)
                                        </SelectItem>
                                        <SelectItem value="cpm">
                                            Cost Per Mille (CPM)
                                        </SelectItem>
                                        <SelectItem value="fixed">
                                            Fixed Campaign
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {/* Helper text below select */}
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.pricingModel === 'cpc' && 'Pay for each click on your ad'}
                                    {formData.pricingModel === 'cpm' && 'Pay per 1,000 impressions'}
                                    {formData.pricingModel === 'fixed' && 'One-time payment for the campaign'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="costPerUnit">{getCostPerUnitLabel()} *</Label>
                                <Input
                                    id="costPerUnit"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder={getCostPerUnitPlaceholder()}
                                    value={formData.costPerUnit}
                                    onChange={(e) => handleChange('costPerUnit', parseFloat(e.target.value) || 0)}
                                />
                                {formData.pricingModel === 'cpm' && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Example: ₹5.00 CPM = ₹5.00 per 1,000 impressions
                                    </p>
                                )}
                                {formData.pricingModel === 'cpc' && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Example: ₹0.50 CPC = ₹0.50 per click
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="budget">{getBudgetLabel()} *</Label>
                                <Input
                                    id="budget"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="Enter total budget"
                                    value={formData.budget}
                                    onChange={(e) => handleChange('budget', parseFloat(e.target.value) || 0)}
                                />
                                {formData.budget > 0 && formData.costPerUnit > 0 && (
                                    <p className="text-xs text-green-600 mt-1">
                                        {formData.pricingModel === 'cpc' && `Estimated clicks: ${Math.floor(formData.budget / formData.costPerUnit)}`}
                                        {formData.pricingModel === 'cpm' && `Estimated impressions: ${Math.floor((formData.budget / formData.costPerUnit) * 1000)}`}
                                        {formData.pricingModel === 'fixed' && `Fixed campaign rate`}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Summary Card */}
                        {(formData.budget > 0 || formData.costPerUnit > 0) && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Pricing Summary</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Pricing Model:</span>
                                        <span className="font-medium">
                                            {formData.pricingModel === 'cpc' && 'Cost Per Click (CPC)'}
                                            {formData.pricingModel === 'cpm' && 'Cost Per Mille (CPM)'}
                                            {formData.pricingModel === 'fixed' && 'Fixed Campaign'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            {formData.pricingModel === 'cpc' && 'Cost Per Click:'}
                                            {formData.pricingModel === 'cpm' && 'Cost Per 1,000 Impressions:'}
                                            {formData.pricingModel === 'fixed' && 'Campaign Cost:'}
                                        </span>
                                        <span className="font-medium">₹{formData.costPerUnit.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Budget:</span>
                                        <span className="font-medium text-orange-600">₹{formData.budget.toFixed(2)}</span>
                                    </div>
                                    {formData.pricingModel !== 'fixed' && formData.costPerUnit > 0 && (
                                        <div className="flex justify-between pt-2 border-t border-gray-200">
                                            <span className="text-gray-600">
                                                {formData.pricingModel === 'cpc' ? 'Estimated Total Clicks:' : 'Estimated Total Impressions:'}
                                            </span>
                                            <span className="font-medium">
                                                {formData.pricingModel === 'cpc'
                                                    ? Math.floor(formData.budget / formData.costPerUnit).toLocaleString()
                                                    : Math.floor((formData.budget / formData.costPerUnit) * 1000).toLocaleString()
                                                }
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-orange-500 hover:bg-orange-600"
                        disabled={!formData.title || formData.budget <= 0 || (formData.pricingModel !== 'fixed' && formData.costPerUnit <= 0)}
                    >
                        {editingAd ? 'Update & Submit for Approval' : 'Create & Submit for Approval'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}