// EnquiriesManager.jsx - With 24hr New Badge Logic & Click-to-Action Contacts
import { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function EnquiriesManager() {
  const [enquiries, setEnquiries] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({ status: "", search: "" });
  const [selectedEnquiries, setSelectedEnquiries] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  const { token, user } = useAuthStore();
  
  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  });

  // Helper function to format date with 24hr logic
  const formatEnquiryDate = (dateString) => {
    const enquiryDate = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - enquiryDate) / (1000 * 60 * 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    // Check if within 24 hours
    if (diffInHours < 24) {
      const hoursAgo = Math.floor(diffInHours);
      const minutesAgo = Math.floor((diffInHours % 1) * 60);
      
      if (hoursAgo === 0) {
        if (minutesAgo === 0) {
          return "Just now";
        }
        return `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`;
      }
      return `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`;
    }
    
    // Check if yesterday (within last 48 hours)
    if (diffInDays === 1) {
      return `Yesterday at ${enquiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // For older enquiries, show full date and time
    return enquiryDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if enquiry is new (within 24 hours)
  const isNewEnquiry = (dateString) => {
    const enquiryDate = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - enquiryDate) / (1000 * 60 * 60);
    return diffInHours < 24;
  };

  // Fetch enquiries from API
  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/event-enquiries?`;
      if (filter.status) url += `status=${filter.status}&`;
      if (filter.search) url += `search=${filter.search}&`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error("Failed to fetch enquiries");
      
      const data = await response.json();
      // Transform backend data to match component format
      const formattedEnquiries = data.data.map(enquiry => ({
        id: enquiry._id,
        name: enquiry.name,
        email: enquiry.email,
        phone: enquiry.phone || "Not provided",
        message: enquiry.message,
        eventId: enquiry.eventId?._id || enquiry.eventId,
        eventTitle: enquiry.eventTitle || enquiry.eventId?.title,
        status: enquiry.isRead ? "read" : "unread",
        date: enquiry.createdAt,
        responseMessage: enquiry.responseMessage,
        respondedAt: enquiry.respondedAt
      }));
      
      setEnquiries(formattedEnquiries);
      setStats({
        total: data.total,
        unread: formattedEnquiries.filter(e => e.status === "unread").length,
        new: formattedEnquiries.filter(e => isNewEnquiry(e.date)).length
      });
    } catch (err) {
      setError(err.message);
      console.error("Error fetching enquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch events for dropdown
  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data.data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  // Mark enquiry as read
  const handleMarkAsRead = async (enquiryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/event-enquiries/${enquiryId}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error("Failed to mark as read");
      
      await fetchEnquiries();
    } catch (err) {
      console.error("Error marking as read:", err);
      alert("Failed to mark as read");
    }
  };

  // Mark as unread
  const handleMarkAsUnread = async (enquiryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/event-enquiries/${enquiryId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: "pending" })
      });
      
      if (!response.ok) throw new Error("Failed to mark as unread");
      
      await fetchEnquiries();
    } catch (err) {
      console.error("Error marking as unread:", err);
      alert("Failed to mark as unread");
    }
  };

  // Delete single enquiry
  const handleDelete = async (enquiryId, enquiryName) => {
    if (!window.confirm(`Are you sure you want to delete enquiry from ${enquiryName}?`)) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/event-enquiries/${enquiryId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error("Failed to delete enquiry");
      
      await fetchEnquiries();
      alert("Enquiry deleted successfully");
    } catch (err) {
      console.error("Error deleting enquiry:", err);
      alert("Failed to delete enquiry");
    }
  };

  // Send reply
  const handleSendReply = async (enquiry) => {
    if (!replyMessage.trim()) {
      alert("Please enter a reply message");
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/event-enquiries/${enquiry.id}/respond`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ responseMessage: replyMessage })
      });
      
      if (!response.ok) throw new Error("Failed to send reply");
      
      alert(`Reply sent to ${enquiry.email}:\n\n${replyMessage}`);
      setReplyMessage("");
      setSelectedEnquiry(null);
      await fetchEnquiries();
    } catch (err) {
      console.error("Error sending reply:", err);
      alert("Failed to send reply. Please try again.");
    }
  };

  // Export to CSV
  const handleExportCSV = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/event-enquiries/export/csv`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error("Failed to export");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `enquiries-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting:", err);
      alert("Failed to export enquiries");
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedEnquiries);
    if (idsToDelete.length === 0) {
      alert("Please select enquiries to delete");
      return;
    }
    
    if (!window.confirm(`Delete ${idsToDelete.length} selected enquiries? This action cannot be undone.`)) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/event-enquiries/bulk`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ ids: idsToDelete })
      });
      
      if (!response.ok) throw new Error("Failed to bulk delete");
      
      setSelectedEnquiries(new Set());
      setShowBulkActions(false);
      await fetchEnquiries();
      alert(`${idsToDelete.length} enquiries deleted successfully`);
    } catch (err) {
      console.error("Error bulk deleting:", err);
      alert("Failed to delete enquiries");
    }
  };

  // Select/Deselect enquiry for bulk actions
  const toggleSelectEnquiry = (enquiryId) => {
    const newSelected = new Set(selectedEnquiries);
    if (newSelected.has(enquiryId)) {
      newSelected.delete(enquiryId);
    } else {
      newSelected.add(enquiryId);
    }
    setSelectedEnquiries(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  // Select all enquiries
  const selectAllEnquiries = () => {
    if (selectedEnquiries.size === enquiries.length) {
      setSelectedEnquiries(new Set());
      setShowBulkActions(false);
    } else {
      const allIds = new Set(enquiries.map(e => e.id));
      setSelectedEnquiries(allIds);
      setShowBulkActions(true);
    }
  };

  // Call customer
  const handleCallCustomer = (phone) => {
    if (!phone || phone === "Not provided") {
      alert("No phone number available for this customer");
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  // Email customer
  const handleEmailCustomer = (email, subject = "") => {
    const defaultSubject = subject || "Regarding your event enquiry";
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(defaultSubject)}`;
  };

  useEffect(() => {
    if (token) {
      fetchEnquiries();
      fetchEvents();
    }
  }, [token, filter]);

  const getEventTitle = (eventId, enquiryEventTitle) => {
    if (enquiryEventTitle) return enquiryEventTitle;
    const event = events.find(ev => ev._id === eventId);
    return event ? event.title : "General Enquiry";
  };

  const getStatusBadge = (status) => {
    return status === "unread"
      ? "bg-red-100 text-red-800"
      : "bg-green-100 text-green-800";
  };

  const unreadCount = enquiries.filter(enq => enq.status === "unread").length;
  const newCount = enquiries.filter(enq => isNewEnquiry(enq.date)).length;

  if (loading && enquiries.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-orange-600 mb-4"></i>
          <p className="text-gray-500">Loading enquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Customer Enquiries</h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage all customer enquiries and inquiries about events
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                {unreadCount} unread
              </span>
            )}
            {newCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                <i className="fas fa-clock mr-1"></i>
                {newCount} new (24h)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <i className="fas fa-download"></i>
            Export CSV
          </button>
          {showBulkActions && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
            >
              <i className="fas fa-trash-alt"></i>
              Delete Selected ({selectedEnquiries.size})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedEnquiries.size === enquiries.length && enquiries.length > 0}
            onChange={selectAllEnquiries}
            className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
          />
          <span className="text-sm text-gray-600">Select All</span>
        </div>
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="resolved">Resolved</option>
          <option value="spam">Spam</option>
        </select>
        <input
          type="text"
          placeholder="Search by name, email, or message..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={() => setFilter({ status: "", search: "" })}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          {error}
        </div>
      )}

      {enquiries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No enquiries yet</p>
          <p className="text-gray-400 mt-2">Customer enquiries will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map(enquiry => (
            <div key={enquiry.id} className={`bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition ${isNewEnquiry(enquiry.date) ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3 flex-1">
                  {/* Checkbox for bulk selection */}
                  <input
                    type="checkbox"
                    checked={selectedEnquiries.has(enquiry.id)}
                    onChange={() => toggleSelectEnquiry(enquiry.id)}
                    className="mt-1 w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">{enquiry.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(enquiry.status)}`}>
                        {enquiry.status === "unread" ? "UNREAD" : "READ"}
                      </span>
                      {/* NEW Badge - shows for enquiries within 24 hours */}
                      {isNewEnquiry(enquiry.date) && (
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-500 text-white animate-pulse">
                          <i className="fas fa-clock mr-1"></i> NEW
                        </span>
                      )}
                      {enquiry.respondedAt && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          <i className="fas fa-reply mr-1"></i> Responded
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      {/* Clickable Email Field */}
                      <p 
                        className="text-gray-600 cursor-pointer hover:text-blue-600 hover:underline inline-block"
                        onClick={() => handleEmailCustomer(enquiry.email, `Regarding your enquiry about ${enquiry.eventTitle || "event"}`)}
                        title="Click to email customer"
                      >
                        <i className="fas fa-envelope mr-2 w-4 text-gray-400"></i>
                        {enquiry.email}
                      </p>
                      
                      {/* Clickable Phone Number Field */}
                      <p 
                        className="text-gray-600 cursor-pointer hover:text-green-600 hover:underline block"
                        onClick={() => handleCallCustomer(enquiry.phone)}
                        title="Click to call customer"
                      >
                        <i className="fas fa-phone mr-2 w-4 text-gray-400"></i>
                        {enquiry.phone}
                      </p>

                      <p className="text-gray-600">
                        <i className="fas fa-calendar-alt mr-2 w-4 text-gray-400"></i>
                        {formatEnquiryDate(enquiry.date)}
                      </p>
                      <p className="text-gray-600">
                        <i className="fas fa-tag mr-2 w-4 text-gray-400"></i>
                        Event: <span className="font-medium">{getEventTitle(enquiry.eventId, enquiry.eventTitle)}</span>
                      </p>
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <i className="fas fa-quote-left mr-2 text-gray-400"></i>
                        {enquiry.message}
                      </p>
                    </div>
                    {enquiry.responseMessage && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-600 font-semibold mb-1">
                          <i className="fas fa-reply mr-1"></i> Admin Response:
                        </p>
                        <p className="text-sm text-gray-700">{enquiry.responseMessage}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Responded: {new Date(enquiry.respondedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons Group */}
                <div className="flex gap-2 ml-4">
                  {/* Call Button */}
                  <button
                    onClick={() => handleCallCustomer(enquiry.phone)}
                    className="text-green-600 hover:text-green-800 transition p-2 hover:bg-green-50 rounded-lg"
                    title="Call Customer"
                  >
                    <i className="fas fa-phone-alt text-xl"></i>
                  </button>
                  
                  {/* Email Button */}
                  <button
                    onClick={() => handleEmailCustomer(enquiry.email, `Regarding your enquiry about ${enquiry.eventTitle || "event"}`)}
                    className="text-blue-600 hover:text-blue-800 transition p-2 hover:bg-blue-50 rounded-lg"
                    title="Email Customer"
                  >
                    <i className="fas fa-envelope text-xl"></i>
                  </button>
                  
                  {/* Reply Button */}
                  <button
                    onClick={() => setSelectedEnquiry(enquiry)}
                    className="text-orange-600 hover:text-orange-800 transition p-2 hover:bg-orange-50 rounded-lg"
                    title="Reply"
                  >
                    <i className="fas fa-reply text-xl"></i>
                  </button>
                  
                  {/* Mark Read/Unread Button */}
                  {enquiry.status === "unread" ? (
                    <button
                      onClick={() => handleMarkAsRead(enquiry.id)}
                      className="text-purple-600 hover:text-purple-800 transition p-2 hover:bg-purple-50 rounded-lg"
                      title="Mark as read"
                    >
                      <i className="fas fa-check-circle text-xl"></i>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkAsUnread(enquiry.id)}
                      className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-50 rounded-lg"
                      title="Mark as unread"
                    >
                      <i className="fas fa-circle text-xl"></i>
                    </button>
                  )}
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(enquiry.id, enquiry.name)}
                    className="text-red-600 hover:text-red-800 transition p-2 hover:bg-red-50 rounded-lg"
                    title="Delete Enquiry"
                  >
                    <i className="fas fa-trash-alt text-xl"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Reply to {selectedEnquiry.name}
                {isNewEnquiry(selectedEnquiry.date) && (
                  <span className="ml-2 text-xs px-2 py-1 bg-orange-500 text-white rounded-full">
                    NEW
                  </span>
                )}
              </h2>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Original message:</p>
                <p className="text-gray-800">{selectedEnquiry.message}</p>
                <div className="flex gap-3 mt-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => handleCallCustomer(selectedEnquiry.phone)}
                    className="flex-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-phone-alt"></i> Call
                  </button>
                  <button
                    onClick={() => handleEmailCustomer(selectedEnquiry.email, `Regarding your enquiry`)}
                    className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-envelope"></i> Email
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Received: {formatEnquiryDate(selectedEnquiry.date)}
                </p>
                <p className="text-xs text-gray-500">
                  To: {selectedEnquiry.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Reply
                </label>
                <textarea
                  rows="4"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="Type your reply here..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSendReply(selectedEnquiry)}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}