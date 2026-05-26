// SEO.jsx - Admin Panel SEO Management with Page Selection

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { MainLayout } from "../../layout/MainLayout";
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { 
  Search, Upload, Eye, Globe, Share2, Settings, AlertCircle, 
  CheckCircle, ChevronDown, ChevronUp, Home, Newspaper, 
  Package, Award, Calendar, Images, Phone, Info, Save, 
  RefreshCw, Trash2, FileText
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function SEOPage() {
  const { token, isAuthenticated, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [saveMessage, setSaveMessage] = useState('');
  const [fetchError, setFetchError] = useState(null);
  
  // Refs for smooth movement interactions
  const formHeaderRef = useRef(null);
  const focusInputRef = useRef(null);
  
  // UI state for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    social: true,
    advanced: true
  });

  // Page configuration
  const pages = [
    { id: 'home', name: 'Home', icon: Home, path: '/', color: 'text-blue-600' },
    { id: 'news', name: 'News', icon: Newspaper, path: '/news', color: 'text-green-600' },
    { id: 'products', name: 'Products', icon: Package, path: '/products', color: 'text-orange-600' },
    { id: 'awards', name: 'Awards', icon: Award, path: '/awards', color: 'text-yellow-600' },
    { id: 'events', name: 'Events', icon: Calendar, path: '/events', color: 'text-purple-600' },
    { id: 'gallery', name: 'Gallery', icon: Images, path: '/gallery', color: 'text-pink-600' },
    { id: 'contact', name: 'Contact Us', icon: Phone, path: '/contact', color: 'text-red-600' },
    { id: 'about', name: 'About Us', icon: Info, path: '/about', color: 'text-indigo-600' }
  ];

  // SEO Data for each page
  const [seoData, setSeoData] = useState({
    home: {
      focusKeyword: '',
      slug: '',
      metaTitle: 'Home | Your Company Name',
      metaDescription: 'Welcome to our company - Your trusted partner for quality products and services.',
      targetKeywords: 'home, company, services, products',
      canonicalUrl: 'https://yourdomain.com/',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogImageFile: null,
      twitterCardType: 'summary_large_image',
      noIndex: false,
      noFollow: false,
      lastUpdated: new Date().toISOString()
    },
    news: {
      focusKeyword: '',
      slug: 'news',
      metaTitle: 'News & Updates | Your Company Name',
      metaDescription: 'Stay updated with the latest news, announcements, and company updates.',
      targetKeywords: 'news, updates, announcements, company news',
      canonicalUrl: 'https://yourdomain.com/news',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogImageFile: null,
      twitterCardType: 'summary_large_image',
      noIndex: false,
      noFollow: false,
      lastUpdated: new Date().toISOString()
    },
    products: {
      focusKeyword: '',
      slug: 'products',
      metaTitle: 'Our Products | Your Company Name',
      metaDescription: 'Explore our wide range of quality products designed to meet your needs.',
      targetKeywords: 'products, catalog, items, collections',
      canonicalUrl: 'https://yourdomain.com/products',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogImageFile: null,
      twitterCardType: 'summary_large_image',
      noIndex: false,
      noFollow: false,
      lastUpdated: new Date().toISOString()
    },
    awards: {
      focusKeyword: '',
      slug: 'awards',
      metaTitle: 'Awards & Recognition | Your Company Name',
      metaDescription: 'Discover our awards, certifications, and industry recognition.',
      targetKeywords: 'awards, recognition, achievements, certifications',
      canonicalUrl: 'https://yourdomain.com/awards',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogImageFile: null,
      twitterCardType: 'summary_large_image',
      noIndex: false,
      noFollow: false,
      lastUpdated: new Date().toISOString()
    },
    events: {
      focusKeyword: '',
      slug: 'events',
      metaTitle: 'Upcoming Events | Your Company Name',
      metaDescription: 'Join our events, webinars, and conferences. Register today!',
      targetKeywords: 'events, webinars, conferences, workshops',
      canonicalUrl: 'https://yourdomain.com/events',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogImageFile: null,
      twitterCardType: 'summary_large_image',
      noIndex: false,
      noFollow: false,
      lastUpdated: new Date().toISOString()
    },
    gallery: {
      focusKeyword: '',
      slug: 'gallery',
      metaTitle: 'Photo Gallery | Your Company Name',
      metaDescription: 'Browse our photo gallery showcasing our work, events, and team.',
      targetKeywords: 'gallery, photos, images, portfolio',
      canonicalUrl: 'https://yourdomain.com/gallery',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogImageFile: null,
      twitterCardType: 'summary_large_image',
      noIndex: false,
      noFollow: false,
      lastUpdated: new Date().toISOString()
    },
    contact: {
      focusKeyword: '',
      slug: 'contact',
      metaTitle: 'Contact Us | Your Company Name',
      metaDescription: 'Get in touch with us. Find our address, phone number, and email.',
      targetKeywords: 'contact, address, phone, email, location',
      canonicalUrl: 'https://yourdomain.com/contact',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogImageFile: null,
      twitterCardType: 'summary_large_image',
      noIndex: false,
      noFollow: false,
      lastUpdated: new Date().toISOString()
    },
    about: {
      focusKeyword: '',
      slug: 'about',
      metaTitle: 'About Us | Your Company Name',
      metaDescription: 'Learn about our company history, mission, values, and team.',
      targetKeywords: 'about, company, mission, vision, team, history',
      canonicalUrl: 'https://yourdomain.com/about',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogImageFile: null,
      twitterCardType: 'summary_large_image',
      noIndex: false,
      noFollow: false,
      lastUpdated: new Date().toISOString()
    }
  });

  // Helper function to make authenticated API requests
  const apiRequest = async (endpoint, options = {}) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      logout();
      setSaveMessage('Session expired. Please login again.');
      setTimeout(() => setSaveMessage(''), 3000);
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
  };

  // Load saved data from API on mount
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchSEOData();
    }
  }, [isAuthenticated, token]);

  // Smooth layout interactions when changing tabs
  useEffect(() => {
    if (formHeaderRef.current) {
      formHeaderRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    
    // Tiny delay allows scroll to handle, then guides user context focus
    const focusTimeout = setTimeout(() => {
      if (focusInputRef.current) {
        focusInputRef.current.focus({ preventScroll: true });
      }
    }, 400);

    return () => clearTimeout(focusTimeout);
  }, [activePage]);

  const fetchSEOData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const response = await apiRequest('/admin/seo');
      if (response.data && response.data.seoData) {
        setSeoData(prev => ({
          ...prev,
          ...response.data.seoData
        }));
      }
    } catch (error) {
      console.error('Failed to fetch SEO data:', error);
      setFetchError('Failed to load SEO data from server. Using local backup.');
      
      const savedData = localStorage.getItem('admin_seo_data');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setSeoData(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error('Failed to load saved SEO data:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const currentPageData = seoData[activePage];
  const currentPage = pages.find(p => p.id === activePage);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSeoData(prev => ({
      ...prev,
      [activePage]: {
        ...prev[activePage],
        [name]: type === 'checkbox' ? checked : value,
        lastUpdated: new Date().toISOString()
      }
    }));
    setSaved(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSeoData(prev => ({
        ...prev,
        [activePage]: {
          ...prev[activePage],
          ogImage: imageUrl,
          ogImageFile: file,
          lastUpdated: new Date().toISOString()
        }
      }));
    }
  };

  const generateSlugFromTitle = () => {
    if (currentPageData.metaTitle) {
      const slug = currentPageData.metaTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      handleInputChange({ target: { name: 'slug', value: slug } });
    }
  };

  const calculateSeoScore = () => {
    let score = 0;
    let total = 7;
    
    if (currentPageData.focusKeyword) score++;
    if (currentPageData.metaTitle && currentPageData.metaTitle.length >= 30 && currentPageData.metaTitle.length <= 60) score++;
    if (currentPageData.metaDescription && currentPageData.metaDescription.length >= 120 && currentPageData.metaDescription.length <= 160) score++;
    if (currentPageData.slug && currentPageData.slug.includes('-')) score++;
    if (currentPageData.ogImage) score++;
    if (currentPageData.targetKeywords && currentPageData.targetKeywords.split(',').filter(k => k.trim()).length >= 3) score++;
    if (currentPageData.canonicalUrl) score++;
    
    return Math.round((score / total) * 100);
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      setSaveMessage('Please login to save SEO settings');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const pageData = { ...currentPageData };
      
      if (pageData.ogImageFile) {
        const formData = new FormData();
        formData.append('image', pageData.ogImageFile);
        formData.append('pageId', activePage);
        
        const uploadResponse = await fetch(`${API_BASE_URL}/admin/seo/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          pageData.ogImage = uploadResult.imageUrl;
        }
        delete pageData.ogImageFile;
      }
      
      await apiRequest('/admin/seo', {
        method: 'POST',
        body: JSON.stringify({
          pageId: activePage,
          seoData: pageData
        }),
      });
      
      localStorage.setItem('admin_seo_data', JSON.stringify(seoData));
      setSaved(true);
      setSaveMessage(`SEO settings for "${currentPage.name}" saved successfully!`);
      setTimeout(() => {
        setSaved(false);
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      console.error('Save failed:', error);
      setSaveMessage(error.message || 'Failed to save SEO settings');
      
      localStorage.setItem('admin_seo_data', JSON.stringify(seoData));
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllPages = async () => {
    if (!isAuthenticated) {
      setSaveMessage('Please login to save SEO settings');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/admin/seo/all', {
        method: 'POST',
        body: JSON.stringify({ seoData }),
      });
      
      localStorage.setItem('admin_seo_data', JSON.stringify(seoData));
      setSaved(true);
      setSaveMessage('All pages SEO settings saved successfully!');
      setTimeout(() => {
        setSaved(false);
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      console.error('Save failed:', error);
      setSaveMessage(error.message || 'Failed to save all pages');
      
      localStorage.setItem('admin_seo_data', JSON.stringify(seoData));
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleResetCurrentPage = () => {
    if (window.confirm(`Reset SEO settings for "${currentPage.name}" page?`)) {
      setSeoData(prev => ({
        ...prev,
        [activePage]: {
          focusKeyword: '',
          slug: currentPage.path.slice(1) || '',
          metaTitle: `${currentPage.name} | Your Company Name`,
          metaDescription: `Explore our ${currentPage.name.toLowerCase()} page for more information.`,
          targetKeywords: currentPage.name.toLowerCase(),
          canonicalUrl: `https://yourdomain.com${currentPage.path}`,
          ogTitle: '',
          ogDescription: '',
          ogImage: '',
          ogImageFile: null,
          twitterCardType: 'summary_large_image',
          noIndex: false,
          noFollow: false,
          lastUpdated: new Date().toISOString()
        }
      }));
      setSaveMessage(`Reset SEO settings for "${currentPage.name}"`);
      setTimeout(() => setSaveMessage(''), 2000);
    }
  };

  const seoScore = calculateSeoScore();

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

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Required</h2>
              <p className="text-slate-600 mb-4">Please login to access SEO management.</p>
              <Button onClick={() => window.location.href = '/admin/login'}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[95%] lg:max-w-[90%] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">SEO Management</h1>
            <p className="text-slate-600 mt-1">Optimize meta tags, keywords, and SEO settings for each page</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={fetchSEOData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={handleSaveAllPages}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save All Pages
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {fetchError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            <AlertCircle className="w-5 h-5 inline mr-2" />
            {fetchError}
          </div>
        )}

        {/* Page Tabs */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {pages.map((page) => {
                const Icon = page.icon;
                const hasUnsaved = seoData[page.id].lastUpdated && 
                  new Date().getTime() - new Date(seoData[page.id].lastUpdated).getTime() < 5000;
                return (
                  <button
                    key={page.id}
                    onClick={() => setActivePage(page.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                      ${activePage === page.id 
                        ? 'bg-orange-500 text-white shadow-md transform scale-[1.02]' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {page.name}
                    {hasUnsaved && activePage !== page.id && (
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Page Info Bar */}
        <div ref={formHeaderRef} className="bg-slate-50 rounded-lg p-4 border border-slate-200 scroll-mt-6">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {currentPage && (() => {
                const Icon = currentPage.icon;
                return <Icon className={`w-6 h-6 ${currentPage.color}`} />;
              })()}
              <div>
                <h2 className="font-semibold text-slate-900">Editing: {currentPage?.name} Page</h2>
                <p className="text-sm text-slate-500">
                  URL Path: {currentPage?.path}
                  {currentPageData.lastUpdated && (
                    <span className="ml-3 text-xs">
                      Last updated: {new Date(currentPageData.lastUpdated).toLocaleString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleResetCurrentPage}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Reset Page
              </Button>
              <Button 
                size="sm"
                onClick={() => window.open(`https://yourdomain.com${currentPage?.path}`, '_blank')}
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview Page
              </Button>
            </div>
          </div>
        </div>

        {/* SEO Form */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-3">
              <CardTitle>SEO Optimization Form - {currentPage?.name}</CardTitle>
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                <AlertCircle className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium">SEO Score: {seoScore}/100</span>
                <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${seoScore}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Fill out the sections below to optimize your {currentPage?.name} page for search engines and social media.
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
                      ref={focusInputRef}
                      name="focusKeyword"
                      placeholder="Enter primary keyword (e.g., best products 2024)" 
                      value={currentPageData.focusKeyword}
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
                          value={currentPageData.slug}
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
                      yourdomain.com/{currentPageData.slug || 'your-slug'}
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
                      value={currentPageData.metaTitle}
                      onChange={handleInputChange}
                    />
                    <p className={`text-xs mt-1 ${
                      currentPageData.metaTitle?.length >= 50 && currentPageData.metaTitle?.length <= 60 
                        ? 'text-green-600' 
                        : 'text-slate-500'
                    }`}>
                      {currentPageData.metaTitle?.length || 0} / 60 characters
                      {currentPageData.metaTitle?.length < 50 && currentPageData.metaTitle?.length > 0 && ' (Aim for 50-60 characters)'}
                    </p>
                  </div>

                  {/* Meta Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Meta Description <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      name="metaDescription"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow" 
                      rows={3} 
                      placeholder="Enter meta description (120-160 characters)"
                      value={currentPageData.metaDescription}
                      onChange={handleInputChange}
                    />
                    <p className={`text-xs mt-1 ${
                      currentPageData.metaDescription?.length >= 120 && currentPageData.metaDescription?.length <= 160
                        ? 'text-green-600'
                        : 'text-slate-500'
                    }`}>
                      {currentPageData.metaDescription?.length || 0} / 160 characters
                    </p>
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Target Keywords
                    </label>
                    <Input 
                      name="targetKeywords"
                      placeholder="seo, optimization, meta tags (comma separated)" 
                      value={currentPageData.targetKeywords}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Add 3-5 related keywords separated by commas
                    </p>
                  </div>

                  {/* Canonical URL */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Canonical URL
                    </label>
                    <Input 
                      name="canonicalUrl"
                      placeholder="https://example.com/canonical-url" 
                      value={currentPageData.canonicalUrl}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Leave empty to use current URL as canonical
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
                        yourdomain.com/{currentPageData.slug || currentPage?.path.slice(1) || 'example'}
                      </div>
                      <div className="text-lg text-blue-800 font-medium hover:underline cursor-pointer">
                        {currentPageData.metaTitle || 'Your Meta Title Will Appear Here'}
                      </div>
                      <div className="text-sm text-slate-600">
                        {currentPageData.metaDescription || 'Your meta description will appear here...'}
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
                      value={currentPageData.ogTitle}
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
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow" 
                      rows={2}
                      placeholder="Description for social shares (150-200 characters)"
                      value={currentPageData.ogDescription}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* OG Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Open Graph Image (Social Share Image)
                    </label>
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                      {currentPageData.ogImage ? (
                        <div className="space-y-3">
                          <img 
                            src={currentPageData.ogImage} 
                            alt="OG Preview" 
                            className="max-h-40 mx-auto rounded-lg border"
                          />
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => setSeoData(prev => ({ 
                              ...prev, 
                              [activePage]: { 
                                ...prev[activePage], 
                                ogImage: '', 
                                ogImageFile: null,
                                lastUpdated: new Date().toISOString()
                              } 
                            }))}
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
                      value={currentPageData.twitterCardType}
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
                      {currentPageData.ogImage && (
                        <img src={currentPageData.ogImage} alt="Preview" className="w-full h-48 object-cover" />
                      )}
                      <div className="p-3">
                        <div className="text-xs text-slate-500 mb-1">
                          yourdomain.com
                        </div>
                        <div className="font-medium text-slate-900 text-sm mb-1">
                          {currentPageData.ogTitle || currentPageData.metaTitle || `${currentPage?.name} | Social Title`}
                        </div>
                        <div className="text-xs text-slate-600">
                          {currentPageData.ogDescription || currentPageData.metaDescription || 'Social description...'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ========== SECTION 3: ADVANCED SEO ========== */}
            <div className="space-y-4">
              <SectionHeader 
                title="Advanced SEO" 
                icon={Settings} 
                section="advanced" 
                color="text-purple-600"
              />
              
              {expandedSections.advanced && (
                <div className="space-y-4 pl-2 pt-2">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Robots Meta Settings
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="noIndex"
                          checked={currentPageData.noIndex}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-orange-500 accent-orange-500"
                        />
                        <span className="text-sm text-slate-700">No Index (Hide from search engines)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="noFollow"
                          checked={currentPageData.noFollow}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-orange-500 accent-orange-500"
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
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save {currentPage?.name} SEO Settings
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  if (window.confirm('Reset all fields for this page?')) {
                    handleResetCurrentPage();
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset Form
              </Button>
            </div>

            {/* Success Message */}
            {saved && saveMessage && (
              <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
                <CheckCircle className="w-4 h-4" />
                {saveMessage}
              </div>
            )}

            {/* Error Message Toast */}
            {!saved && saveMessage && !saveMessage.includes('successfully') && (
              <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
                <AlertCircle className="w-4 h-4" />
                {saveMessage}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SEO Tips Card */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Tips for {currentPage?.name} Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-slate-600">
              <p>✓ <strong>Meta Title:</strong> Include your primary keyword and keep it under 60 characters</p>
              <p>✓ <strong>Meta Description:</strong> Write compelling description with call-to-action, 120-160 characters</p>
              <p>✓ <strong>Keywords:</strong> Use 3-5 relevant keywords that reflect your content</p>
              <p>✓ <strong>Social Image:</strong> Always add an Open Graph image for better social sharing</p>
              <p>✓ <strong>Canonical URL:</strong> Set to avoid duplicate content issues</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}