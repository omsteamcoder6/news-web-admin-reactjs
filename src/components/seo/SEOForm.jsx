import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export interface SEOFormData {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
}

interface SEOFormProps {
  onSave?: (data: SEOFormData) => void;
  initialData?: SEOFormData;
}

export default function SEOForm({ onSave, initialData }: SEOFormProps) {
  const [formData, setFormData] = useState<SEOFormData>(initialData || {
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    canonicalUrl: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    console.log('Saving SEO settings:', formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Optimization Form</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">Meta Title</label>
          <Input 
            name="metaTitle"
            placeholder="Enter meta title (60 characters)" 
            value={formData.metaTitle}
            onChange={handleInputChange}
          />
          <p className="text-xs text-slate-500 mt-1">{formData.metaTitle.length} / 60 characters</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">Meta Description</label>
          <textarea 
            name="metaDescription"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
            rows={3} 
            placeholder="Enter meta description (160 characters)"
            value={formData.metaDescription}
            onChange={handleInputChange}
          />
          <p className="text-xs text-slate-500 mt-1">{formData.metaDescription.length} / 160 characters</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">Keywords</label>
          <Input 
            name="keywords"
            placeholder="Enter keywords separated by commas" 
            value={formData.keywords}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">Canonical URL</label>
          <Input 
            name="canonicalUrl"
            placeholder="https://example.com/article" 
            value={formData.canonicalUrl}
            onChange={handleInputChange}
          />
        </div>
        <Button 
          className="bg-orange-500 hover:bg-orange-600"
          onClick={handleSave}
        >
          Save SEO Settings
        </Button>
      </CardContent>
    </Card>
  );
}