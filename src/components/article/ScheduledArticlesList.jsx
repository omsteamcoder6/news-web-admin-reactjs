// ScheduledArticlesList.jsx - Shows only scheduled articles with VITE_IMAGE_BASE_URL
'use client';

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, FileText, Image as ImageIcon, Calendar, Send, XCircle, Clock } from 'lucide-react';

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

const CardDescription = ({ children }) => (
  <p className="text-sm text-slate-600 mt-1">{children}</p>
);

const CardContent = ({ children }) => (
  <div className="px-6 py-4">
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "default", className = "", disabled = false }) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2";
  const variants = {
    default: "bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-300",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:bg-slate-100",
    danger: "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300",
    ghost: "text-slate-600 hover:bg-slate-100 disabled:text-slate-400",
    success: "bg-green-500 text-white hover:bg-green-600"
  };
  return (
    <button
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

const getAuthorName = (author) => {
  if (!author) return 'Unknown Author';
  if (typeof author === 'string') return author;
  if (author.name) return author.name;
  if (author.fullName) return author.fullName;
  if (author.username) return author.username;
  return 'Unknown Author';
};

const getCategoryName = (category) => {
  if (!category) return 'Uncategorized';
  if (typeof category === 'string') return category;
  if (category.name) return category.name;
  return 'Uncategorized';
};

// Updated helper function to get full image URL using VITE_IMAGE_BASE_URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already an absolute URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Get the image base URL from environment variable
  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;
  
  if (!imageBaseUrl) {
    console.warn('VITE_IMAGE_BASE_URL is not defined. Please check your .env file');
    // Fallback: serve from same origin
    return `${window.location.origin}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  }
  
  // Remove trailing slash from image base URL if present
  const baseUrl = imageBaseUrl.replace(/\/$/, '');
  
  // Ensure image path starts with / (if needed)
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${baseUrl}${normalizedPath}`;
};

const formatScheduledDate = (dateString) => {
  if (!dateString) return 'Date not set';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getTimeRemaining = (dateString) => {
  if (!dateString) return '';
  const scheduled = new Date(dateString);
  const now = new Date();
  const diff = scheduled - now;
  
  if (diff <= 0) return 'Should have published';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `in ${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
  if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
  return 'very soon';
};

export default function ScheduledArticlesList({ 
  articles, 
  onNewArticle, 
  onDeleteArticle, 
  onEditArticle, 
  onPreviewArticle,
  onPublishNow,
  onMoveToDraft,
  onReschedule 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [showRescheduleModal, setShowRescheduleModal] = useState(null);
  const [newScheduleDate, setNewScheduleDate] = useState('');

  // Filter only scheduled articles
  const scheduledArticles = Array.isArray(articles) 
    ? articles.filter(article => article.status === 'Scheduled' || article.status === 'scheduled')
    : [];

  const filteredArticles = scheduledArticles.filter(article => {
    if (!article) return false;
    
    const title = article.title || '';
    const authorName = getAuthorName(article.author);
    const categoryName = getCategoryName(article.category);
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          authorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || categoryName === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = ['All Categories', ...new Set(
    scheduledArticles.map(article => getCategoryName(article.category)).filter(Boolean)
  )];

  const handleDeleteClick = (id) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async (id) => {
    setDeletingId(id);
    await onDeleteArticle(id);
    setDeletingId(null);
    setShowDeleteConfirm(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const handleEditClick = (id) => {
    if (onEditArticle) {
      onEditArticle(id);
    }
  };

  const handlePreviewClick = (article) => {
    if (onPreviewArticle) {
      onPreviewArticle(article);
    }
  };

  const handlePublishNow = (id) => {
    if (onPublishNow) {
      onPublishNow(id);
    }
  };

  const handleMoveToDraft = (id) => {
    if (onMoveToDraft) {
      onMoveToDraft(id);
    }
  };

  const handleRescheduleClick = (article) => {
    setShowRescheduleModal(article._id || article.id);
    const currentDate = article.publishDate || article.scheduledDate;
    if (currentDate) {
      setNewScheduleDate(new Date(currentDate).toISOString().slice(0, 16));
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0);
      setNewScheduleDate(tomorrow.toISOString().slice(0, 16));
    }
  };

  const confirmReschedule = async (id) => {
    if (onReschedule && newScheduleDate) {
      await onReschedule(id, newScheduleDate);
      setShowRescheduleModal(null);
      setNewScheduleDate('');
    }
  };

  const cancelReschedule = () => {
    setShowRescheduleModal(null);
    setNewScheduleDate('');
  };

  const handleImageError = (articleId, imageUrl) => {
    console.error('Image failed to load for article:', articleId, 'URL:', imageUrl);
    setImageErrors(prev => ({ ...prev, [articleId]: true }));
  };

  if (!scheduledArticles.length) {
    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Scheduled Articles</h2>
            <p className="text-slate-600 mt-1">Articles scheduled for future publication</p>
          </div>
          <Button onClick={onNewArticle}>
            <Plus className="w-4 h-4" />
            New Article
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-slate-500">No scheduled articles found. Create a draft and schedule it for later.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Scheduled Articles</h2>
          <p className="text-slate-600 mt-1">Articles scheduled for future publication</p>
        </div>
        <Button onClick={onNewArticle}>
          <Plus className="w-4 h-4" />
          New Article
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search scheduled articles by title or author..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Scheduled Articles</CardTitle>
              <CardDescription>Total scheduled: {filteredArticles.length}</CardDescription>
            </div>
            <div className="text-sm text-slate-500">
              Showing {filteredArticles.length} scheduled articles
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Image</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Author</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Scheduled For</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Time Remaining</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article, index) => {
                  const articleId = article._id || article.id;
                  const isDeleting = deletingId === articleId;
                  const showConfirm = showDeleteConfirm === articleId;
                  const showReschedule = showRescheduleModal === articleId;
                  const hasImageError = imageErrors[articleId];
                  const imageUrl = getFullImageUrl(article.featuredImage);
                  const scheduledDate = article.publishDate || article.scheduledDate;
                  
                  return (
                    <tr key={articleId || index} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-4 py-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                          {imageUrl && !hasImageError ? (
                            <img 
                              src={imageUrl}
                              alt={article.title || 'Article image'}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(articleId, imageUrl)}
                              onLoad={() => console.log('Image loaded successfully:', imageUrl)}
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-900 font-medium">
                        {article.title || 'Untitled'}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {getCategoryName(article.category)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {getAuthorName(article.author)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Scheduled
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatScheduledDate(scheduledDate)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`font-medium ${new Date(scheduledDate) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                          {getTimeRemaining(scheduledDate)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {showReschedule ? (
                          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ position: 'fixed' }}>
                            <div className="bg-white rounded-lg p-6 w-96">
                              <h3 className="text-lg font-semibold mb-4">Reschedule Article</h3>
                              <input
                                type="datetime-local"
                                value={newScheduleDate}
                                onChange={(e) => setNewScheduleDate(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg mb-4"
                              />
                              <div className="flex gap-2 justify-end">
                                <button onClick={cancelReschedule} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                                  Cancel
                                </button>
                                <button onClick={() => confirmReschedule(articleId)} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
                                  Update Schedule
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : showConfirm ? (
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                              onClick={() => confirmDelete(articleId)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? '...' : 'Confirm'}
                            </button>
                            <button 
                              className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition"
                              onClick={cancelDelete}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              className="p-2 hover:bg-slate-100 rounded transition"
                              onClick={() => handlePreviewClick(article)}
                              title="Preview article"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                            <button 
                              className="p-2 hover:bg-slate-100 rounded transition"
                              onClick={() => handleEditClick(articleId)}
                              title="Edit article"
                            >
                              <Edit2 className="w-4 h-4 text-slate-600" />
                            </button>
                            <button 
                              className="p-2 hover:bg-green-100 rounded transition"
                              onClick={() => handlePublishNow(articleId)}
                              title="Publish now (override schedule)"
                            >
                              <Send className="w-4 h-4 text-green-600" />
                            </button>
                            <button 
                              className="p-2 hover:bg-purple-100 rounded transition"
                              onClick={() => handleRescheduleClick(article)}
                              title="Reschedule"
                            >
                              <Calendar className="w-4 h-4 text-purple-600" />
                            </button>
                            <button 
                              className="p-2 hover:bg-yellow-100 rounded transition"
                              onClick={() => handleMoveToDraft(articleId)}
                              title="Move to draft"
                            >
                              <XCircle className="w-4 h-4 text-yellow-600" />
                            </button>
                            <button 
                              className="p-2 hover:bg-red-100 rounded transition"
                              onClick={() => handleDeleteClick(articleId)}
                              title="Delete article"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredArticles.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No scheduled articles match your filters
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}