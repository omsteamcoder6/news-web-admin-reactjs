// CreateArticleForm.jsx - UPDATED: Added World News Quick Select Button
import { useState, useEffect } from 'react';
import { X, Save, Upload, Calendar, Tag, User, FolderOpen, Edit, Image as ImageIcon, Trash2, TrendingUp, Globe } from 'lucide-react';
import TinyMCEEditor from '../texteditor/TinyMCEEditor';
import categoryAPI from '../../lib/categapi';
import authorApi from '../../lib/authorApi';
import API from '../../lib/mergeapi';
import { useAuthStore } from '../../stores/authStore';
import { TrendAPI, TrendingBarAPI, LiveNewsAPI } from '../../lib/trendapi';

// Card Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="px-6 py-4 border-b border-slate-200">
    {children}
  </div>
);

const CardTitle = ({ children }) => (
  <h3 className="text-lg font-semibold text-slate-900">{children}</h3>
);

const CardContent = ({ children }) => (
  <div className="px-6 py-4">
    {children}
  </div>
);

const Button = ({ children, onClick, type = "button", variant = "default", className = "", disabled = false }) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2";
  const variants = {
    default: "bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-300",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:bg-slate-100",
    ghost: "text-slate-600 hover:bg-slate-100 disabled:text-slate-400"
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ ...props }) => (
  <input
    {...props}
    className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${props.className || ''}`}
  />
);

export default function CreateArticleForm({ onSubmit, onCancel, initialData = null, isEditing = false }) {
  const { token, user } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Live News Boolean State
  const [isLiveNewsEnabled, setIsLiveNewsEnabled] = useState(false);

  // Trending Bar State
  const [trendingBarData, setTrendingBarData] = useState(null);
  const [trendingItems, setTrendingItems] = useState([]);
  const [newTrendingItem, setNewTrendingItem] = useState('');
  const [loadingTrending, setLoadingTrending] = useState(false);

  // Selected Trending Topic for this article
  const [selectedTrending, setSelectedTrending] = useState('');

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    status: initialData?.status || 'draft',
    category: initialData?.category || '',
    author: initialData?.author || user?._id || '',
    tags: initialData?.tags || '',
    scheduledFor: initialData?.scheduledFor || '',
    image: null,
    excerpt: initialData?.excerpt || '',
    metaDescription: initialData?.metaDescription || '',
    existingFeaturedImage: initialData?.featuredImage || null,
    trendingTopic: initialData?.trendingTopic || '',
    isLiveNews: initialData?.isLiveNews || false
  });

  // Set initial values when editing
  useEffect(() => {
    if (initialData?.featuredImage) {
      setImagePreview(initialData.featuredImage);
    }
    if (initialData?.trendingTopic) {
      setSelectedTrending(initialData.trendingTopic);
    }
    if (initialData?.isLiveNews !== undefined) {
      setIsLiveNewsEnabled(initialData.isLiveNews);
      setFormData(prev => ({ ...prev, isLiveNews: initialData.isLiveNews }));
    }
    if (initialData?.scheduledFor) {
      setFormData(prev => ({ ...prev, scheduledFor: initialData.scheduledFor }));
    }
  }, [initialData]);

  // Fetch categories, authors, and trending bar on component mount
  useEffect(() => {
    fetchCategories();
    fetchAuthors();
    fetchTrendingBarData();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      setError(null);

      console.log('Fetching categories...');

      const fetchedCategories = await categoryAPI.getCategories({ status: 'Active' });
      console.log('Categories fetched:', fetchedCategories);

      const categoriesArray = Array.isArray(fetchedCategories) ? fetchedCategories :
        (fetchedCategories?.categories || fetchedCategories?.data || []);

      setCategories(categoriesArray);

      if (categoriesArray.length === 0) {
        console.warn('No active categories found. Please create a category first.');
      }

    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      setLoadingAuthors(true);
      setError(null);

      console.log('Fetching authors...');

      const fetchedAuthors = await authorApi.getAllAuthors();
      console.log('Authors fetched:', fetchedAuthors);

      const authorsArray = Array.isArray(fetchedAuthors) ? fetchedAuthors :
        (fetchedAuthors?.authors || fetchedAuthors?.data || []);

      setAuthors(authorsArray);

      if (authorsArray.length === 0) {
        console.warn('No authors found. Please create an author first.');
      }

    } catch (error) {
      console.error('Error fetching authors:', error);
      setAuthors([]);
    } finally {
      setLoadingAuthors(false);
    }
  };

  // Fetch trending bar data using TrendAPI
  const fetchTrendingBarData = async () => {
    try {
      setLoadingTrending(true);
      const response = await TrendingBarAPI.getTrendingBar();
      console.log('Trending bar response:', response);

      if (response && response.data) {
        setTrendingBarData(response.data);
        setTrendingItems(response.data.items || []);
      } else {
        const defaultItems = [
          { title: 'மிஸ்டர் கழகு', isActive: true, order: 0 },
          { title: 'உயக வாக்குறுதி?', isActive: true, order: 1 },
          { title: 'தேர்தல் 2026', isActive: true, order: 2 },
          { title: 'ஈரான் விலகாமா', isActive: true, order: 3 },
          { title: 'நாய் கிழுமி', isActive: true, order: 4 },
          { title: 'முதல் களம்', isActive: true, order: 5 },
          { title: 'திருச்சி-மேற்கு', isActive: true, order: 6 },
          { title: 'சட்டமன்றம் கூட்டம்', isActive: true, order: 7 },
          { title: 'புதிய அரசு திட்டம்', isActive: true, order: 8 }
        ];
        setTrendingItems(defaultItems);
      }
    } catch (error) {
      console.error('Error fetching trending bar:', error);
      setTrendingItems([
        { _id: '1', title: 'மிஸ்டர் கழகு', isActive: true, order: 0 },
        { _id: '2', title: 'உயக வாக்குறுதி?', isActive: true, order: 1 },
        { _id: '3', title: 'தேர்தல் 2026', isActive: true, order: 2 },
        { _id: '4', title: 'ஈரான் விலகாமா', isActive: true, order: 3 },
        { _id: '5', title: 'நாய் கிழுமி', isActive: true, order: 4 },
        { _id: '6', title: 'முதல் களம்', isActive: true, order: 5 },
        { _id: '7', title: 'திருச்சி-மேற்கு', isActive: true, order: 6 },
        { _id: '8', title: 'சட்டமன்றம் கூட்டம்', isActive: true, order: 7 },
        { _id: '9', title: 'புதிய அரசு திட்டம்', isActive: true, order: 8 }
      ]);
    } finally {
      setLoadingTrending(false);
    }
  };

  // Save trending bar data using TrendAPI
  const saveTrendingBarData = async (data) => {
    setLoadingTrending(true);

    try {
      const response = await TrendingBarAPI.updateTrendingBar(data);
      console.log('Trending bar saved:', response);

      if (response && response.data) {
        setTrendingBarData(response.data);
        setTrendingItems(response.data.items || []);
      }

      setSuccessMessage('Trending bar updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);

      return true;
    } catch (error) {
      console.error('Error saving trending bar:', error);
      setError(error.message || 'Failed to save trending bar');
      setTimeout(() => setError(null), 3000);
      return false;
    } finally {
      setLoadingTrending(false);
    }
  };

  // Add new trending item
  const addTrendingItem = async () => {
    if (!newTrendingItem.trim()) {
      setError('Please enter a trending topic');
      setTimeout(() => setError(null), 2000);
      return;
    }

    if (trendingItems.some(item => item.title === newTrendingItem.trim())) {
      setError('This item already exists in trending list');
      setTimeout(() => setError(null), 2000);
      return;
    }

    const newItem = {
      title: newTrendingItem.trim(),
      isActive: true,
      order: trendingItems.length
    };

    const updatedItems = [...trendingItems, newItem];
    const success = await saveTrendingBarData({ items: updatedItems });

    if (success) {
      setNewTrendingItem('');
    }
  };

  // Remove trending item
  const removeTrendingItem = async (itemId) => {
    const itemToRemove = trendingItems.find(item => item._id === itemId);
    if (confirm(`Remove "${itemToRemove?.title}" from trending list?`)) {
      const updatedItems = trendingItems.filter(item => item._id !== itemId);
      const reorderedItems = updatedItems.map((item, idx) => ({ ...item, order: idx }));
      await saveTrendingBarData({ items: reorderedItems });
    }
  };

  // Toggle trending item active status
  const toggleTrendingItemStatus = async (itemId) => {
    try {
      const response = await TrendingBarAPI.toggleTrendingItem(itemId);
      if (response && response.data) {
        setTrendingBarData(response.data);
        setTrendingItems(response.data.items || []);
        setSuccessMessage('Item status updated!');
        setTimeout(() => setSuccessMessage(null), 2000);
      }
    } catch (error) {
      console.error('Error toggling item status:', error);
      setError(error.message || 'Failed to update item status');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Reorder trending items
  const moveTrendingItem = async (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= trendingItems.length) return;

    const updatedItems = [...trendingItems];
    const [movedItem] = updatedItems.splice(fromIndex, 1);
    updatedItems.splice(toIndex, 0, movedItem);

    const reorderedItems = updatedItems.map((item, idx) => ({ ...item, order: idx }));

    try {
      const response = await TrendingBarAPI.reorderTrendingItems(reorderedItems.map(i => i._id));
      if (response && response.data) {
        setTrendingItems(reorderedItems);
        setTrendingBarData(response.data);
      }
    } catch (error) {
      console.error('Error reordering items:', error);
      setTrendingItems(reorderedItems);
      setError('Failed to save order on server, but order updated locally');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Toggle Live News - Boolean Handler
  const handleLiveNewsToggle = () => {
    const newValue = !isLiveNewsEnabled;
    setIsLiveNewsEnabled(newValue);
    setFormData(prev => ({ ...prev, isLiveNews: newValue }));

    if (newValue) {
      setSuccessMessage('✅ Live News will be published when you save');
    } else {
      setSuccessMessage('⭕ Live News will be removed when you save');
    }
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // World News Quick Select Handler - WITH AUTO-CREATE
  const handleWorldNewsSelect = async () => {
    let worldNewsCategory = categories.find(
      cat => cat.name?.toLowerCase() === 'world news' ||
        cat.name?.toLowerCase() === 'world' ||
        cat.name?.toLowerCase() === 'worldnews'
    );

    if (worldNewsCategory) {
      setFormData(prev => ({
        ...prev,
        category: worldNewsCategory._id || worldNewsCategory.id
      }));
      setSuccessMessage('🌍 World News category selected successfully!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } else {
      // Ask if user wants to create the category
      const shouldCreate = confirm(
        '❌ "World News" category not found.\n\nWould you like to create it now?'
      );

      if (shouldCreate) {
        try {
          setSubmitting(true);
          // Create the category using your categoryAPI
          const newCategory = await categoryAPI.createCategory({
            name: 'World News',
            slug: 'world-news',
            status: 'Active',
            icon: '🌍'
          });

          // Refresh categories list
          await fetchCategories();

          // Select the newly created category
          setFormData(prev => ({
            ...prev,
            category: newCategory._id || newCategory.id
          }));
          setSuccessMessage('✅ "World News" category created and selected!');
          setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
          console.error('Error creating category:', err);
          setError('Failed to create World News category. Please create it manually in Categories section.');
          setTimeout(() => setError(null), 5000);
        } finally {
          setSubmitting(false);
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file' && files[0]) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      setFormData(prev => ({
        ...prev,
        [name]: file,
        existingFeaturedImage: null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handler for trending topic selection
  const handleTrendingChange = (e) => {
    const value = e.target.value;
    setSelectedTrending(value);
    setFormData(prev => ({
      ...prev,
      trendingTopic: value
    }));
  };

  const handleContentChange = (newContent) => {
    console.log('Content changed, length:', newContent?.length);
    setFormData(prev => ({
      ...prev,
      content: newContent
    }));
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image: null,
      existingFeaturedImage: null
    }));
  };

  const uploadImage = async (file) => {
    try {
      setError(null);
      console.log('Uploading image:', file.name, 'Size:', file.size);

      const uploadResponse = await API.media.uploadFile(file);
      console.log('Upload response:', uploadResponse);

      let imageUrl = null;

      if (uploadResponse.data?.data?.url) {
        imageUrl = uploadResponse.data.data.url;
      } else if (uploadResponse.data?.data?.filePath) {
        imageUrl = uploadResponse.data.data.filePath;
      } else if (uploadResponse.data?.url) {
        imageUrl = uploadResponse.data.url;
      } else if (uploadResponse.data?.filePath) {
        imageUrl = uploadResponse.data.filePath;
      } else if (uploadResponse.data?.data?.path) {
        imageUrl = uploadResponse.data.data.path;
      } else if (uploadResponse.data?.path) {
        imageUrl = uploadResponse.data.path;
      }

      console.log('Extracted image path:', imageUrl);

      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }

      return imageUrl;
    } catch (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw new Error(uploadError.response?.data?.message || 'Failed to upload image');
    }
  };

  const createArticle = async (articleData, isDraft = false) => {
    try {
      if (!articleData.content || articleData.content.trim() === '') {
        throw new Error('Content is required');
      }

      if (!articleData.title || articleData.title.trim() === '') {
        throw new Error('Title is required');
      }

      const documentData = {
        title: articleData.title,
        slug: articleData.slug || generateSlugFromTitle(articleData.title),
        content: articleData.content,
        status: isDraft ? 'draft' : articleData.status,
        category: articleData.category,
        author: articleData.author,
        tags: articleData.tags ? articleData.tags.split(',').map(tag => tag.trim()) : [],
        excerpt: articleData.excerpt || articleData.content.substring(0, 160).replace(/<[^>]*>/g, ''),
        featuredImage: articleData.featuredImage || null,
        scheduledFor: articleData.scheduledFor || (articleData.status === 'published' ? new Date().toISOString() : null),
        trendingTopicId: articleData.trendingTopic || null,
        isLiveNews: articleData.isLiveNews === true
      };

      console.log('Sending document data:', { scheduledFor: documentData.scheduledFor, isLiveNews: documentData.isLiveNews });
      const response = await API.documents.createDocument(documentData);
      return response.data;
    } catch (err) {
      console.error('API Error:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to create article');
    }
  };

  const updateArticle = async (id, articleData) => {
    try {
      const documentData = {
        title: articleData.title,
        slug: articleData.slug || generateSlugFromTitle(articleData.title),
        content: articleData.content,
        status: articleData.status,
        category: articleData.category,
        tags: articleData.tags ? articleData.tags.split(',').map(tag => tag.trim()) : [],
        excerpt: articleData.excerpt || articleData.content.substring(0, 160).replace(/<[^>]*>/g, ''),
        featuredImage: articleData.featuredImage || articleData.existingFeaturedImage || null,
        scheduledFor: articleData.scheduledFor || (articleData.status === 'published' ? new Date().toISOString() : null),
        trendingTopicId: articleData.trendingTopic || null,
        isLiveNews: articleData.isLiveNews
      };

      console.log('Updating article with scheduledFor:', documentData.scheduledFor);
      const response = await API.documents.updateDocument(id, documentData);
      return response.data;
    } catch (err) {
      console.error('API Error:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to update article');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || formData.title.trim() === '') {
      setError('Please enter an article title');
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    if (!formData.author) {
      setError('Please select an author');
      return;
    }

    if (!formData.content || formData.content.trim() === '') {
      setError('Please add content to your article');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let featuredImage = formData.existingFeaturedImage;

      if (formData.image) {
        featuredImage = await uploadImage(formData.image);
      }

      const articleData = {
        ...formData,
        featuredImage,
        isLiveNews: isLiveNewsEnabled
      };

      let result;
      if (isEditing && initialData?._id) {
        result = await updateArticle(initialData._id, articleData);
        const message = isLiveNewsEnabled
          ? '✅ Article updated and published as Live News successfully!'
          : '⭕ Article updated as regular content.';
        setSuccessMessage(message);
      } else {
        result = await createArticle(articleData, false);
        const message = isLiveNewsEnabled
          ? '✅ Article published as Live News successfully!'
          : '✅ Article published successfully!';
        setSuccessMessage(message);
      }

      if (onSubmit) {
        onSubmit(result);
      }

      setTimeout(() => {
        if (onCancel) {
          onCancel();
        }
      }, 2000);

    } catch (err) {
      console.error('Error saving article:', err);
      setError(err.message || 'Failed to save article. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!formData.title || formData.title.trim() === '') {
      setError('Please enter an article title');
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    if (!formData.author) {
      setError('Please select an author');
      return;
    }

    if (!formData.content || formData.content.trim() === '') {
      setError('Please add content to your article');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let featuredImage = formData.existingFeaturedImage;

      if (formData.image) {
        featuredImage = await uploadImage(formData.image);
      }

      const articleData = {
        ...formData,
        featuredImage,
        status: 'draft',
        isLiveNews: false
      };

      let result;
      if (isEditing && initialData?._id) {
        result = await updateArticle(initialData._id, { ...articleData, status: 'draft' });
        setSuccessMessage('Draft updated successfully!');
      } else {
        result = await createArticle(articleData, true);
        setSuccessMessage('Draft saved successfully!');
      }

      if (onSubmit) {
        onSubmit({ ...result, isDraft: true });
      }

      setTimeout(() => {
        if (onCancel) {
          onCancel();
        }
      }, 2000);

    } catch (err) {
      console.error('Error saving draft:', err);
      setError(err.message || 'Failed to save draft. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const generateSlugFromTitle = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: title,
      slug: prev.slug === generateSlugFromTitle(prev.title) || !prev.slug
        ? generateSlugFromTitle(title)
        : prev.slug
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Edit Article' : 'Create New Article'}
          </h2>
          <p className="text-slate-600 mt-1">
            {isEditing ? 'Edit your existing article' : 'Add a new article to your publication'}
          </p>
        </div>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4" /> Cancel
          </Button>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <p className="font-medium">✓ Success</p>
          <p className="text-sm">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <Card>
              <CardHeader>
                <CardTitle>Article Title</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Enter article title..."
                  className="text-lg"
                  required
                />
              </CardContent>
            </Card>

            {/* Slug */}
            <Card>
              <CardHeader>
                <CardTitle>Slug (SEO URL)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <span className="px-3 py-2 bg-slate-100 text-slate-600 rounded-l-lg text-sm">/article/</span>
                  <Input
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="article-slug"
                    className="flex-1 rounded-l-none"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  URL-friendly version of the title. Leave empty to auto-generate.
                </p>
              </CardContent>
            </Card>

            {/* Content - Rich Text Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Article Content</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TinyMCEEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  autoSave={false}
                  readOnly={false}
                />
              </CardContent>
            </Card>

            {/* Excerpt */}
            <Card>
              <CardHeader>
                <CardTitle>Excerpt</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief summary of the article (optional)"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows="3"
                />
                <p className="text-xs text-slate-500 mt-1">Used in article listings and SEO meta description</p>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-orange-500 transition">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">Drag and drop your image here or click to upload</p>
                    <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, GIF up to 10MB</p>
                    <input
                      name="image"
                      type="file"
                      onChange={handleInputChange}
                      className="hidden"
                      id="image-upload"
                      accept="image/*"
                    />
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => document.getElementById('image-upload').click()}
                      type="button"
                    >
                      Choose Image
                    </Button>
                  </div>
                )}
                {formData.existingFeaturedImage && !imagePreview && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ Current image saved
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={handleInputChange}
                  />
                  <span className="text-sm text-slate-900">Draft</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="scheduled"
                    checked={formData.status === 'scheduled'}
                    onChange={handleInputChange}
                  />
                  <span className="text-sm text-slate-900">Scheduled</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={handleInputChange}
                  />
                  <span className="text-sm text-slate-900">Publish Now</span>
                </label>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <FolderOpen className="w-4 h-4 inline mr-2" />
                  Category <span className="text-red-500">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCategories ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-sm text-slate-500 mt-2">Loading categories...</p>
                  </div>
                ) : categories.length > 0 ? (
                  <>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category._id || category.id} value={category._id || category.id}>
                          {category.icon && <span className="mr-2">{category.icon}</span>}
                          {category.name}
                        </option>
                      ))}
                    </select>

                    {/* WORLD NEWS QUICK SELECT BUTTON - ADDED HERE */}
                    <button
                      type="button"
                      onClick={handleWorldNewsSelect}
                      className="w-full mt-3 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-blue-200"
                    >
                      <Globe className="w-4 h-4" />
                      🌍 Quick Select: World News
                    </button>
                  </>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-lg text-sm">
                    <p className="font-medium">⚠️ No categories available</p>
                    <p className="text-xs mt-1">Please create a category before creating an article.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Author */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <User className="w-4 h-4 inline mr-2" />
                  Author <span className="text-red-500">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAuthors ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-sm text-slate-500 mt-2">Loading authors...</p>
                  </div>
                ) : authors.length > 0 ? (
                  <select
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select Author</option>
                    {authors.map((author) => (
                      <option key={author._id || author.id} value={author._id || author.id}>
                        {author.name || author.fullName || author.username}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-lg text-sm">
                    <p className="font-medium">⚠️ No authors available</p>
                    <p className="text-xs mt-1">Please create an author before creating an article.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Tag className="w-4 h-4 inline mr-2" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Add tags (comma separated)..."
                />
                <p className="text-xs text-slate-500 mt-1">Example: technology, javascript, react</p>
              </CardContent>
            </Card>

            {/* Trending Topic Select Dropdown */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Trending Topic
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTrending ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-sm text-slate-500 mt-2">Loading trending topics...</p>
                  </div>
                ) : trendingItems.filter(item => item.isActive).length > 0 ? (
                  <select
                    name="trendingTopic"
                    value={selectedTrending}
                    onChange={handleTrendingChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">-- Select Trending Topic (Optional) --</option>
                    {trendingItems
                      .filter(item => item.isActive)
                      .map((item) => (
                        <option key={item._id} value={item._id}>
                          🔥 {item.title}
                        </option>
                      ))}
                  </select>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-lg text-sm">
                    <p className="font-medium">⚠️ No active trending topics available</p>
                    <p className="text-xs mt-1">Please add and activate trending topics in the "Manage Trending Bar" section below.</p>
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-2">
                  Select a trending topic to associate with this article. This will help display the article in the trending bar.
                </p>
              </CardContent>
            </Card>

            {/* Scheduled Date Field */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Scheduled Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  name="scheduledFor"
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Set a future date to schedule publication. Leave empty for draft or publish now.
                </p>
              </CardContent>
            </Card>

            {/* Live News Management Section - Boolean Toggle Only */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center justify-between">
                    <span>📰 Live News Management</span>
                    <button
                      type="button"
                      onClick={handleLiveNewsToggle}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${isLiveNewsEnabled ? 'bg-orange-500' : 'bg-gray-300'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${isLiveNewsEnabled ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`rounded-lg p-4 border ${isLiveNewsEnabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isLiveNewsEnabled ? 'text-green-700' : 'text-gray-600'}`}>
                        {isLiveNewsEnabled ? '✅ Live News is ACTIVE' : '⭕ Live News is INACTIVE'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {isLiveNewsEnabled
                          ? 'This article WILL appear in the Live News section on the website'
                          : 'This article will NOT appear in the Live News section'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-3">
                  <p className="text-xs text-purple-800">
                    <strong>ℹ️ How it works:</strong><br />
                    • <strong>ON (Orange):</strong> Article will be published as Live News immediately<br />
                    • <strong>OFF (Gray):</strong> Article will be saved as regular content only<br />
                    • You can toggle this anytime when editing the article
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trending Bar Management Section */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  🔥 Manage Trending Bar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingTrending ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-sm text-slate-500 mt-2">Loading trending items...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {trendingItems.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">
                          No trending items added yet
                        </p>
                      ) : (
                        trendingItems.map((item, idx) => (
                          <div key={item._id || idx} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg group">
                            <div className="flex items-center gap-2 flex-1">
                              <button
                                type="button"
                                onClick={() => moveTrendingItem(idx, idx - 1)}
                                disabled={idx === 0}
                                className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                onClick={() => moveTrendingItem(idx, idx + 1)}
                                disabled={idx === trendingItems.length - 1}
                                className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                              >
                                ↓
                              </button>
                              <span className="text-sm text-slate-700 flex-1">{item.title}</span>
                              <button
                                type="button"
                                onClick={() => toggleTrendingItemStatus(item._id)}
                                className={`px-2 py-0.5 text-xs rounded-full transition-colors ${item.isActive
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                  }`}
                              >
                                {item.isActive ? 'Active' : 'Inactive'}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeTrendingItem(item._id)}
                                className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={loadingTrending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Input
                        value={newTrendingItem}
                        onChange={(e) => setNewTrendingItem(e.target.value)}
                        placeholder="Enter trending topic..."
                        onKeyPress={(e) => e.key === 'Enter' && addTrendingItem()}
                        disabled={loadingTrending}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={addTrendingItem}
                        disabled={!newTrendingItem.trim() || loadingTrending}
                        variant="default"
                      >
                        Add
                      </Button>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                      <p className="text-xs text-blue-800">
                        <strong>ℹ️ Info:</strong> These items will appear in the trending bar on your website homepage.
                        Use the arrows to reorder, click on status to toggle active/inactive, and hover to delete.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isEditing ? 'Updating...' : 'Publishing...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> {isEditing ? 'Update' : 'Publish'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleSaveAsDraft}
                disabled={submitting}
              >
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}