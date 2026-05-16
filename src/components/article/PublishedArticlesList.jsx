// PublishedArticlesList.jsx - Shows only published articles with World News support
'use client';

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, FileText, Image as ImageIcon, Calendar, Archive, TrendingUp, Globe } from 'lucide-react';

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
    ghost: "text-slate-600 hover:bg-slate-100 disabled:text-slate-400"
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

const formatDate = (raw) => {
  if (!raw) return '-';
  try {
    return new Date(raw).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return raw;
  }
};

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;

  const imageBaseUrl = (import.meta.env.VITE_IMAGE_BASE_URL || '').replace(/\/$/, '');

  if (imagePath.startsWith('http://localhost') || imagePath.startsWith('https://localhost')) {
    try {
      const url = new URL(imagePath);
      const cleanPath = url.pathname;
      return imageBaseUrl ? `${imageBaseUrl}${cleanPath}` : imagePath;
    } catch {
      return imagePath;
    }
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  if (!imageBaseUrl) {
    console.warn('VITE_IMAGE_BASE_URL is not defined. Please check your .env file');
    return `${window.location.origin}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  }

  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${imageBaseUrl}${normalizedPath}`;
};

export default function PublishedArticlesList({ 
  articles, 
  onNewArticle, 
  onDeleteArticle, 
  onEditArticle, 
  onPreviewArticle,
  onUnpublish,
  onViewAnalytics,
  onToggleWorldNews  // ✅ NEW: World News toggle handler
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [worldNewsFilter, setWorldNewsFilter] = useState('All'); // ✅ NEW: All, World News Only, Regular Only
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const publishedArticles = Array.isArray(articles) 
    ? articles.filter(article => article.status === 'Published' || article.status === 'published')
    : [];

  const filteredArticles = publishedArticles.filter(article => {
    if (!article) return false;
    
    const title = article.title || '';
    const authorName = getAuthorName(article.author);
    const categoryName = getCategoryName(article.category);
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          authorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || categoryName === categoryFilter;
    
    // ✅ NEW: World News filter
    let matchesWorldNews = true;
    if (worldNewsFilter === 'World News Only') {
      matchesWorldNews = article.isWorldNews === true;
    } else if (worldNewsFilter === 'Regular Only') {
      matchesWorldNews = article.isWorldNews !== true;
    }
    
    return matchesSearch && matchesCategory && matchesWorldNews;
  });

  const uniqueCategories = ['All Categories', ...new Set(
    publishedArticles.map(article => getCategoryName(article.category)).filter(Boolean)
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

  const handleUnpublish = (id) => {
    if (onUnpublish) {
      onUnpublish(id);
    }
  };

  const handleViewAnalytics = (article) => {
    if (onViewAnalytics) {
      onViewAnalytics(article);
    }
  };

  // ✅ NEW: Toggle World News
  const handleToggleWorldNews = (id, currentStatus) => {
    if (onToggleWorldNews) {
      onToggleWorldNews(id, !currentStatus);
    }
  };

  const handleImageError = (articleId, imageUrl) => {
    console.error('Image failed to load for article:', articleId, 'URL:', imageUrl);
    setImageErrors(prev => ({ ...prev, [articleId]: true }));
  };

  if (!publishedArticles.length) {
    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Published Articles</h2>
            <p className="text-slate-600 mt-1">Articles that are live on your website</p>
          </div>
          <Button onClick={onNewArticle}>
            <Plus className="w-4 h-4" />
            New Article
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-slate-500">No published articles found. Publish a draft to see it here.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Published Articles</h2>
          <p className="text-slate-600 mt-1">Articles that are live on your website</p>
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
                placeholder="Search published articles by title or author..."
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
            {/* ✅ NEW: World News Filter Dropdown */}
            <select 
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={worldNewsFilter}
              onChange={(e) => setWorldNewsFilter(e.target.value)}
            >
              <option value="All">All Articles</option>
              <option value="World News Only">🌍 World News Only</option>
              <option value="Regular Only">Regular Only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Published Articles</CardTitle>
              <CardDescription>Total published: {filteredArticles.length}</CardDescription>
            </div>
            <div className="text-sm text-slate-500">
              Showing {filteredArticles.length} published articles
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
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">World News</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Views</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Published Date</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article, index) => {
                  const articleId = article._id || article.id;
                  const isDeleting = deletingId === articleId;
                  const showConfirm = showDeleteConfirm === articleId;
                  const hasImageError = imageErrors[articleId];
                  const imageUrl = getFullImageUrl(
                    article.featuredImage ||
                    article.image ||
                    article.thumbnail ||
                    article.coverImage ||
                    article.imageUrl
                  );
                  
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
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Published
                        </span>
                      </td>
                      {/* ✅ NEW: World News Badge and Toggle */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggleWorldNews(articleId, article.isWorldNews)}
                          className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 mx-auto ${
                            article.isWorldNews 
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                          title={article.isWorldNews ? 'Remove from World News' : 'Mark as World News'}
                        >
                          <Globe className="w-3 h-3" />
                          {article.isWorldNews ? 'World News' : 'Mark'}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-600">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">{(article.views || 0).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {formatDate(article.publishDate || article.createdAt || article.date)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {showConfirm ? (
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
                              className="p-2 hover:bg-purple-100 rounded transition"
                              onClick={() => handleViewAnalytics(article)}
                              title="View analytics"
                            >
                              <TrendingUp className="w-4 h-4 text-purple-600" />
                            </button>
                            <button 
                              className="p-2 hover:bg-yellow-100 rounded transition"
                              onClick={() => handleUnpublish(articleId)}
                              title="Unpublish (move to draft)"
                            >
                              <Archive className="w-4 h-4 text-yellow-600" />
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
                No published articles match your filters
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}