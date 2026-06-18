// PastGalleryManager.jsx
import { useState, useEffect } from "react";
import PastGalleryForm from "./PastGalleryForm";
import PastGalleryList from "./PastGalleryList";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function PastGalleryManager({ events, token, onUpdate }) {
  const [pastGalleries, setPastGalleries] = useState([]);
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

  const fetchPastGalleries = async () => {
    if (!token) {
      console.log("⛔ No token available, skipping fetch");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/past-galleries`, {
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (data.success) {
        // Filter to only show past galleries
        const filtered = data.data.filter(gallery => {
          if (gallery.status === "past") return true;
          if (gallery.eventId) {
            const event = events.find(ev => ev._id === gallery.eventId || ev.id === gallery.eventId);
            return event && event.status === "past";
          }
          return false;
        });
        setPastGalleries(filtered);
      } else {
        setError(data.message || 'Failed to fetch past galleries');
      }
    } catch (error) {
      console.error('Error fetching past galleries:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGallery = async (galleryData) => {
    if (!token) {
      alert('Please log in to save galleries');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const dataToSave = {
        ...galleryData,
        status: "past"
      };

      const url = editingGallery 
        ? `${API_BASE_URL}/past-galleries/${editingGallery._id}`
        : `${API_BASE_URL}/past-galleries`;
      
      const method = editingGallery ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSave)
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchPastGalleries();
        setShowForm(false);
        setEditingGallery(null);
        setSelectedEventId(null);
        setActiveTab("list");
        if (onUpdate) onUpdate();
        alert(editingGallery ? "Past gallery updated successfully!" : "Past gallery created successfully!");
      } else {
        setError(data.message || 'Failed to save gallery');
        alert(data.message || 'Error saving gallery. Please try again.');
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
    if (!window.confirm("Are you sure you want to delete this past gallery? This action cannot be undone.")) {
      return;
    }

    if (!token) {
      alert('Please log in to delete galleries');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/past-galleries/${galleryId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchPastGalleries();
        if (onUpdate) onUpdate();
        alert("Past gallery deleted successfully!");
      } else {
        setError(data.message || 'Failed to delete gallery');
        alert(data.message || 'Error deleting gallery. Please try again.');
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
    console.log("Editing past gallery:", gallery);
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
      fetchPastGalleries();
    }
  }, [token, events]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Past Event Galleries</h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage photo galleries for past events
            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full">
              {pastGalleries.length} galleries
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
          Add Past Gallery
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
            Past Galleries
            {pastGalleries.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-100 rounded-full">
                {pastGalleries.length}
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
            Add New Past Gallery
            {activeTab === "add" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></span>
            )}
          </button>
        </nav>
      </div>

      {activeTab === "list" && (
        <PastGalleryList
          galleries={pastGalleries}
          events={events}
          onEdit={handleEditGallery}
          onDelete={handleDeleteGallery}
          loading={loading}
        />
      )}

      {activeTab === "add" && showForm && (
        <PastGalleryForm
          gallery={editingGallery}
          event={events.find(ev => ev._id === selectedEventId || ev.id === selectedEventId)}
          events={events}
          onSave={handleSaveGallery}
          onClose={() => {
            setShowForm(false);
            setEditingGallery(null);
            setSelectedEventId(null);
            setActiveTab("list");
          }}
          token={token}
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
            Click here to add a new past gallery
          </button>
        </div>
      )}
    </div>
  );
}