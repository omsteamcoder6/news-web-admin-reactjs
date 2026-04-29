// pages/admin/categories/[id]/customize.jsx or components/categories/CategoryCustomize.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../../layout/MainLayout';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Save, ArrowLeft, Eye, Grid, Columns, Maximize2, Minimize2, RefreshCw, LayoutTemplate } from 'lucide-react';
import categoryAPI from '../../../lib/categapi';
import toast from 'react-hot-toast'; // or your toast library

export default function CategoryCustomize() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Layout settings for this category
  const [layoutSettings, setLayoutSettings] = useState({
    columns: 3,
    cardSize: 'medium',
    cardStyle: 'default', // default, compact, elegant, modern
    showImage: true,
    showDate: true,
    showDescription: true,
    gapSize: 'normal', // small, normal, large
    backgroundColor: '#ffffff',
    textColor: '#000000'
  });

  // Preview mode
  const [previewMode, setPreviewMode] = useState(false);

  // Load category and its layout settings
  useEffect(() => {
    loadCategoryAndSettings();
  }, [id]);

  const loadCategoryAndSettings = async () => {
    try {
      setLoading(true);
      // Load category details
      const categoryData = await categoryAPI.getCategoryById(id);
      setCategory(categoryData);
      
      // Load saved layout settings for this category
      if (categoryAPI.getCategoryLayoutSettings) {
        const settings = await categoryAPI.getCategoryLayoutSettings(id);
        if (settings) {
          setLayoutSettings(prev => ({ ...prev, ...settings }));
        }
      }
    } catch (error) {
      console.error('Failed to load category:', error);
      toast.error('Failed to load category settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // Save layout settings for this category
      if (categoryAPI.updateCategoryLayoutSettings) {
        await categoryAPI.updateCategoryLayoutSettings(id, layoutSettings);
      } else {
        // Fallback: save as part of category meta
        await categoryAPI.updateCategory(id, {
          ...category,
          layoutSettings: layoutSettings
        });
      }
      toast.success('Layout settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save layout settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setLayoutSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefault = () => {
    setLayoutSettings({
      columns: 3,
      cardSize: 'medium',
      cardStyle: 'default',
      showImage: true,
      showDate: true,
      showDescription: true,
      gapSize: 'normal',
      backgroundColor: '#ffffff',
      textColor: '#000000'
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600">Loading category settings...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/admin/categories')}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{category?.icon}</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Customize: {category?.name}
                </h1>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Configure how this category displays on the frontend
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={resetToDefault}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
            <Button 
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Side: Controls */}
          <div className="space-y-6">
            {/* Layout Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5" />
                  Layout Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Columns */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Columns className="w-4 h-4 inline mr-1" />
                    Number of Columns
                  </label>
                  <div className="flex gap-2">
                    {[2, 3, 4].map(col => (
                      <button
                        key={col}
                        onClick={() => updateSetting('columns', col)}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 transition ${
                          layoutSettings.columns === col
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {col} Columns
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Size */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Grid className="w-4 h-4 inline mr-1" />
                    Card Size
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'small', label: 'Small', icon: <Minimize2 className="w-4 h-4" /> },
                      { value: 'medium', label: 'Medium', icon: null },
                      { value: 'large', label: 'Large', icon: <Maximize2 className="w-4 h-4" /> }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => updateSetting('cardSize', option.value)}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 transition flex items-center justify-center gap-1 ${
                          layoutSettings.cardSize === option.value
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {option.icon}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Style */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Card Style Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'default', label: 'Default', style: 'bg-white shadow' },
                      { value: 'compact', label: 'Compact', style: 'bg-gray-50 border' },
                      { value: 'elegant', label: 'Elegant', style: 'bg-gradient-to-br' },
                      { value: 'modern', label: 'Modern', style: 'shadow-lg rounded-xl' }
                    ].map(style => (
                      <button
                        key={style.value}
                        onClick={() => updateSetting('cardStyle', style.value)}
                        className={`p-3 rounded-lg border-2 transition text-left ${
                          layoutSettings.cardStyle === style.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-medium text-sm">{style.label}</div>
                        <div className="text-xs text-slate-500 mt-1">{style.style}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gap Size */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Gap Between Cards
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'small', label: 'Small', gap: '8px' },
                      { value: 'normal', label: 'Normal', gap: '16px' },
                      { value: 'large', label: 'Large', gap: '24px' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => updateSetting('gapSize', option.value)}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 transition ${
                          layoutSettings.gapSize === option.value
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {option.label}
                        <span className="text-xs block text-slate-400">{option.gap}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Content Display</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Show Images</span>
                  <input
                    type="checkbox"
                    checked={layoutSettings.showImage}
                    onChange={(e) => updateSetting('showImage', e.target.checked)}
                    className="toggle-checkbox"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Show Date</span>
                  <input
                    type="checkbox"
                    checked={layoutSettings.showDate}
                    onChange={(e) => updateSetting('showDate', e.target.checked)}
                    className="toggle-checkbox"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Show Description</span>
                  <input
                    type="checkbox"
                    checked={layoutSettings.showDescription}
                    onChange={(e) => updateSetting('showDescription', e.target.checked)}
                    className="toggle-checkbox"
                  />
                </label>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={layoutSettings.backgroundColor}
                    onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                    className="w-full h-10 rounded border border-slate-300 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={layoutSettings.textColor}
                    onChange={(e) => updateSetting('textColor', e.target.value)}
                    className="w-full h-10 rounded border border-slate-300 cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side: Live Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Live Preview</h3>
              <div className="text-xs text-slate-500">
                <Eye className="w-3 h-3 inline mr-1" />
                Changes appear instantly
              </div>
            </div>
            
            <div 
              className="rounded-xl border-2 border-dashed border-slate-300 p-6 min-h-[500px] transition-all"
              style={{ backgroundColor: layoutSettings.backgroundColor }}
            >
              {/* Preview Grid */}
              <div 
                className="grid transition-all"
                style={{
                  gridTemplateColumns: `repeat(${layoutSettings.columns}, minmax(0, 1fr))`,
                  gap: layoutSettings.gapSize === 'small' ? '8px' : layoutSettings.gapSize === 'large' ? '24px' : '16px'
                }}
              >
                {[1, 2, 3].map((item) => (
                  <PreviewCard 
                    key={item}
                    settings={layoutSettings}
                    categoryName={category?.name}
                  />
                ))}
              </div>
              
              <p className="text-center text-xs text-slate-400 mt-6">
                Preview shows how {category?.name} category will look
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Preview Card Component
function PreviewCard({ settings, categoryName }) {
  const sizeClasses = {
    small: 'p-3 text-sm',
    medium: 'p-4',
    large: 'p-6'
  };

  const styleClasses = {
    default: 'bg-white shadow-md rounded-lg',
    compact: 'bg-gray-50 border border-gray-200 rounded',
    elegant: 'bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl',
    modern: 'bg-white shadow-xl rounded-2xl border border-gray-100'
  };

  return (
    <div className={`${styleClasses[settings.cardStyle]} ${sizeClasses[settings.cardSize]} transition-all`}>
      {settings.showImage && (
        <div className="bg-gradient-to-br from-orange-100 to-orange-200 h-24 sm:h-32 rounded-lg mb-3 flex items-center justify-center">
          <span className="text-3xl">📰</span>
        </div>
      )}
      <h3 className={`font-bold text-slate-800 ${settings.cardSize === 'small' ? 'text-sm' : settings.cardSize === 'large' ? 'text-xl' : 'text-base'}`}>
        Sample Article Title
      </h3>
      {settings.showDate && (
        <p className="text-xs text-slate-400 mt-1">December 12, 2024</p>
      )}
      {settings.showDescription && (
        <p className="text-slate-600 mt-2 line-clamp-2 text-sm">
          This is a preview of how articles in {categoryName} will appear...
        </p>
      )}
      <div className="mt-3">
        <span className="text-xs text-orange-500 font-semibold">Read more →</span>
      </div>
    </div>
  );
}