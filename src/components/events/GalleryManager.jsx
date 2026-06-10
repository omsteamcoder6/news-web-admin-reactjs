import { useState, useEffect } from "react";
import GalleryForm from "./GalleryForm";
import GalleryList from "./GalleryList";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function GalleryManager({ events, token, onUpdate }) {
  const [galleries, setGalleries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGallery, setEditingGallery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const fetchGalleries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/gallery-events`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setGalleries(data.data);
      } else {
        setError(data.message || 'Failed to fetch galleries');
      }
    } catch (error) {
      console.error('Error fetching galleries:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGallery = async (galleryData) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (editingGallery) {
        response = await fetch(`${API_BASE_URL}/gallery-events/${editingGallery._id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(galleryData)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/gallery-events`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(galleryData)
        });
      }

      const data = await response.json();
      if (data.success) {
        await fetchGalleries();
        setShowForm(false);
        setEditingGallery(null);
        setSelectedEventId(null);
        setActiveTab("list");
        if (onUpdate) onUpdate();
        alert(editingGallery ? "Gallery updated successfully!" : "Gallery created successfully!");
      } else {
        setError(data.message || 'Failed to save gallery');
        alert(data.message || 'Failed to save gallery');
      }
    } catch (error) {
      console.error('Error saving gallery:', error);
      setError(error.message);
      alert('Error saving gallery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGallery = async (galleryId) => {
    if (!window.confirm("Are you sure you want to delete this gallery? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/gallery-events/${galleryId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (data.success) {
        await fetchGalleries();
        if (onUpdate) onUpdate();
        alert("Gallery deleted successfully!");
      } else {
        setError(data.message || 'Failed to delete gallery');
        alert(data.message || 'Failed to delete gallery');
      }
    } catch (error) {
      console.error('Error deleting gallery:', error);
      setError(error.message);
      alert('Error deleting gallery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditGallery = (gallery) => {
    console.log("Editing gallery:", gallery);
    setEditingGallery(gallery);
    setShowForm(true);
    setActiveTab("add");
  };

  const handleAddGallery = (eventId = null) => {
    setSelectedEventId(eventId);
    setEditingGallery(null);
    setShowForm(true);
    setActiveTab("add");
  };

  useEffect(() => {
    if (token) {
      fetchGalleries();
    }
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Event Galleries</h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage photo galleries for events
            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full">
              {galleries.length} galleries
            </span>
          </p>
        </div>
        <button
          onClick={() => handleAddGallery()}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Gallery
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab("list")}
            className={`pb-3 px-1 text-sm font-medium transition relative ${
              activeTab === "list"
                ? "text-orange-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            All Galleries
            {galleries.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-100 rounded-full">
                {galleries.length}
              </span>
            )}
            {activeTab === "list" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`pb-3 px-1 text-sm font-medium transition relative ${
              activeTab === "add"
                ? "text-orange-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Gallery
            {activeTab === "add" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></span>
            )}
          </button>
        </nav>
      </div>

      {activeTab === "list" && (
        <GalleryList
          galleries={galleries}
          events={events}
          onEdit={handleEditGallery}
          onDelete={handleDeleteGallery}
          loading={loading}
        />
      )}

      {activeTab === "add" && showForm && (
        <GalleryForm
          gallery={editingGallery}
          event={events.find(ev => ev._id === selectedEventId || ev.id === selectedEventId)}
          onSave={handleSaveGallery}
          onClose={() => {
            setShowForm(false);
            setEditingGallery(null);
            setSelectedEventId(null);
            setActiveTab("list");
          }}
        />
      )}

      {activeTab === "add" && !showForm && (
        <div className="text-center py-12">
          <button
            onClick={() => handleAddGallery()}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Click here to add a new gallery
          </button>
        </div>
      )}
    </div>
  );
}