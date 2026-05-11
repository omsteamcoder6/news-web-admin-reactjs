// ArticlesList.jsx - Complete Updated Version with VITE_IMAGE_BASE_URL
'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, AlertTriangle, FileText, Image as ImageIcon } from 'lucide-react';

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

// Helper function to safely get author name
const getAuthorName = (author) => {
  if (!author) return 'Unknown Author';
  if (typeof author === 'string') return author;
  if (author.name) return author.name;
  if (author.fullName) return author.fullName;
  if (author.username) return author.username;
  return 'Unknown Author';
};

// Helper function to safely get category name
const getCategoryName = (category) => {
  if (!category) return 'Uncategorized';
  if (typeof category === 'string') return category;
  if (category.name) return category.name;
  return 'Uncategorized';
};

// ✅ FIXED: Helper function to format ISO date strings into readable dates
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

// ✅ FIXED: Helper function to get full image URL using VITE_IMAGE_BASE_URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;

  const imageBaseUrl = (import.meta.env.VITE_IMAGE_BASE_URL || '').replace(/\/$/, '');

  // If it's a localhost URL, strip the old host and rebuild with VITE_IMAGE_BASE_URL
  // This fixes cases where images were saved with a different port (e.g. 3001 vs 3002)
  if (imagePath.startsWith('http://localhost') || imagePath.startsWith('https://localhost')) {
    try {
      const url = new URL(imagePath);
      const cleanPath = url.pathname; // e.g. /uploads/images/filename.avif
      return imageBaseUrl ? `${imageBaseUrl}${cleanPath}` : imagePath;
    } catch {
      return imagePath;
    }
  }

  // If it's already a non-localhost absolute URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Relative path — prepend base URL
  if (!imageBaseUrl) {
    console.warn('VITE_IMAGE_BASE_URL is not defined. Please check your .env file');
    return `${window.location.origin}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  }

  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${imageBaseUrl}${normalizedPath}`;
};

export default function ArticlesList({ articles, onNewArticle, onDeleteArticle, onEditArticle, onPreviewArticle }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  // Debug: Log the articles data to see what we're getting
  useEffect(() => {
    console.log('ArticlesList received articles:', articles);
    console.log('Articles count:', articles?.length);
    console.log('VITE_IMAGE_BASE_URL:', import.meta.env.VITE_IMAGE_BASE_URL);
    if (articles && articles.length > 0) {
      console.log('First article structure:', articles[0]);
      console.log('First article image path:', articles[0].featuredImage);
      console.log('First article full image URL:', getFullImageUrl(articles[0].featuredImage));
    }
  }, [articles]);

  // Ensure articles is always an array
  const articlesArray = Array.isArray(articles) ? articles : [];

  const filteredArticles = articlesArray.filter(article => {
    if (!article) return false;
    
    const title = article.title || '';
    const authorName = getAuthorName(article.author);
    const categoryName = getCategoryName(article.category);
    const status = article.status || '';
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          authorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || status === statusFilter;
    const matchesCategory = categoryFilter === 'All Categories' || categoryName === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const uniqueCategories = ['All Categories', ...new Set(
    articlesArray.map(article => getCategoryName(article.category)).filter(Boolean)
  )];

  const uniqueStatuses = ['All Status', ...new Set(
    articlesArray.map(article => article.status).filter(Boolean)
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
    console.log('Edit clicked for article:', id);
    if (onEditArticle) {
      onEditArticle(id);
    }
  };

  const handlePreviewClick = (article) => {
    console.log('Preview clicked for article:', article);
    if (onPreviewArticle) {
      onPreviewArticle(article);
    }
  };

  const handleImageError = (articleId, imageUrl) => {
    console.error('Image failed to load for article:', articleId, 'URL:', imageUrl);
    setImageErrors(prev => ({ ...prev, [articleId]: true }));
  };

  if (!articlesArray.length) {
    return (
      <>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Articles Management</h1>
            <p className="text-slate-600 mt-2">Manage all your news articles here</p>
          </div>
          <Button onClick={onNewArticle}>
            <Plus className="w-4 h-4" />
            New Article
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-slate-500">No articles found. Click "New Article" to create your first article.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Articles Management</h1>
          <p className="text-slate-600 mt-2">Manage all your news articles here</p>
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
                placeholder="Search articles by title or author..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
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
              <CardTitle>All Articles</CardTitle>
              <CardDescription>Total: {filteredArticles.length} articles</CardDescription>
            </div>
            <div className="text-sm text-slate-500">
              Showing all {filteredArticles.length} articles
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
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Views</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Date</th>
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
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          article.status === 'Published' ? 'bg-green-100 text-green-800' :
                          article.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                          article.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                          article.status === 'Archived' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {article.status || 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-600">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">{(article.views || 0).toLocaleString()}</span>
                        </div>
                      </td>
                      {/* ✅ FIXED: Format ISO date string to readable date */}
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
                              <FileText className="w-4 h-4 text-blue-600" />
                            </button>
                            <button 
                              className="p-2 hover:bg-slate-100 rounded transition"
                              onClick={() => handleEditClick(articleId)}
                              title="Edit article"
                            >
                              <Edit2 className="w-4 h-4 text-slate-600" />
                            </button>
                            <button 
                              className="p-2 hover:bg-red-50 rounded transition"
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
                No articles match your filters
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}