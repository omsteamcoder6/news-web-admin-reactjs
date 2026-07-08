// src/components/events/UpcomingEventList.jsx
import { useState, useEffect } from "react";
import UpcomingEventForm from "./UpcomingEventForm";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function UpcomingEventList({ 
  token, 
  onRefresh, 
  categories = []  // ✅ Receive categories prop
}) {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Load events from API
  const loadEvents = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/upcoming-events?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUpcomingEvents(data.data);
        console.log("✅ Upcoming events loaded:", data.data.length);
      } else {
        setError(data.message || "Failed to load events");
      }
    } catch (error) {
      console.error("❌ Error loading upcoming events:", error);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [token]);

  // Delete event
  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this upcoming event?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/upcoming-events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        await loadEvents();
        if (onRefresh) onRefresh();
        alert("✅ Event deleted successfully!");
      } else {
        alert(data.message || "Failed to delete event");
      }
    } catch (error) {
      console.error("❌ Error deleting event:", error);
      alert("Error deleting event. Please try again.");
    }
  };

  // Handle Edit - Opens form with event data
  const handleEdit = (event) => {
    console.log("✏️ Editing event:", event.title);
    console.log("📋 Categories available for edit:", categories.length); // Debug
    setEditingEvent(event);
    setShowEditForm(true);
  };

  // Handle successful update
  const handleUpdateSuccess = () => {
    loadEvents();
    if (onRefresh) onRefresh();
    setShowEditForm(false);
    setEditingEvent(null);
  };

  // Get the correct image URL
  const getImageUrl = (coverImageUrl) => {
    if (!coverImageUrl) return null;
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${coverImageUrl}`;
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading upcoming events...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-red-500 text-lg">{error}</p>
        <button
          onClick={loadEvents}
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (upcomingEvents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500 text-lg">No upcoming events</p>
        <p className="text-gray-400 mt-2">Click "Create Upcoming Event" to add events</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl shadow-sm border border-orange-100 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{upcomingEvents.length}</div>
            <div className="text-xs text-gray-600">Total Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {upcomingEvents.filter(ev => ev.price === 0).length}
            </div>
            <div className="text-xs text-gray-600">Free Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {upcomingEvents.reduce((sum, ev) => sum + ev.capacity, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Total Seats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              ₹{upcomingEvents.reduce((sum, ev) => sum + ev.price, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Total Value</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Event</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Category</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Date & Time</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Venue</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Price</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Total Seats</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Image</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {upcomingEvents.map((event) => (
                <tr key={event._id || event.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {event.coverImageUrl ? (
                        <img 
                          src={getImageUrl(event.coverImageUrl)} 
                          alt={event.title}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '';
                            e.target.className = 'w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center flex-shrink-0';
                            const parent = e.target.parentNode;
                            const fallbackDiv = document.createElement('div');
                            fallbackDiv.className = 'w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center flex-shrink-0';
                            fallbackDiv.innerHTML = '<svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
                            parent.replaceChild(fallbackDiv, e.target);
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{event.title}</div>
                        {event.description && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {event.description.substring(0, 60)}{event.description.length > 60 ? "..." : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {event.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(event.date)} <br />
                    <span className="text-xs text-gray-400">
                      {formatTime(event.date)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{event.venue || "—"}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {event.price > 0 ? `₹${event.price.toLocaleString()}` : "Free"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="font-medium">{event.capacity}</span> seats
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      📅 {event.status || "Upcoming"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {event.coverImageUrl ? (
                      <span className="text-xs text-green-600">✅ Uploaded</span>
                    ) : (
                      <span className="text-xs text-gray-400">No image</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-indigo-600 hover:text-indigo-800 transition"
                        title="Edit Event"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="View Details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(event._id || event.id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {upcomingEvents.length} upcoming event(s)
          </p>
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <i className="fas fa-database text-green-500"></i>
            Connected to API · {API_BASE_URL}
          </p>
        </div>
      </div>

      {/* ✅ Edit Form Modal - Pass categories */}
      {showEditForm && editingEvent && (
        <UpcomingEventForm
          token={token}
          categories={categories}  // ← Pass categories here
          event={editingEvent}
          onClose={() => {
            setShowEditForm(false);
            setEditingEvent(null);
          }}
          onSuccess={handleUpdateSuccess}
          isEdit={true}
        />
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Event Details
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {selectedEvent.coverImageUrl && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={getImageUrl(selectedEvent.coverImageUrl)}
                    alt={selectedEvent.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '';
                      e.target.className = 'w-full h-48 bg-gray-200 flex items-center justify-center';
                      e.target.alt = 'No image available';
                    }}
                  />
                </div>
              )}

              <div className="space-y-3">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-orange-600 uppercase mb-1">
                    Event Information
                  </p>
                  <p className="font-bold text-lg text-gray-900">{selectedEvent.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      📅 {selectedEvent.status || "Upcoming"}
                    </span>
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Event Details
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p className="font-medium">{selectedEvent.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(selectedEvent.date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Time</p>
                      <p className="font-medium">{formatTime(selectedEvent.date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Venue</p>
                      <p className="font-medium">{selectedEvent.venue || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Seats</p>
                      <p className="font-medium">{selectedEvent.capacity}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Price</p>
                      <p className="font-bold text-orange-600">
                        {selectedEvent.price > 0 ? `₹${selectedEvent.price.toLocaleString()}` : "FREE"}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedEvent.googleMapsUrl && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Location
                    </p>
                    <a 
                      href={selectedEvent.googleMapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      📍 View on Google Maps
                    </a>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Description
                    </p>
                    <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    handleEdit(selectedEvent);
                  }}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  ✏️ Edit Event
                </button>
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    handleDelete(selectedEvent._id || selectedEvent.id);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Event
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}