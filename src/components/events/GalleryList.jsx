import { useState, useEffect } from "react";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function GalleryList({ galleries, events, onEdit, onDelete, loading }) {
  const [filterEvent, setFilterEvent] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return `${IMAGE_BASE_URL}${imagePath}`;
  };

  const getEventTitle = (eventId) => {
    const event = events.find(ev => ev._id === eventId || ev.id === eventId);
    return event ? event.title : "Unassigned";
  };

  const getEventDate = (eventId) => {
    const event = events.find(ev => ev._id === eventId || ev.id === eventId);
    return event ? new Date(event.date).toLocaleDateString() : "";
  };

  // Close modal function
  const closeLightbox = () => {
    setSelectedGallery(null);
    setLightboxIndex(0);
  };

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && selectedGallery) {
        closeLightbox();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    
    // Prevent body scroll when modal is open
    if (selectedGallery) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [selectedGallery]);

  const filteredGalleries = galleries.filter(gallery => {
    if (filterEvent !== "all" && gallery.eventId !== filterEvent) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return gallery.title.toLowerCase().includes(searchLower) ||
             (gallery.caption && gallery.caption.toLowerCase().includes(searchLower));
    }
    return true;
  });

  // Calculate total stats
  const totalImages = galleries.reduce((sum, g) => sum + (g.images?.length || 0), 0);
  const totalViews = galleries.reduce((sum, g) => sum + (g.viewCount || 0), 0);

  if (loading && galleries.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading galleries...</p>
        </div>
      </div>
    );
  }

  if (galleries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500 text-lg">No galleries found</p>
        <p className="text-gray-400 mt-2">Click "Add Gallery" to create your first photo gallery</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl shadow-sm border border-orange-100 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{galleries.length}</div>
            <div className="text-xs text-gray-600">Total Galleries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{totalImages.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Total Images</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{totalViews.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Total Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {galleries.filter(g => g.status === 'active').length}
            </div>
            <div className="text-xs text-gray-600">Active Galleries</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Event</label>
            <select
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Events ({galleries.length})</option>
              <option value="unassigned">Unassigned ({galleries.filter(g => !g.eventId).length})</option>
              {events.filter(ev => ev.status === "past").map(event => {
                const count = galleries.filter(g => g.eventId === (event._id || event.id)).length;
                return count > 0 && (
                  <option key={event._id || event.id} value={event._id || event.id}>
                    {event.title} ({count})
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by title or caption..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Galleries Grid */}
      {filteredGalleries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No galleries match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGalleries.map(gallery => (
            <div key={gallery._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group">
              {/* Cover Image */}
              <div 
                className="relative h-48 bg-gray-100 cursor-pointer overflow-hidden"
                onClick={() => {
                  setSelectedGallery(gallery);
                  setLightboxIndex(0);
                }}
              >
                {gallery.coverImage ? (
                  <img 
                    src={getFullImageUrl(gallery.coverImage)} 
                    alt={gallery.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Stats Badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {gallery.images?.length || 0}
                  </div>
                  <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {gallery.viewCount?.toLocaleString() || 0}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1">
                    {gallery.title}
                  </h3>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onEdit) {
                          onEdit(gallery);
                        }
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition shadow-sm"
                      title="Edit Gallery"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onDelete) {
                          onDelete(gallery._id);
                        }
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition shadow-sm"
                      title="Delete Gallery"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {gallery.eventId && (
                  <p className="text-sm text-gray-500 mb-2">
                    📅 {getEventDate(gallery.eventId)}
                  </p>
                )}

                {gallery.caption && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {gallery.caption}
                  </p>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {getEventTitle(gallery.eventId)}
                  </span>
                  <span className="text-xs text-gray-400">
                    🕒 {new Date(gallery.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    gallery.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {gallery.status || 'active'}
                  </span>
                </div>

                {/* Thumbnail strip */}
                {gallery.images && gallery.images.length > 0 && (
                  <div className="flex gap-1 mt-3">
                    {gallery.images.slice(0, 3).map((img, idx) => (
                      <div key={idx} className="w-8 h-8 rounded bg-gray-100 overflow-hidden">
                        <img 
                          src={getFullImageUrl(img)} 
                          alt="" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/32x32?text=Error";
                          }}
                        />
                      </div>
                    ))}
                    {gallery.images.length > 3 && (
                      <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                        +{gallery.images.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedGallery && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[9999]"
          onClick={closeLightbox}
        >
          <div 
            className="relative max-w-6xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Top Right */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-red-500 text-3xl font-bold z-10 transition-colors duration-200"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              title="Close (ESC)"
            >
              ✕
            </button>

            {/* Close Button - Bottom Center */}
            <button
              onClick={closeLightbox}
              className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Close Gallery
            </button>

            {/* Main Image */}
            <div className="relative">
              <img 
                src={getFullImageUrl(selectedGallery.images[lightboxIndex] || selectedGallery.coverImage)} 
                alt={`${selectedGallery.title} - ${lightboxIndex + 1}`}
                className="w-full max-h-[80vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Found";
                }}
              />

              {/* Navigation Arrows */}
              {selectedGallery.images && selectedGallery.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(prev => prev === 0 ? selectedGallery.images.length - 1 : prev - 1);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200"
                  >
                    ◀
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(prev => prev === selectedGallery.images.length - 1 ? 0 : prev + 1);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200"
                  >
                    ▶
                  </button>
                </>
              )}
            </div>

            {/* Image Info */}
            <div className="text-center mt-4 text-white">
              <h3 className="text-xl font-semibold">{selectedGallery.title}</h3>
              {selectedGallery.caption && (
                <p className="text-gray-300 text-sm mt-1">{selectedGallery.caption}</p>
              )}
              <div className="flex justify-center gap-4 mt-2">
                <p className="text-gray-400 text-xs">
                  📷 {selectedGallery.images?.length || 0} images
                </p>
                <p className="text-gray-400 text-xs">
                  👁️ {(selectedGallery.viewCount || 0).toLocaleString()} views
                </p>
                <p className="text-gray-400 text-xs">
                  {lightboxIndex + 1} / {selectedGallery.images?.length || 1}
                </p>
              </div>
            </div>

            {/* Thumbnail strip */}
            {selectedGallery.images && selectedGallery.images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2">
                {selectedGallery.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(idx);
                    }}
                    className={`w-16 h-16 rounded overflow-hidden border-2 transition-all duration-200 ${
                      lightboxIndex === idx ? 'border-orange-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={getFullImageUrl(img)} 
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/64x64?text=Error";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}