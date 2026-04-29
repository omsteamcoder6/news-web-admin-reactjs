// CategoryForm.jsx - Fixed with better validation
import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { X } from 'lucide-react';

// Helper functions
const generateSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const isValidSlug = (slug) => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

const getIconOptions = () => {
  return [
    { value: '📁', label: '📁 Folder' },
    { value: '📰', label: '📰 News' },
    { value: '📚', label: '📚 Books' },
    { value: '🎨', label: '🎨 Art' },
    { value: '💻', label: '💻 Technology' },
    { value: '🏠', label: '🏠 Home' },
    { value: '🎵', label: '🎵 Music' },
    { value: '🎮', label: '🎮 Gaming' },
    { value: '📷', label: '📷 Photography' },
    { value: '✈️', label: '✈️ Travel' },
    { value: '🍔', label: '🍔 Food' },
    { value: '💪', label: '💪 Fitness' },
    { value: '🎓', label: '🎓 Education' },
    { value: '💼', label: '💼 Business' },
    { value: '❤️', label: '❤️ Health' }
  ];
};

export default function CategoryForm({ category, categories, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '📁',
    status: 'Active',
    position: 0
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        icon: category.icon || '📁',
        status: category.status || 'Active',
        position: category.position || 0
      });
    } else {
      const maxPosition = Math.max(...categories.map(c => c.position || 0), 0);
      setFormData(prev => ({ ...prev, position: maxPosition + 1 }));
    }
  }, [category, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'name' && !slugManuallyEdited) {
      const generatedSlug = generateSlug(value);
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
      // Clear slug error if it becomes valid
      if (isValidSlug(generatedSlug)) {
        setErrors(prev => ({ ...prev, slug: undefined }));
      }
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSlugChange = (e) => {
    const { value } = e.target;
    setSlugManuallyEdited(true);
    setFormData(prev => ({ ...prev, slug: value }));
    
    // Validate slug on change
    if (!isValidSlug(value)) {
      setErrors(prev => ({ ...prev, slug: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.' }));
    } else {
      setErrors(prev => ({ ...prev, slug: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!isValidSlug(formData.slug)) {
      newErrors.slug = 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.';
    }
    
    // Check for duplicate slug (excluding current category if editing)
    const isDuplicate = categories.some(cat => 
      cat.slug === formData.slug && cat.id !== category?.id
    );
    
    if (isDuplicate) {
      newErrors.slug = 'A category with this slug already exists';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: error.message || 'Failed to save category' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const iconSuggestions = getIconOptions().map(option => option.value);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 border-b">
          <CardTitle>{category ? 'Edit Category' : 'Create New Category'}</CardTitle>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-slate-100 rounded transition"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.name ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Enter category name"
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleSlugChange}
                required
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 ${
                  errors.slug ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="auto-generated from name"
              />
              {errors.slug ? (
                <p className="text-xs text-red-500 mt-1">{errors.slug}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  URL-friendly version of the category name (lowercase, hyphens only)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Icon *
              </label>
              <div className="flex items-center gap-3">
                <div className="text-4xl bg-slate-100 p-3 rounded-lg min-w-[60px] text-center">
                  {formData.icon || '📁'}
                </div>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  required
                  maxLength={2}
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-lg"
                  placeholder="Enter emoji (e.g., 📁, 🏛️, 🎬)"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Enter any emoji as category icon
              </p>
              
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-2">Popular icons:</p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {iconSuggestions.map((icon, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className="text-2xl p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title={`Use ${icon} icon`}
                      disabled={isSubmitting}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Active">Active</option>
                <option value="Hidden">Hidden</option>
              </select>
            </div>

            {category && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Position (Order)
                </label>
                <input
                  type="number"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  min="1"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Lower numbers appear first. Current max position: {Math.max(...categories.map(c => c.position || 0), 0)}
                </p>
              </div>
            )}

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}