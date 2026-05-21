import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { MainLayout } from "../../layout/MainLayout";
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, Upload, Eye, Globe, Share2, Settings, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function SEOPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // UI state for collapsible sections - all expanded by default
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    social: true,
    advanced: true
  });

  const [formData, setFormData] = useState({
    // Basic SEO
    focusKeyword: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    canonicalUrl: '',
    
    // Social Media SEO
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogImageFile: null,
    twitterCardType: 'summary_large_image',
    
    // Advanced SEO
    schemaType: 'Article',
    noIndex: false,
    noFollow: false,
    targetKeywords: '',
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setSaved(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        ogImage: imageUrl,
        ogImageFile: file
      }));
    }
  };

  const generateSlugFromTitle = () => {
    if (formData.metaTitle) {
      const slug = formData.metaTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      console.log('Searching for:', searchQuery);
      setTimeout(() => {
        const mockData = {
          focusKeyword: 'on page seo',
          metaTitle: 'On Page SEO Guide',
          metaDescription: 'Complete guide for on-page SEO',
          slug: 'on-page-seo-guide',
        };
        setFormData(prev => ({ ...prev, ...mockData }));
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Search failed:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      console.log('Saving SEO settings:', formData);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSeoScore = () => {
    let score = 0;
    let total = 8;
    
    if (formData.focusKeyword) score++;
    if (formData.metaTitle && formData.metaTitle.length >= 50 && formData.metaTitle.length <= 60) score++;
    if (formData.metaDescription && formData.metaDescription.length >= 120 && formData.metaDescription.length <= 160) score++;
    if (formData.slug && formData.slug.includes('-')) score++;
    if (formData.ogImage) score++;
    if (formData.schemaType !== 'None') score++;
    if (formData.targetKeywords.split(',').filter(k => k.trim()).length >= 3) score++;
    if (formData.canonicalUrl) score++;
    
    return Math.round((score / total) * 100);
  };

  const seoScore = calculateSeoScore();

  // Section header component
  const SectionHeader = ({ title, icon: Icon, section, color }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-4 h-4 text-slate-500" />
      ) : (
        <ChevronDown className="w-4 h-4 text-slate-500" />
      )}
    </button>
  );

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[90%] lg:max-w-[90%] mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">SEO Management</h1>
          <p className="text-slate-600 mt-1">Optimize meta tags, keywords, and SEO settings</p>
        </div>

        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle>Search Content for SEO Optimization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search by title, URL, or ID..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                className="bg-orange-500 hover:bg-orange-600"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SEO Form - Single Form with Collapsible Sections */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-3">
              <CardTitle>SEO Optimization Form</CardTitle>
              {/* SEO Score Badge */}
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                <AlertCircle className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium">SEO Score: {seoScore}/100</span>
                <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${seoScore}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Fill out the sections below to optimize your content for search engines and social media.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* ========== SECTION 1: BASIC SEO ========== */}
            <div className="space-y-4">
              <SectionHeader 
                title="Basic SEO" 
                icon={Globe} 
                section="basic" 
                color="text-blue-600"
              />
              
              {expandedSections.basic && (
                <div className="space-y-4 pl-2 pt-2">
                  {/* Focus Keyword */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Focus Keyword <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      name="focusKeyword"
                      placeholder="Enter primary keyword (e.g., on page seo guide)" 
                      value={formData.focusKeyword}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Use this keyword in title, first 100 words, and headings
                    </p>
                  </div>

                  {/* URL Slug */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      URL Slug <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input 
                          name="slug"
                          placeholder="url-friendly-slug" 
                          value={formData.slug}
                          onChange={handleInputChange}
                        />
                      </div>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={generateSlugFromTitle}
                        className="text-sm"
                      >
                        Auto-generate
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      yoursite.com/blog/{formData.slug || 'your-slug'}
                    </p>
                  </div>

                  {/* Meta Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Meta Title <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      name="metaTitle"
                      placeholder="Enter meta title (50-60 characters)" 
                      value={formData.metaTitle}
                      onChange={handleInputChange}
                    />
                    <p className={`text-xs mt-1 ${
                      formData.metaTitle?.length >= 50 && formData.metaTitle?.length <= 60 
                        ? 'text-green-600' 
                        : 'text-slate-500'
                    }`}>
                      {formData.metaTitle?.length || 0} / 60 characters
                      {formData.metaTitle?.length < 50 && ' (Aim for 50-60 characters)'}
                    </p>
                  </div>

                  {/* Meta Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Meta Description <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      name="metaDescription"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
                      rows={3} 
                      placeholder="Enter meta description (120-160 characters)"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                    />
                    <p className={`text-xs mt-1 ${
                      formData.metaDescription?.length >= 120 && formData.metaDescription?.length <= 160
                        ? 'text-green-600'
                        : 'text-slate-500'
                    }`}>
                      {formData.metaDescription?.length || 0} / 160 characters
                    </p>
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Target Keywords
                    </label>
                    <Input 
                      name="targetKeywords"
                      placeholder="seo, on page optimization, meta tags (comma separated)" 
                      value={formData.targetKeywords}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Add 3-5 related keywords
                    </p>
                  </div>

                  {/* Google Search Preview */}
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="block text-sm font-medium text-slate-900 mb-3">
                      <Eye className="w-4 h-4 inline mr-2" />
                      Google Search Preview
                    </label>
                    <div className="space-y-1">
                      <div className="text-sm text-green-700">
                        yoursite.com/blog/{formData.slug || 'example-slug'}
                      </div>
                      <div className="text-lg text-blue-800 font-medium hover:underline cursor-pointer">
                        {formData.metaTitle || 'Your Meta Title Will Appear Here'}
                      </div>
                      <div className="text-sm text-slate-600">
                        {formData.metaDescription || 'Your meta description will appear here...'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ========== SECTION 2: SOCIAL MEDIA ========== */}
            <div className="space-y-4">
              <SectionHeader 
                title="Social Media SEO" 
                icon={Share2} 
                section="social" 
                color="text-blue-500"
              />
              
              {expandedSections.social && (
                <div className="space-y-4 pl-2 pt-2">
                  {/* OG Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Social Media Title
                    </label>
                    <Input 
                      name="ogTitle"
                      placeholder="Title for Facebook, LinkedIn, Twitter (leave empty to use meta title)" 
                      value={formData.ogTitle}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Recommended: 55-60 characters
                    </p>
                  </div>

                  {/* OG Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Social Media Description
                    </label>
                    <textarea 
                      name="ogDescription"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
                      rows={2}
                      placeholder="Description for social shares (150-200 characters)"
                      value={formData.ogDescription}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* OG Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Open Graph Image (Social Share Image)
                    </label>
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                      {formData.ogImage ? (
                        <div className="space-y-3">
                          <img 
                            src={formData.ogImage} 
                            alt="OG Preview" 
                            className="max-h-40 mx-auto rounded-lg border"
                          />
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => setFormData(prev => ({ ...prev, ogImage: '', ogImageFile: null }))}
                            className="text-red-600"
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                          <p className="text-sm text-slate-600 mb-2">
                            Upload image for social sharing
                          </p>
                          <p className="text-xs text-slate-500 mb-3">
                            Recommended size: 1200 x 630 pixels | Max 2MB
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="og-image-upload"
                          />
                          <label htmlFor="og-image-upload">
                            <Button type="button" variant="outline" as="span">
                              Choose Image
                            </Button>
                          </label>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Twitter Card Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Twitter Card Type
                    </label>
                    <select
                      name="twitterCardType"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={formData.twitterCardType}
                      onChange={handleInputChange}
                    >
                      <option value="summary">Summary (small image)</option>
                      <option value="summary_large_image">Summary Large Image (recommended)</option>
                      <option value="app">App Card</option>
                    </select>
                  </div>

                  {/* Social Preview */}
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="block text-sm font-medium text-slate-900 mb-3">
                      <Share2 className="w-4 h-4 inline mr-2" />
                      Social Media Preview
                    </label>
                    <div className="bg-white rounded-lg border overflow-hidden max-w-md">
                      {formData.ogImage && (
                        <img src={formData.ogImage} alt="Preview" className="w-full h-48 object-cover" />
                      )}
                      <div className="p-3">
                        <div className="text-xs text-slate-500 mb-1">
                          yourdomain.com
                        </div>
                        <div className="font-medium text-slate-900 text-sm mb-1">
                          {formData.ogTitle || formData.metaTitle || 'Social Title'}
                        </div>
                        <div className="text-xs text-slate-600">
                          {formData.ogDescription || formData.metaDescription || 'Social description...'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ========== SECTION 3: ADVANCED ========== */}
            <div className="space-y-4">
              <SectionHeader 
                title="Advanced SEO" 
                icon={Settings} 
                section="advanced" 
                color="text-purple-600"
              />
              
              {expandedSections.advanced && (
                <div className="space-y-4 pl-2 pt-2">
                  {/* Canonical URL */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Canonical URL
                    </label>
                    <Input 
                      name="canonicalUrl"
                      placeholder="https://example.com/canonical-url" 
                      value={formData.canonicalUrl}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Leave empty to use current URL as canonical
                    </p>
                  </div>

                  {/* Schema Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Structured Data Type (Schema)
                    </label>
                    <select
                      name="schemaType"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={formData.schemaType}
                      onChange={handleInputChange}
                    >
                      <option value="Article">Article (for blog posts)</option>
                      <option value="Product">Product (for products)</option>
                      <option value="FAQ">FAQ (for questions & answers)</option>
                      <option value="HowTo">HowTo (for tutorials)</option>
                      <option value="LocalBusiness">Local Business</option>
                      <option value="Review">Review</option>
                      <option value="None">None</option>
                    </select>
                  </div>

                  {/* No Index / No Follow */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Robots Meta Settings
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="noIndex"
                          checked={formData.noIndex}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-orange-500"
                        />
                        <span className="text-sm text-slate-700">No Index (Hide from search engines)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="noFollow"
                          checked={formData.noFollow}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-orange-500"
                        />
                        <span className="text-sm text-slate-700">No Follow (Don't follow links on this page)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t mt-4">
              <Button 
                className="bg-orange-500 hover:bg-orange-600"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save All SEO Settings'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setFormData({
                    focusKeyword: '',
                    slug: '',
                    metaTitle: '',
                    metaDescription: '',
                    keywords: '',
                    canonicalUrl: '',
                    ogTitle: '',
                    ogDescription: '',
                    ogImage: '',
                    ogImageFile: null,
                    twitterCardType: 'summary_large_image',
                    schemaType: 'Article',
                    noIndex: false,
                    noFollow: false,
                    targetKeywords: '',
                  });
                  setSaved(false);
                }}
              >
                Reset Form
              </Button>
            </div>

            {/* Success Message */}
            {saved && (
              <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
                <CheckCircle className="w-4 h-4" />
                All SEO settings saved successfully!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}