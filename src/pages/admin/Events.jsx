// src/pages/Events.jsx
import { useState, useEffect } from "react";
import { MainLayout } from "../../layout/MainLayout";
import EventList from "../../components/events/EventList";
import EventForm from "../../components/events/EventForm";
import CategoryManager from "../../components/events/CategoryManager";
import EnquiriesManager from "../../components/events/EnquiriesManager";
import BookingsManager from "../../components/events/BookingsManager";
import PastEventsManager from "../../components/events/PastEventsManager";
import GalleryManager from "../../components/events/GalleryManager";
import PastGalleryManager from "../../components/events/PastGalleryManager";
// UPDATED IMPORTS - Now using API-connected components
import UpcomingEventList from "../../components/events/UpcomingEventList";
import UpcomingEventForm from "../../components/events/UpcomingEventForm";
import BookingFields from "../../components/events/BookingFields";
import { useAuthStore } from "../../stores/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Events() {
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showUpcomingForm, setShowUpcomingForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // ✅ NEW: State for upcoming events count
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
  
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      loadData();
      loadUpcomingEventsCount();
    }
  }, [token]);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const loadData = async () => {
    if (!token) {
      console.log("⛔ No token available, skipping data load");
      return;
    }

    setLoading(true);
    console.log("🔄 Loading data...");
    
    try {
      // Fetch categories
      const categoriesRes = await fetch(`${API_BASE_URL}/event-categories`, {
        headers: getAuthHeaders()
      });
      const categoriesData = await categoriesRes.json();
      
      if (categoriesData.success) {
        setCategories(categoriesData.data);
        console.log("✅ Categories loaded:", categoriesData.data.length);
      }

      // Fetch events
      const eventsRes = await fetch(`${API_BASE_URL}/events`, {
        headers: getAuthHeaders()
      });
      const eventsData = await eventsRes.json();
      
      if (eventsData.success) {
        setEvents(eventsData.data);
        console.log("✅ Events loaded:", eventsData.data.length);
      }

      // Fetch enquiries
      const enquiriesRes = await fetch(`${API_BASE_URL}/event-enquiries`, {
        headers: getAuthHeaders()
      });
      const enquiriesData = await enquiriesRes.json();
      if (enquiriesData.success) {
        setEnquiries(enquiriesData.data);
        console.log("✅ Enquiries loaded:", enquiriesData.data.length);
      }

      // Fetch bookings
      const bookingsRes = await fetch(`${API_BASE_URL}/bookings/admin/all`, {
        headers: getAuthHeaders()
      });
      const bookingsData = await bookingsRes.json();
      if (bookingsData.success) {
        setBookings(bookingsData.data);
        console.log("✅ Bookings loaded:", bookingsData.data.length);
      }

      setInitialLoad(false);
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Load upcoming events count
  const loadUpcomingEventsCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/upcoming-events/statistics`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setUpcomingEventsCount(data.data.upcoming || 0);
      }
    } catch (error) {
      console.error('❌ Error loading upcoming events count:', error);
    }
  };

  // ✅ NEW: Refresh upcoming events count after create/delete
  const refreshUpcomingCount = () => {
    loadUpcomingEventsCount();
  };

  const handleSaveEvent = async (eventData) => {
    setLoading(true);
    
    try {
      let response;
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      if (editingEvent) {
        response = await fetch(`${API_BASE_URL}/events/${editingEvent._id}`, {
          method: 'PUT',
          headers: headers,
          body: eventData
        });
      } else {
        response = await fetch(`${API_BASE_URL}/events`, {
          method: 'POST',
          headers: headers,
          body: eventData
        });
      }

      const data = await response.json();
      
      if (data.success) {
        await loadData();
        setShowEventForm(false);
        setEditingEvent(null);
        alert(editingEvent ? "Event updated successfully!" : "Event created successfully!");
      } else {
        alert(data.message || 'Failed to save event');
      }
    } catch (error) {
      console.error('❌ Error saving event:', error);
      alert('Error saving event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (data.success) {
        await loadData();
        alert("Event deleted successfully!");
      } else {
        alert(data.message || 'Failed to delete event');
      }
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event) => {
    console.log("✏️ Opening Edit Form for event:", event.title);
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleCategoriesUpdate = async () => {
    await loadData();
  };

  const handleEnquiriesUpdate = (updatedEnquiries) => {
    setEnquiries(updatedEnquiries);
  };

  const handleBookingsUpdate = (updatedBookings) => {
    setBookings(updatedBookings);
  };

  // Get active categories
  const activeCategories = categories.filter(cat => cat.status === "active");
  const availableCategories = activeCategories.length > 0 ? activeCategories : categories;

  // Filter events (exclude past events from main list)
  const filteredEvents = filterCategory === "all" 
    ? events.filter(ev => ev.status !== "past")
    : events.filter(ev => ev.categorySlug === filterCategory && ev.status !== "past");

  // Count pending bookings for notification badge
  const pendingBookingsCount = bookings.filter(bk => 
    bk.paymentStatus === "pending" || bk.bookingStatus === "pending"
  ).length;

  const totalBookingsCount = bookings.length;

  // Count unread enquiries for notification badge
  const unreadEnquiriesCount = enquiries.filter(enq => enq.status === "unread").length;

  // Tabs configuration - UPDATED with counts from API
  const tabs = [
    { id: "events", name: "Events", icon: "fa-calendar-alt", count: events.filter(ev => ev.status !== "past").length },
    { id: "upcoming", name: "Upcoming Events", icon: "fa-calendar-plus", count: upcomingEventsCount },
    { id: "categories", name: "Categories", icon: "fa-tags", count: categories.length },
    { id: "enquiries", name: "Enquiries", icon: "fa-envelope", count: unreadEnquiriesCount },
    { id: "bookings", name: "Bookings", icon: "fa-credit-card", count: pendingBookingsCount > 0 ? pendingBookingsCount : totalBookingsCount },
    { id: "bookingfields", name: "Booking Fields", icon: "fa-ticket-alt", count: 0 },
    { id: "past", name: "Past Events", icon: "fa-archive", count: events.filter(ev => ev.status === "past").length },
    { id: "pastgallery", name: "Past Gallery", icon: "fa-images", count: 0 },
    { id: "gallery", name: "Gallery", icon: "fa-images", count: 0 }
  ];

  if (loading && initialLoad) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Events Management</h1>
          <p className="text-slate-600 mt-2">Manage events, categories, enquiries, bookings, and photo galleries</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 md:gap-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-3 md:px-1 text-sm font-medium transition whitespace-nowrap relative ${
                  activeTab === tab.id
                    ? "text-orange-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <i className={`fas ${tab.icon} mr-2`}></i>
                {tab.name}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id 
                      ? "bg-orange-100 text-orange-600" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Events Tab Content (Existing - Unchanged) */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-800">All Events</h2>
                <p className="text-slate-500 text-sm mt-1">Manage your current and draft events</p>
              </div>
              <button
                onClick={() => {
                  if (availableCategories.length === 0) {
                    alert("⚠️ Please create at least one category first.");
                    setActiveTab("categories");
                    return;
                  }
                  setEditingEvent(null);
                  setShowEventForm(true);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <i className="fas fa-plus-circle"></i>
                Create Event
              </button>
            </div>

            {/* Category Filter */}
            {availableCategories.length > 0 && (
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-sm text-gray-600 mr-2">Filter by:</span>
                <button
                  onClick={() => setFilterCategory("all")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    filterCategory === "all" 
                      ? "bg-orange-600 text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Events
                </button>
                {availableCategories.map(category => (
                  <button
                    key={category.slug}
                    onClick={() => setFilterCategory(category.slug)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${
                      filterCategory === category.slug 
                        ? "bg-orange-600 text-white" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}

            <EventList 
              events={filteredEvents}
              categories={categories}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
            />
          </div>
        )}

        {/* ✅ UPDATED: Upcoming Events Tab with API Connection */}
        {activeTab === "upcoming" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-800">📅 Upcoming Events</h2>
                <p className="text-slate-500 text-sm mt-1">Manage upcoming events (Connected to backend API)</p>
              </div>
              <button
                onClick={() => setShowUpcomingForm(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <i className="fas fa-plus-circle"></i>
                Create Upcoming Event
              </button>
            </div>

            {/* ✅ UPDATED: Upcoming Event List with API integration */}
            <UpcomingEventList 
              token={token}
              categories={availableCategories}
              onRefresh={refreshUpcomingCount}
            />

            {/* ✅ UPDATED: Upcoming Event Form with API integration and Categories */}
            {showUpcomingForm && (
              <UpcomingEventForm
                token={token}
                categories={availableCategories}  // ✅ PASS CATEGORIES HERE
                onClose={() => {
                  setShowUpcomingForm(false);
                  refreshUpcomingCount();
                }}
                onSuccess={() => {
                  refreshUpcomingCount();
                }}
              />
            )}
          </div>
        )}

        {/* Categories Tab Content (Unchanged) */}
        {activeTab === "categories" && (
          <CategoryManager
            categories={categories}
            onUpdate={handleCategoriesUpdate}
            events={events}
            token={token}
          />
        )}

        {/* Enquiries Tab Content (Unchanged) */}
        {activeTab === "enquiries" && (
          <EnquiriesManager
            enquiries={enquiries}
            events={events}
            onUpdate={handleEnquiriesUpdate}
          />
        )}

        {/* Bookings Tab Content (Unchanged) */}
        {activeTab === "bookings" && (
          <BookingsManager
            events={events}
            token={token}   
            onUpdate={handleBookingsUpdate}
          />
        )}

        {/* Booking Fields Tab */}
        {activeTab === "bookingfields" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-800">🎟️ Booking Fields</h2>
            </div>
            <BookingFields />
          </div>
        )}

        {/* Past Events Tab (Unchanged) */}
        {activeTab === "past" && (
          <PastEventsManager
            events={events}
            enquiries={enquiries}
            bookings={bookings}
            categories={categories}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
            onClose={() => setShowEventForm(false)}
          />
        )}

        {/* Past Gallery Tab (Unchanged) */}
        {activeTab === "pastgallery" && (
          <PastGalleryManager
            events={events}
            token={token}
            onUpdate={loadData}
          />
        )}

        {/* Gallery Tab Content (Unchanged) */}
        {activeTab === "gallery" && (
          <GalleryManager
            events={events}
            token={token}
            onUpdate={loadData}
          />
        )}

        {/* Event Form - Rendered outside tab condition (Unchanged) */}
        {showEventForm && (
          <EventForm
            event={editingEvent}
            categories={availableCategories}
            onSave={handleSaveEvent}
            onClose={() => {
              console.log("❌ Event form closed");
              setShowEventForm(false);
              setEditingEvent(null);
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}