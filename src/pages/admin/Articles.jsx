// Articles.jsx - Fixed to always show New Article button and handle form rendering properly
'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from "../../layout/MainLayout";
import CreateArticleForm from '../../components/article/CreateArticleForm';
import ArticlesList from '../../components/article/ArticlesList';
import ArticlePreviewModal from '../../components/article/ArticlePreviewModal';
import API from '../../lib/mergeapi';

export default function Articles() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [previewArticle, setPreviewArticle] = useState(null);

  // IMPROVED: Better image URL handling
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return API.media.getImageUrl(imagePath);
    }
    
    return API.media.getImageUrl(`/${imagePath}`);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching all articles from API...');
      
      const response = await API.documents.getDocuments({ page: 1 });
      console.log('API Response:', response);

      let fetchedArticles = [];

      if (response.data?.data && Array.isArray(response.data.data)) {
        fetchedArticles = response.data.data;
        console.log('Found documents in response.data.data:', fetchedArticles.length);
      } else if (response.data?.documents && Array.isArray(response.data.documents)) {
        fetchedArticles = response.data.documents;
        console.log('Found documents in response.data.documents:', fetchedArticles.length);
      } else if (Array.isArray(response.data)) {
        fetchedArticles = response.data;
        console.log('Found documents in response.data array:', fetchedArticles.length);
      } else if (response.data?.data?.documents && Array.isArray(response.data.data.documents)) {
        fetchedArticles = response.data.data.documents;
        console.log('Found documents in response.data.data.documents:', fetchedArticles.length);
      } else {
        console.warn('Unknown response structure:', response);
        for (let key in response.data) {
          if (Array.isArray(response.data[key])) {
            fetchedArticles = response.data[key];
            console.log(`Found array in response.data.${key}:`, fetchedArticles.length);
            break;
          }
        }
      }

      console.log('Raw fetched articles count:', fetchedArticles.length);
      
      const transformedArticles = fetchedArticles.map(article => {
        let featuredImageUrl = null;

        if (article.featuredImage) {
          if (typeof article.featuredImage === 'string') {
            featuredImageUrl = getImageUrl(article.featuredImage);
          } else if (article.featuredImage.url) {
            featuredImageUrl = getImageUrl(article.featuredImage.url);
          } else if (article.featuredImage.path) {
            featuredImageUrl = getImageUrl(article.featuredImage.path);
          }
        }

        let formattedStatus = 'Draft';
        if (article.status === 'published') {
          formattedStatus = 'Published';
        } else if (article.status === 'scheduled') {
          formattedStatus = 'Scheduled';
        } else if (article.status === 'draft') {
          formattedStatus = 'Draft';
        } else if (article.status === 'archived') {
          formattedStatus = 'Archived';
        } else {
          formattedStatus = article.status || 'Draft';
        }

        return {
          id: article._id || article.id,
          _id: article._id || article.id,
          title: article.title || 'Untitled',
          category: article.category?.name || article.category || 'Uncategorized',
          categoryId: article.category?._id || article.category,
          status: formattedStatus,
          views: article.viewCount || article.views || 0,
          date: article.publishDate
            ? new Date(article.publishDate).toISOString().split('T')[0]
            : article.createdAt
              ? new Date(article.createdAt).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
          author: article.author?.name || article.author?.username || article.author || 'Unknown',
          authorId: article.author?._id || article.author,
          publishDate: article.publishDate ? new Date(article.publishDate).toLocaleDateString() : null,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
          content: article.content,
          slug: article.slug,
          tags: article.tags,
          featuredImage: featuredImageUrl,
          excerpt: article.excerpt,
          settings: article.settings
        };
      });

      console.log('Transformed articles count:', transformedArticles.length);
      
      setArticles(transformedArticles);

      if (transformedArticles.length === 0) {
        console.log('No articles found in database');
      }

    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Failed to load articles. Please try again later.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArticle = async (formData) => {
    console.log('Article created successfully:', formData);
    await fetchArticles();
    // Close the form and show the articles list
    setShowCreateForm(false);
    setShowEditForm(false);
  };

  const handleUpdateArticle = async (formData) => {
    console.log('Article updated successfully:', formData);
    await fetchArticles();
    setShowEditForm(false);
    setEditingArticle(null);
    setShowCreateForm(false);
  };

  const handleDeleteArticle = async (id) => {
    if (confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      try {
        setLoading(true);
        console.log('Deleting article with ID:', id);
        await API.documents.deleteDocument(id);
        console.log('Delete successful');
        await fetchArticles();
      } catch (error) {
        console.error('Error deleting article:', error);
        setError(error.response?.data?.message || 'Failed to delete article. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditArticle = async (id) => {
    console.log('Edit article:', id);
    try {
      setLoading(true);
      const response = await API.documents.getDocument(id);
      console.log('Fetched article for edit:', response);

      let articleData = response.data?.data || response.data;

      let featuredImageUrl = null;
      if (articleData.featuredImage) {
        if (typeof articleData.featuredImage === 'string') {
          featuredImageUrl = getImageUrl(articleData.featuredImage);
        } else if (articleData.featuredImage.url) {
          featuredImageUrl = getImageUrl(articleData.featuredImage.url);
        }
      }

      const articleForEdit = {
        _id: articleData._id || articleData.id,
        id: articleData._id || articleData.id,
        title: articleData.title || '',
        slug: articleData.slug || '',
        content: articleData.content || '',
        status: articleData.status === 'published' ? 'published' :
                articleData.status === 'scheduled' ? 'scheduled' : 'draft',
        category: articleData.category?._id || articleData.category || '',
        author: articleData.author?._id || articleData.author || '',
        tags: Array.isArray(articleData.tags) ? articleData.tags.join(', ') : (articleData.tags || ''),
        publishDate: articleData.publishDate ? new Date(articleData.publishDate).toISOString().slice(0, 16) : '',
        excerpt: articleData.excerpt || '',
        metaDescription: articleData.metaDescription || '',
        featuredImage: featuredImageUrl,
        existingFeaturedImage: featuredImageUrl,
        settings: articleData.settings || {}
      };

      setEditingArticle(articleForEdit);
      setShowEditForm(true);
      setShowCreateForm(false); // Ensure create form is closed
    } catch (error) {
      console.error('Error fetching article for edit:', error);
      setError(error.response?.data?.message || 'Failed to load article for editing');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewArticle = (article) => {
    console.log('Preview article:', article);
    setPreviewArticle(article);
    setShowPreview(true);
  };

  const handleNewArticle = () => {
    // Reset all states and show the create form
    setShowCreateForm(true);
    setShowEditForm(false);
    setEditingArticle(null);
    setError(null);
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingArticle(null);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewArticle(null);
  };

  // If loading and no articles
  if (loading && articles.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-slate-600 mt-4">Loading articles...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Show Create Form */}
        {showCreateForm && (
          <CreateArticleForm
            onSubmit={handleCreateArticle}
            onCancel={handleCancelForm}
            initialData={null}
            isEditing={false}
          />
        )}

        {/* Show Edit Form */}
        {showEditForm && editingArticle && (
          <CreateArticleForm
            onSubmit={handleUpdateArticle}
            onCancel={handleCancelForm}
            initialData={editingArticle}
            isEditing={true}
          />
        )}

        {/* Show Articles List - Only when NO form is showing */}
        {!showCreateForm && !showEditForm && (
          <ArticlesList
            articles={articles}
            onNewArticle={handleNewArticle}
            onDeleteArticle={handleDeleteArticle}
            onEditArticle={handleEditArticle}
            onPreviewArticle={handlePreviewArticle}
          />
        )}

        {/* Show Preview Modal */}
        {showPreview && previewArticle && (
          <ArticlePreviewModal
            article={previewArticle}
            onClose={handleClosePreview}
          />
        )}

        {/* Error Display */}
        {error && !showCreateForm && !showEditForm && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchArticles}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}