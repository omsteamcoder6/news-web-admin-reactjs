// GalleryList.jsx
import { useState, useEffect } from 'react';
import { getAllCategories } from '../../data/categories';
import CreateGalleryModal from './CreateGalleryModal';

export default function GalleryList({ 
  filterCategory, 
  filterDate, 
  onFilterChange,
  token,
  API_BASE_URL
}) {
  const [galleryItems, setGalleryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(filterCategory || '');
  const [selectedDate, setSelectedDate] = useState(filterDate || '');
  const [viewMode, setViewMode] = useState('grid');
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Load categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/gallery/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCategoryList(data.data || getAllCategories());
        } else {
          setCategoryList(getAllCategories());
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoryList(getAllCategories());
      }
    };
    fetchCategories();
  }, [API_BASE_URL, token]);

  // Load gallery items from API
  const loadGalleryItems = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/gallery`
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedDate) params.append('date', selectedDate)
      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch gallery items')
      }
      
      const result = await response.json()
      setGalleryItems(result.data || [])
    } catch (error) {
      console.error('Error loading gallery items:', error)
      setGalleryItems([])
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    loadGalleryItems();
  }, [selectedCategory, selectedDate]);

  // Filter items locally (already filtered by API)
  useEffect(() => {
    setFilteredItems(galleryItems);
  }, [galleryItems]);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    if (onFilterChange?.setFilterCategory) {
      onFilterChange.setFilterCategory(value);
    }
  };

  const handleDateChange = (value) => {
    setSelectedDate(value);
    if (onFilterChange?.setFilterDate) {
      onFilterChange.setFilterDate(value);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedDate('');
    if (onFilterChange?.setFilterCategory) {
      onFilterChange.setFilterCategory('');
    }
    if (onFilterChange?.setFilterDate) {
      onFilterChange.setFilterDate('');
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete item');
        }
        
        loadGalleryItems();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const handleEditItem = (item) => {
    console.log('Edit button clicked, item:', item);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    console.log('Add New button clicked');
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    console.log('Modal closed');
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleGallerySaved = () => {
    console.log('Gallery saved, refreshing list');
    loadGalleryItems();
    handleModalClose();
  };

  const getUniqueDates = () => {
    const dates = [...new Set(galleryItems.map(item => item.date))];
    return dates.sort().reverse();
  };

  // Build a full, loadable URL for an image path returned by the API.
  // Handles cases where the backend returns:
  //  - a full URL (http://... or https://...) -> used as-is
  //  - a data/blob URL -> used as-is
  //  - a relative path (e.g. "/uploads/gallery/xyz.jpg") -> prefixed with the API server's origin
  const getImageUrl = (path) => {
    if (!path) return '';
    if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
      return path;
    }
    // API_BASE_URL is often like "https://api.example.com/api" - strip a trailing /api
    // so we get the server root that actually serves the uploaded files.
    const serverRoot = (API_BASE_URL || '').replace(/\/api\/?$/, '');
    return `${serverRoot}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f1f5f9"/><text x="50" y="55" font-size="30" text-anchor="middle" fill="#94a3b8">🖼️</text></svg>`
    );
  };

  const getCategoryColor = (categoryName) => {
    const colors = {
      'Events': 'bg-purple-100 text-purple-700',
      'Arts': 'bg-pink-100 text-pink-700',
      'Literature': 'bg-indigo-100 text-indigo-700',
      'Culture': 'bg-amber-100 text-amber-700',
      'Workshop': 'bg-emerald-100 text-emerald-700',
      'Community': 'bg-cyan-100 text-cyan-700'
    };
    return colors[categoryName] || 'bg-blue-100 text-blue-700';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center text-gray-500">Loading gallery items...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Simple Filter Bar */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">All</option>
                {categoryList.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Date:</span>
              <select
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">All</option>
                {getUniqueDates().map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            {(selectedCategory || selectedDate) && (
              <button
                onClick={handleResetFilters}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Reset ✕
              </button>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Add New Button */}
            <button
              onClick={handleAddNew}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New
            </button>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="px-5 pt-3 pb-2 text-xs text-gray-400">
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
        </div>

        {/* Gallery Display */}
        <div className="p-5 pt-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🖼️</div>
              <p className="text-gray-400 text-sm">No images found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id || item._id} className="group relative">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img 
                      src={getImageUrl(item.imageUrl || item.image)} 
                      alt={item.altText}
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.isFeatured && (
                      <span className="absolute top-2 right-2 bg-amber-400 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        ★
                      </span>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditItem(item);
                        }}
                        className="bg-black/50 text-white p-1 rounded-full hover:bg-blue-500 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id || item._id);
                        }}
                        className="bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 truncate">{item.title || item.altText}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div key={item.id || item._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <img 
                    src={getImageUrl(item.imageUrl || item.image)} 
                    alt={item.altText}
                    onError={handleImageError}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{item.title || item.altText}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                      {item.photographer && (
                        <span className="text-[10px] text-gray-400">📸 {item.photographer}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditItem(item)}
                      className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id || item._id)}
                      className="text-gray-300 hover:text-red-400 transition-colors p-1"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <CreateGalleryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onGallerySaved={handleGallerySaved}
        editingItem={editingItem}
        token={token}
        API_BASE_URL={API_BASE_URL}
      />
    </>
  );
}