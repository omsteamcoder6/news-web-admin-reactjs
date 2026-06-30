// pages/reels/index.jsx
import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "../../layout/MainLayout";
import ReelsForm from "../../components/reels/ReelsForm";
import ReelsListView from "../../components/reels/ReelsListView";
import { useAuthStore } from "../../stores/authStore";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function ReelsPage() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [editingReel, setEditingReel] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Get token from auth store
  const { token } = useAuthStore();

  // Fetch reels from API - wrapped in useCallback
  const fetchReels = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/reels`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setReels(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching reels:', err);
      setError('Failed to load reels');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  // Memoized handlers to prevent re-renders
  const handleAddReel = useCallback(async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/reels`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        await fetchReels();
        setShowForm(false);
        setEditingReel(null);
      }
    } catch (err) {
      console.error('Error creating reel:', err);
      alert(err.response?.data?.message || 'Failed to create reel');
    }
  }, [token, fetchReels]);

  const handleEditReel = useCallback(async (formData, reelId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/reels/${reelId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        await fetchReels();
        setEditingReel(null);
        setShowForm(false);
      }
    } catch (err) {
      console.error('Error updating reel:', err);
      alert(err.response?.data?.message || 'Failed to update reel');
    }
  }, [token, fetchReels]);

  const handleDeleteReel = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to delete this reel?")) {
      return;
    }
    
    try {
      const response = await axios.delete(`${API_BASE_URL}/reels/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        await fetchReels();
      }
    } catch (err) {
      console.error('Error deleting reel:', err);
      alert(err.response?.data?.message || 'Failed to delete reel');
    }
  }, [token, fetchReels]);

  const handleEditClick = useCallback((reel) => {
    setEditingReel(reel);
    setShowForm(true);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingReel(null);
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  if (loading && reels.length === 0) {
    return (
      <MainLayout>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading reels...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Reels</h1>
            <p className="text-slate-600 mt-2">Manage your video reels</p>
          </div>
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => handleViewModeChange("grid")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Grid
              </button>
              <button
                onClick={() => handleViewModeChange("list")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                List
              </button>
            </div>
            {!showForm && (
              <button
                onClick={() => {
                  setEditingReel(null);
                  setShowForm(true);
                }}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Reel
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Main Content - Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-1">
            {showForm ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingReel ? "Edit Reel" : "Create New Reel"}
                  </h2>
                  <button
                    onClick={handleCancelForm}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ReelsForm
                  reel={editingReel}
                  onSave={editingReel ? handleEditReel : handleAddReel}
                  onCancel={handleCancelForm}
                  isEditing={!!editingReel}
                />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-8 text-center sticky top-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Form Active</h3>
                <p className="text-slate-600 text-sm mb-4">
                  Click "Add New Reel" to create a new reel or edit an existing one.
                </p>
                <button
                  onClick={() => {
                    setEditingReel(null);
                    setShowForm(true);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Create New Reel
                </button>
              </div>
            )}
          </div>

          {/* List Section */}
          <div className="lg:col-span-2">
            <ReelsListView
              reels={reels}
              viewMode={viewMode}
              onEdit={handleEditClick}
              onDelete={handleDeleteReel}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}