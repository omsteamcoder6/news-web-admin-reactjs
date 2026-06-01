// CreateArticleForm.jsx - UPDATED: Now using Tiptap Editor instead of TinyMCE
import { useState, useEffect } from 'react';
import { X, Save, Upload, Calendar, Tag, User, FolderOpen, Edit, Image as ImageIcon, Trash2, TrendingUp, Globe, Search, Link, Eye, Code, FileText } from 'lucide-react';
import TiptapEditor from '../texteditor/TiptapEditor'; // Changed to Tiptap
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

const Button = ({ children, onClick, type = "button", variant = "default", className = "", disabled = false, size = "default" }) => {
  const baseStyles = "rounded-lg font-medium transition-colors flex items-center gap-2";
  const sizeStyles = {
    default: "px-4 py-2",
    sm: "px-3 py-1.5 text-sm"
  };
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
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant] || variants.default} ${className}`}
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

const TextArea = ({ ...props }) => (
  <textarea
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

  // World News Boolean State
  const [isWorldNewsEnabled, setIsWorldNewsEnabled] = useState(false);

  // Trending Bar State
  const [trendingBarData, setTrendingBarData] = useState(null);
  const [trendingItems, setTrendingItems] = useState([]);
  const [newTrendingItem, setNewTrendingItem] = useState('');
  const [loadingTrending, setLoadingTrending] = useState(false);

  // Selected Trending Topic for this article
  const [selectedTrending, setSelectedTrending] = useState('');

  // SEO PREVIEW STATE
  const [showSeoPreview, setShowSeoPreview] = useState(false);

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
    existingFeaturedImage: initialData?.featuredImage || null,
    trendingTopic: initialData?.trendingTopic || '',
    isLiveNews: initialData?.isLiveNews || false,
    isWorldNews: initialData?.isWorldNews || false,
    
    // SEO FIELDS
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    ogTitle: initialData?.ogTitle || '',
    ogDescription: initialData?.ogDescription || '',
    ogImage: initialData?.ogImage || '',
    ogImageFile: null,
    ogImagePreview: null,
    useFeaturedAsOgImage: false,
    canonicalUrl: initialData?.canonicalUrl || '',
    robotsNoIndex: initialData?.robotsNoIndex || false,
    robotsNoFollow: initialData?.robotsNoFollow || false,
    focusKeyword: initialData?.focusKeyword || ''
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
    if (initialData?.isWorldNews !== undefined) {
      setIsWorldNewsEnabled(initialData.isWorldNews);
      setFormData(prev => ({ ...prev, isWorldNews: initialData.isWorldNews }));
    }
    if (initialData?.scheduledFor) {
      setFormData(prev => ({ ...prev, scheduledFor: initialData.scheduledFor }));
    }
    
    // Set SEO fields when editing
    if (initialData?.metaTitle) setFormData(prev => ({ ...prev, metaTitle: initialData.metaTitle }));
    if (initialData?.metaDescription) setFormData(prev => ({ ...prev, metaDescription: initialData.metaDescription }));
    if (initialData?.ogTitle) setFormData(prev => ({ ...prev, ogTitle: initialData.ogTitle }));
    if (initialData?.ogDescription) setFormData(prev => ({ ...prev, ogDescription: initialData.ogDescription }));
    if (initialData?.ogImage) setFormData(prev => ({ ...prev, ogImage: initialData.ogImage, ogImagePreview: initialData.ogImage }));
    if (initialData?.canonicalUrl) setFormData(prev => ({ ...prev, canonicalUrl: initialData.canonicalUrl }));
    if (initialData?.robotsNoIndex !== undefined) setFormData(prev => ({ ...prev, robotsNoIndex: initialData.robotsNoIndex }));
    if (initialData?.robotsNoFollow !== undefined) setFormData(prev => ({ ...prev, robotsNoFollow: initialData.robotsNoFollow }));
    if (initialData?.focusKeyword) setFormData(prev => ({ ...prev, focusKeyword: initialData.focusKeyword }));
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

  // World News Quick Select Handler
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
      
      setIsWorldNewsEnabled(true);
      setFormData(prev => ({ ...prev, isWorldNews: true }));
      
      setSuccessMessage('🌍 World News category selected AND isWorldNews set to TRUE!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      const shouldCreate = confirm(
        '❌ "World News" category not found.\n\nWould you like to create it now?'
      );

      if (shouldCreate) {
        try {
          setSubmitting(true);
          const newCategory = await categoryAPI.createCategory({
            name: 'World News',
            slug: 'world-news',
            status: 'Active',
            icon: '🌍'
          });

          await fetchCategories();

          setFormData(prev => ({
            ...prev,
            category: newCategory._id || newCategory.id
          }));
          
          setIsWorldNewsEnabled(true);
          setFormData(prev => ({ ...prev, isWorldNews: true }));
          
          setSuccessMessage('✅ "World News" category created, selected, AND isWorldNews set to TRUE!');
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

  // Toggle World News manually
  const handleWorldNewsToggle = () => {
    const newValue = !isWorldNewsEnabled;
    setIsWorldNewsEnabled(newValue);
    setFormData(prev => ({ ...prev, isWorldNews: newValue }));

    if (newValue) {
      setSuccessMessage('🌍 World News flag ENABLED - this will appear in World News section');
    } else {
      setSuccessMessage('🌍 World News flag DISABLED');
    }
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // SEO Helper: Generate meta title from article title if empty
  const getAutoMetaTitle = () => {
    if (formData.metaTitle) return formData.metaTitle;
    if (formData.title) return `${formData.title} | Your Site Name`;
    return 'Enter meta title';
  };

  // SEO Helper: Generate meta description from excerpt or content
  const getAutoMetaDescription = () => {
    if (formData.metaDescription) return formData.metaDescription;
    if (formData.excerpt) return formData.excerpt.substring(0, 160);
    if (formData.content) {
      const plainText = formData.content.replace(/<[^>]*>/g, '').substring(0, 160);
      return plainText;
    }
    return 'Enter meta description';
  };

  const handleInputChange = (e) => {
    const { name, value, type, files, checked } = e.target;

    if (type === 'file' && files[0]) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      setFormData(prev => ({
        ...prev,
        [name]: file,
        existingFeaturedImage: null
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
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

  // 🆕 Upload OG Image specifically
  const uploadOgImage = async (file) => {
    try {
      setError(null);
      console.log('Uploading OG Image:', file.name);

      const uploadResponse = await API.media.uploadFile(file);
      
      let imageUrl = null;
      if (uploadResponse.data?.data?.url) {
        imageUrl = uploadResponse.data.data.url;
      } else if (uploadResponse.data?.data?.filePath) {
        imageUrl = uploadResponse.data.data.filePath;
      } else if (uploadResponse.data?.url) {
        imageUrl = uploadResponse.data.url;
      } else if (uploadResponse.data?.filePath) {
        imageUrl = uploadResponse.data.filePath;
      }

      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }

      return imageUrl;
    } catch (uploadError) {
      console.error('Error uploading OG Image:', uploadError);
      throw new Error(uploadError.response?.data?.message || 'Failed to upload OG Image');
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
        isLiveNews: articleData.isLiveNews === true,
        isWorldNews: articleData.isWorldNews === true,
        
        // SEO FIELDS
        metaTitle: articleData.metaTitle || null,
        metaDescription: articleData.metaDescription || null,
        ogTitle: articleData.ogTitle || null,
        ogDescription: articleData.ogDescription || null,
        ogImage: articleData.useFeaturedAsOgImage ? null : (articleData.ogImage || null),
        canonicalUrl: articleData.canonicalUrl || null,
        robotsNoIndex: articleData.robotsNoIndex || false,
        robotsNoFollow: articleData.robotsNoFollow || false,
        focusKeyword: articleData.focusKeyword || null
      };

      console.log('Sending document data:', { scheduledFor: documentData.scheduledFor, isLiveNews: documentData.isLiveNews, isWorldNews: documentData.isWorldNews, ogImage: documentData.ogImage });
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
        isLiveNews: articleData.isLiveNews === true,
        isWorldNews: articleData.isWorldNews === true,
        
        // SEO FIELDS
        metaTitle: articleData.metaTitle || null,
        metaDescription: articleData.metaDescription || null,
        ogTitle: articleData.ogTitle || null,
        ogDescription: articleData.ogDescription || null,
        ogImage: articleData.useFeaturedAsOgImage ? null : (articleData.ogImage || null),
        canonicalUrl: articleData.canonicalUrl || null,
        robotsNoIndex: articleData.robotsNoIndex || false,
        robotsNoFollow: articleData.robotsNoFollow || false,
        focusKeyword: articleData.focusKeyword || null
      };

      console.log('Updating article with scheduledFor:', documentData.scheduledFor, 'isWorldNews:', documentData.isWorldNews);
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

      // If OG image file exists, upload it
      let ogImageUrl = formData.ogImage;
      if (formData.ogImageFile && !formData.useFeaturedAsOgImage) {
        ogImageUrl = await uploadOgImage(formData.ogImageFile);
      }

      const articleData = {
        ...formData,
        featuredImage,
        ogImage: ogImageUrl,
        isLiveNews: isLiveNewsEnabled,
        isWorldNews: isWorldNewsEnabled
      };

      let result;
      if (isEditing && initialData?._id) {
        result = await updateArticle(initialData._id, articleData);
        const message = isWorldNewsEnabled
          ? '🌍 Article updated and marked as World News successfully!'
          : isLiveNewsEnabled
          ? '✅ Article updated and published as Live News successfully!'
          : '⭕ Article updated as regular content.';
        setSuccessMessage(message);
      } else {
        result = await createArticle(articleData, false);
        const message = isWorldNewsEnabled
          ? '🌍 Article published as World News successfully!'
          : isLiveNewsEnabled
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

      // If OG image file exists, upload it
      let ogImageUrl = formData.ogImage;
      if (formData.ogImageFile && !formData.useFeaturedAsOgImage) {
        ogImageUrl = await uploadOgImage(formData.ogImageFile);
      }

      const articleData = {
        ...formData,
        featuredImage,
        ogImage: ogImageUrl,
        status: 'draft',
        isLiveNews: false,
        isWorldNews: isWorldNewsEnabled
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

            {/* Content - Tiptap Editor (Replaced TinyMCE) */}
            <Card>
              <CardHeader>
                <CardTitle>Article Content</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TiptapEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  autoSave={false}
                  readOnly={false}
                  documentId={isEditing ? initialData?._id : null}
                />
              </CardContent>
            </Card>

            {/* Excerpt */}
            <Card>
              <CardHeader>
                <CardTitle>Excerpt</CardTitle>
              </CardHeader>
              <CardContent>
                <TextArea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief summary of the article (optional)"
                  rows="3"
                />
                <p className="text-xs text-slate-500 mt-1">Used in article listings and as fallback for meta description</p>
              </CardContent>
            </Card>

            {/* SEO SECTION - Main Content Area */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    <Search className="w-4 h-4 inline mr-2" />
                    SEO Settings (Meta Tags & Social Sharing)
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSeoPreview(!showSeoPreview)}
                  >
                    <Eye className="w-4 h-4" />
                    {showSeoPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Meta Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Meta Title <span className="text-xs text-slate-400">(50-60 characters recommended)</span>
                  </label>
                  <Input
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    placeholder="SEO title (different from article title)"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Character count: {formData.metaTitle?.length || 0} / 60
                  </p>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Meta Description <span className="text-xs text-slate-400">(150-160 characters recommended)</span>
                  </label>
                  <TextArea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    placeholder="Brief description for search engines"
                    rows="2"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Character count: {formData.metaDescription?.length || 0} / 160
                  </p>
                </div>

                {/* Focus Keyword */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <FileText className="w-3 h-3 inline mr-1" />
                    Focus Keyword
                  </label>
                  <Input
                    name="focusKeyword"
                    value={formData.focusKeyword}
                    onChange={handleInputChange}
                    placeholder="Main SEO keyword for this article"
                  />
                  <p className="text-xs text-slate-500 mt-1">The primary keyword you want this article to rank for</p>
                </div>

                <div className="border-t border-slate-200 my-4"></div>

                {/* Open Graph (Social Media) Section */}
                <div>
                  <h4 className="font-medium text-slate-800 mb-3">Open Graph (Social Media Sharing)</h4>
                  
                  {/* OG Title */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      OG Title <span className="text-xs text-slate-400">(For Facebook, LinkedIn, etc.)</span>
                    </label>
                    <Input
                      name="ogTitle"
                      value={formData.ogTitle}
                      onChange={handleInputChange}
                      placeholder={`${formData.metaTitle || formData.title || 'Article Title'} | Your Site`}
                    />
                    <p className="text-xs text-slate-500 mt-1">Leave empty to use Meta Title</p>
                  </div>

                  {/* OG Description */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      OG Description
                    </label>
                    <TextArea
                      name="ogDescription"
                      value={formData.ogDescription}
                      onChange={handleInputChange}
                      placeholder="Description for social media sharing"
                      rows="2"
                    />
                    <p className="text-xs text-slate-500 mt-1">Leave empty to use Meta Description</p>
                  </div>

                  {/* OG Image - UPLOAD FIELD */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      OG Image (Social Media Image) <span className="text-xs text-slate-400">(1200x630px recommended)</span>
                    </label>
                    
                    {/* Show preview if OG image exists */}
                    {(formData.ogImagePreview || (formData.ogImage && !formData.useFeaturedAsOgImage)) && !formData.useFeaturedAsOgImage ? (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 mb-2">
                        <img
                          src={formData.ogImagePreview || (formData.ogImage ? API.media.getImageUrl(formData.ogImage) : '')}
                          alt="OG Preview"
                          className="w-full h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, ogImage: null, ogImagePreview: null, ogImageFile: null }));
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-orange-500 transition mb-2">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Click to upload OG Image</p>
                        <p className="text-xs text-slate-400 mt-1">1200x630px recommended for social sharing</p>
                        <input
                          type="file"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              // Show preview immediately
                              const previewUrl = URL.createObjectURL(file);
                              setFormData(prev => ({ 
                                ...prev, 
                                ogImageFile: file, 
                                ogImagePreview: previewUrl,
                                ogImage: null,
                                useFeaturedAsOgImage: false
                              }));
                              
                              // Upload the image
                              try {
                                const uploadedUrl = await uploadOgImage(file);
                                setFormData(prev => ({ 
                                  ...prev, 
                                  ogImage: uploadedUrl,
                                  ogImageFile: null
                                }));
                                setSuccessMessage('OG Image uploaded successfully!');
                                setTimeout(() => setSuccessMessage(null), 2000);
                              } catch (err) {
                                setError('Failed to upload OG Image');
                                setFormData(prev => ({ 
                                  ...prev, 
                                  ogImagePreview: null,
                                  ogImageFile: null
                                }));
                              }
                            }
                          }}
                          className="hidden"
                          id="og-image-upload"
                          accept="image/*"
                        />
                        <Button
                          variant="outline"
                          className="mt-2"
                          onClick={() => document.getElementById('og-image-upload').click()}
                          type="button"
                          size="sm"
                        >
                          Choose OG Image
                        </Button>
                      </div>
                    )}
                    
                    {/* OR use Featured Image as OG Image option */}
                    <div className="mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.useFeaturedAsOgImage}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setFormData(prev => ({ 
                              ...prev, 
                              useFeaturedAsOgImage: isChecked,
                              ogImage: isChecked ? null : prev.ogImage,
                              ogImagePreview: isChecked ? null : prev.ogImagePreview
                            }));
                            if (isChecked) {
                              setSuccessMessage('Will use Featured Image as OG Image');
                              setTimeout(() => setSuccessMessage(null), 2000);
                            }
                          }}
                          className="rounded border-slate-300"
                        />
                        <span className="text-sm text-slate-700">Use Featured Image as OG Image</span>
                      </label>
                      <p className="text-xs text-slate-500 mt-1">Recommended: Upload a dedicated 1200x630px image for best social sharing results</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 my-4"></div>

                {/* Advanced SEO */}
                <div>
                  <h4 className="font-medium text-slate-800 mb-3">Advanced SEO</h4>
                  
                  {/* Canonical URL */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <Link className="w-3 h-3 inline mr-1" />
                      Canonical URL
                    </label>
                    <Input
                      name="canonicalUrl"
                      value={formData.canonicalUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/canonical-url"
                    />
                    <p className="text-xs text-slate-500 mt-1">Use if this article has duplicate versions elsewhere</p>
                  </div>

                  {/* Robots Meta Tags */}
                  <div className="flex gap-4 mb-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="robotsNoIndex"
                        checked={formData.robotsNoIndex}
                        onChange={handleInputChange}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700">No Index</span>
                      <span className="text-xs text-slate-400">(Don't show in search results)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="robotsNoFollow"
                        checked={formData.robotsNoFollow}
                        onChange={handleInputChange}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700">No Follow</span>
                      <span className="text-xs text-slate-400">(Don't follow links)</span>
                    </label>
                  </div>
                </div>

                {/* SEO PREVIEW SECTION */}
                {showSeoPreview && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      SEO Preview
                    </h4>
                    
                    {/* Google Search Preview */}
                    <div className="mb-4 p-3 bg-white rounded border border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Google Search Result Preview</p>
                      <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                        {getAutoMetaTitle().substring(0, 60)}
                      </div>
                      <div className="text-green-700 text-sm">
                        https://yoursite.com/article/{formData.slug || 'article-slug'}
                      </div>
                      <div className="text-slate-600 text-sm">
                        {getAutoMetaDescription().substring(0, 160)}
                      </div>
                    </div>

                    {/* Social Media Preview */}
                    <div className="p-3 bg-white rounded border border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Social Media Preview (Facebook/LinkedIn)</p>
                      <div className="flex gap-3">
                        <div className="w-20 h-20 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-400 overflow-hidden">
                          {(formData.ogImagePreview || (formData.ogImage && !formData.useFeaturedAsOgImage)) ? (
                            <img 
                              src={formData.ogImagePreview || API.media.getImageUrl(formData.ogImage)} 
                              alt="OG Preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : formData.useFeaturedAsOgImage && imagePreview ? (
                            <img src={imagePreview} alt="Featured Image" className="w-full h-full object-cover" />
                          ) : (
                            'No Image'
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">
                            {formData.ogTitle || getAutoMetaTitle().substring(0, 90)}
                          </div>
                          <div className="text-sm text-slate-600">
                            {formData.ogDescription || getAutoMetaDescription().substring(0, 200)}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">yoursite.com</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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

                    {/* WORLD NEWS QUICK SELECT BUTTON */}
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

            {/* World News Management Section */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center justify-between">
                    <span>🌍 World News Management</span>
                    <button
                      type="button"
                      onClick={handleWorldNewsToggle}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${isWorldNewsEnabled ? 'bg-blue-500' : 'bg-gray-300'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${isWorldNewsEnabled ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`rounded-lg p-4 border ${isWorldNewsEnabled ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isWorldNewsEnabled ? 'text-blue-700' : 'text-gray-600'}`}>
                        {isWorldNewsEnabled ? '🌍 World News is ACTIVE' : '🌍 World News is INACTIVE'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {isWorldNewsEnabled
                          ? 'This article WILL appear in the World News section on the website'
                          : 'This article will NOT appear in the World News section'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-3">
                  <p className="text-xs text-purple-800">
                    <strong>ℹ️ How it works:</strong><br />
                    • <strong>BLUE (ON):</strong> Article will be marked as World News<br />
                    • <strong>GRAY (OFF):</strong> Article will be regular content only<br />
                    • Click the <strong>Quick Select: World News</strong> button above to automatically set this ON and select the World News category
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Live News Management Section */}
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