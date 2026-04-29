import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { MainLayout } from "../../layout/MainLayout";
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search } from 'lucide-react';

export default function SEOPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    canonicalUrl: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    // Implement search logic here
    console.log('Searching for:', searchQuery);
  };

  const handleSave = () => {
    // Implement save logic here
    console.log('Saving SEO settings:', formData);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">SEO Management</h1>
          <p className="text-slate-600 mt-1">Optimize meta tags, keywords, and SEO settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Articles for SEO Optimization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search by title or URL..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                className="bg-orange-500 hover:bg-orange-600"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

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
      </div>
    </MainLayout>
  );
}