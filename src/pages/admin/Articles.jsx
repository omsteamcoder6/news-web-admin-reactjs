// Articles.jsx - UPDATED: Fixed draft articles not showing issue
'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from "../../layout/MainLayout";
import CreateArticleForm from '../../components/article/CreateArticleForm';
import DraftArticlesList from '../../components/article/DraftArticlesList';
import ScheduledArticlesList from '../../components/article/ScheduledArticlesList';
import PublishedArticlesList from '../../components/article/PublishedArticlesList';
import ArticlePreviewModal from '../../components/article/ArticlePreviewModal';
import API from '../../lib/mergeapi';

export default function Articles() {
  // Tab order: Published → Draft → Scheduled
  const [activeTab, setActiveTab] = useState('published');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [previewArticle, setPreviewArticle] = useState(null);

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

  // Fetch articles when activeTab changes
  useEffect(() => {
    fetchArticles();
  }, [activeTab]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching articles for tab:', activeTab);
      
      // Send status filter based on active tab
      let statusFilter = '';
      if (activeTab === 'draft') statusFilter = 'draft';
      if (activeTab === 'scheduled') statusFilter = 'scheduled';
      if (activeTab === 'published') statusFilter = 'published';
      
      console.log('Status filter being sent:', statusFilter);
      
      const response = await API.documents.getDocuments({ 
        page: 1, 
        limit: 100,
        status: statusFilter
      });
      
      console.log('API Response:', response);
      console.log('Response data:', response.data);

      let fetchedArticles = [];

      if (response.data?.data && Array.isArray(response.data.data)) {
        fetchedArticles = response.data.data;
      } else if (response.data?.documents && Array.isArray(response.data.documents)) {
        fetchedArticles = response.data.documents;
      } else if (Array.isArray(response.data)) {
        fetchedArticles = response.data;
      } else if (response.data?.data?.documents && Array.isArray(response.data.data.documents)) {
        fetchedArticles = response.data.data.documents;
      } else {
        for (let key in response.data) {
          if (Array.isArray(response.data[key])) {
            fetchedArticles = response.data[key];
            break;
          }
        }
      }

      console.log('Fetched articles count:', fetchedArticles.length);
      console.log('Fetched articles:', fetchedArticles);

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

        // Keep status as lowercase for consistent filtering
        let formattedStatus = 'draft';
        if (article.status === 'published') {
          formattedStatus = 'published';
        } else if (article.status === 'scheduled') {
          formattedStatus = 'scheduled';
        } else if (article.status === 'draft') {
          formattedStatus = 'draft';
        } else if (article.status === 'archived') {
          formattedStatus = 'archived';
        }

        return {
          id: article._id || article.id,
          _id: article._id || article.id,
          title: article.title || 'Untitled',
          category: article.category?.name || article.category || 'Uncategorized',
          categoryId: article.category?._id || article.category,
          status: formattedStatus,
          views: article.viewCount || article.views || 0,
          date: article.scheduledFor
            ? new Date(article.scheduledFor).toISOString().split('T')[0]
            : article.createdAt
              ? new Date(article.createdAt).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
          author: article.author?.name || article.author?.username || article.author || 'Unknown',
          authorId: article.author?._id || article.author,
          scheduledFor: article.scheduledFor,
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

      console.log('Transformed articles:', transformedArticles);
      console.log('Draft articles in transformed:', transformedArticles.filter(a => a.status === 'draft').length);
      
      setArticles(transformedArticles);

    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Failed to load articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArticle = async (formData) => {
    console.log('Article created successfully:', formData);
    await fetchArticles();
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
        await API.documents.deleteDocument(id);
        await fetchArticles();
      } catch (error) {
        console.error('Error deleting article:', error);
        setError(error.response?.data?.message || 'Failed to delete article.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditArticle = async (id) => {
    try {
      setLoading(true);
      const response = await API.documents.getDocument(id);
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
        scheduledFor: articleData.scheduledFor ? new Date(articleData.scheduledFor).toISOString().slice(0, 16) : '',
        excerpt: articleData.excerpt || '',
        metaDescription: articleData.metaDescription || '',
        featuredImage: featuredImageUrl,
        existingFeaturedImage: featuredImageUrl,
        settings: articleData.settings || {}
      };

      setEditingArticle(articleForEdit);
      setShowEditForm(true);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error fetching article for edit:', error);
      setError('Failed to load article for editing');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewArticle = (article) => {
    setPreviewArticle(article);
    setShowPreview(true);
  };

  const handleNewArticle = () => {
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

  // Draft-specific actions
  const handlePublishNow = async (id) => {
    try {
      await API.documents.updateDocument(id, { 
        status: 'published', 
        scheduledFor: new Date().toISOString()
      });
      await fetchArticles();
      setActiveTab('published');
    } catch (error) {
      console.error('Error publishing article:', error);
      setError('Failed to publish article');
    }
  };

  const handleSchedule = async (id, scheduleDate) => {
    try {
      await API.documents.updateDocument(id, { 
        status: 'scheduled', 
        scheduledFor: new Date(scheduleDate).toISOString()
      });
      await fetchArticles();
      setActiveTab('scheduled');
    } catch (error) {
      console.error('Error scheduling article:', error);
      setError('Failed to schedule article');
    }
  };

  // Scheduled-specific actions
  const handleMoveToDraft = async (id) => {
    try {
      await API.documents.updateDocument(id, { 
        status: 'draft', 
        scheduledFor: null
      });
      await fetchArticles();
      setActiveTab('draft');
    } catch (error) {
      console.error('Error moving to draft:', error);
      setError('Failed to move article to draft');
    }
  };

  const handleReschedule = async (id, newDate) => {
    try {
      await API.documents.updateDocument(id, { 
        scheduledFor: new Date(newDate).toISOString()
      });
      await fetchArticles();
    } catch (error) {
      console.error('Error rescheduling article:', error);
      setError('Failed to reschedule article');
    }
  };

  // Published-specific actions
  const handleUnpublish = async (id) => {
    try {
      await API.documents.updateDocument(id, { 
        status: 'draft', 
        scheduledFor: null
      });
      await fetchArticles();
      setActiveTab('draft');
    } catch (error) {
      console.error('Error unpublishing article:', error);
      setError('Failed to unpublish article');
    }
  };

  const handleViewAnalytics = (article) => {
    alert(`Analytics for: ${article.title}\nViews: ${article.views || 0}`);
  };

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
        {/* Tab Navigation - Published → Draft → Scheduled */}
        {!showCreateForm && !showEditForm && (
          <div className="flex gap-2 mb-6 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('published')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'published'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✓ Published
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
                {articles.filter(a => a.status === 'published').length}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('draft')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'draft'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📝 Draft
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
                {articles.filter(a => a.status === 'draft').length}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'scheduled'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⏰ Scheduled
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
                {articles.filter(a => a.status === 'scheduled').length}
              </span>
            </button>
          </div>
        )}

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

        {/* Show Tab Components */}
        {!showCreateForm && !showEditForm && activeTab === 'published' && (
          <PublishedArticlesList
            articles={articles}
            onNewArticle={handleNewArticle}
            onDeleteArticle={handleDeleteArticle}
            onEditArticle={handleEditArticle}
            onPreviewArticle={handlePreviewArticle}
            onUnpublish={handleUnpublish}
            onViewAnalytics={handleViewAnalytics}
          />
        )}

        {!showCreateForm && !showEditForm && activeTab === 'draft' && (
          <DraftArticlesList
            articles={articles}
            onNewArticle={handleNewArticle}
            onDeleteArticle={handleDeleteArticle}
            onEditArticle={handleEditArticle}
            onPreviewArticle={handlePreviewArticle}
            onPublishNow={handlePublishNow}
            onSchedule={handleSchedule}
          />
        )}

        {!showCreateForm && !showEditForm && activeTab === 'scheduled' && (
          <ScheduledArticlesList
            articles={articles}
            onNewArticle={handleNewArticle}
            onDeleteArticle={handleDeleteArticle}
            onEditArticle={handleEditArticle}
            onPreviewArticle={handlePreviewArticle}
            onPublishNow={handlePublishNow}
            onMoveToDraft={handleMoveToDraft}
            onReschedule={handleReschedule}
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