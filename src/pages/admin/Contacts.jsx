import { MainLayout } from "../../layout/MainLayout";
import { useState, useEffect } from "react";
import { Mail, User, Phone, MessageSquare, Send, Inbox, ExternalLink, AlertCircle, RefreshCw, CheckCircle, Loader } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Contacts() {
  const { token, user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyEmail, setReplyEmail] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Load messages from API with authentication
  useEffect(() => {
    const fetchMessages = async () => {
      // Check if user is authenticated
      if (!isAuthenticated || !token) {
        setLoading(false);
        setError("Please login to view messages");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching from:", `${API_BASE_URL}/contact`);
        
        // Fetch contact submissions from your backend API (using correct endpoint)
        const response = await fetch(`${API_BASE_URL}/contact`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          if (response.status === 401) {
            useAuthStore.getState().logout();
            setError("Session expired. Please login again.");
          } else if (response.status === 403) {
            setError("You don't have permission to view messages. Admin access required.");
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return;
        }

        const result = await response.json();
        console.log("Fetched data:", result);
        
        // The API returns { success: true, data: [...] }
        if (result.success && result.data) {
          // Transform backend data to match frontend expected format
          const transformedMessages = result.data.map(msg => ({
            id: msg._id,
            firstName: msg.firstName,
            lastName: msg.lastName,
            email: msg.email,
            phone: msg.phone,
            message: msg.message,
            date: msg.createdAt,
            read: msg.status !== 'new',
            status: msg.status,
            adminNotes: msg.adminNotes,
            repliedAt: msg.repliedAt,
            readAt: msg.readAt,
            createdAt: msg.createdAt
          }));
          setMessages(transformedMessages);
        } else {
          setMessages([]);
        }
        
        // Also fetch statistics
        await fetchStats();
        
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError(`Failed to load messages: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [token, isAuthenticated]);

  // Fetch statistics
  const fetchStats = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/contact/stats/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Prepare reply for a message
  const handleReply = (message) => {
    setSelectedMessage(message);
    setReplyEmail(message.email);
    setReplySubject(`Re: Contact from ${message.firstName} ${message.lastName}`);
    setReplyBody(`\n\n--- Original Message ---\nFrom: ${message.firstName} ${message.lastName}\nEmail: ${message.email}\nPhone: ${message.phone || 'Not provided'}\nMessage: ${message.message}`);
    setAdminNotes("");
    setSendSuccess(false);
    
    // Mark as read when opening reply
    if (message.status === 'new') {
      markAsRead(message.id);
    }
  };

  // Send email directly from server
  const sendEmailReply = async () => {
    if (!replyEmail) {
      setError("Please select a message to reply to");
      return;
    }
    
    if (!replySubject.trim()) {
      setError("Please enter a subject");
      return;
    }
    
    if (!replyBody.trim()) {
      setError("Please enter a message");
      return;
    }
    
    setSending(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/contact/${selectedMessage.id}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: replySubject,
          message: replyBody,
          adminNotes: adminNotes
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSendSuccess(true);
        
        // Update local message status
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === selectedMessage.id ? { ...msg, status: 'replied', repliedAt: new Date().toISOString() } : msg
          )
        );
        
        // Reset form after 2 seconds
        setTimeout(() => {
          setSendSuccess(false);
          setSelectedMessage(null);
          setReplyEmail("");
          setReplySubject("");
          setReplyBody("");
          setAdminNotes("");
        }, 2000);
        
        // Refresh stats
        await fetchStats();
      } else {
        setError(result.message || "Failed to send email. Please try again.");
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setError(`Failed to send email: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  // Update message status using your backend endpoint
  const updateStatus = async (messageId, status) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/contact/${messageId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        // Update local state
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId ? { ...msg, status: status } : msg
          )
        );
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Mark message as read using status update
  const markAsRead = async (messageId) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/contact/${messageId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'read' }),
      });
      
      if (response.ok) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId ? { ...msg, status: 'read', read: true } : msg
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusColors = {
      'new': 'bg-red-100 text-red-800',
      'read': 'bg-blue-100 text-blue-800',
      'replied': 'bg-green-100 text-green-800',
      'archived': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  // Refresh messages
  const handleRefresh = () => {
    window.location.reload();
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading messages...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show error state
  if (error && messages.length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md">
            <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Unable to Load Messages</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <div className="space-y-2">
              <button 
                onClick={handleRefresh}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
              {!isAuthenticated && (
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition ml-2"
                >
                  Go to Login
                </button>
              )}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-left text-sm">
              <p className="font-semibold text-yellow-800 mb-1">Debug Info:</p>
              <p className="text-yellow-700">API_BASE_URL: {API_BASE_URL || 'Not set'}</p>
              <p className="text-yellow-700 mt-1">Endpoint: {API_BASE_URL}/contact</p>
              <p className="text-yellow-700 mt-1">Make sure you are logged in as Admin</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Contact Submissions</h1>
            <p className="text-slate-600 mt-2">View and manage customer messages</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
              title="Refresh messages"
            >
              <RefreshCw className="w-5 h-5 text-slate-600" />
            </button>
            
            {/* User info */}
            {user && (
              <div className="text-right text-sm">
                <p className="text-slate-600">Logged in as</p>
                <p className="font-medium text-slate-800">{user.email || user.name}</p>
              </div>
            )}
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-blue-600 font-medium">{messages.length} Messages</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-2xl font-bold text-slate-800">{stats.total || 0}</p>
              <p className="text-sm text-slate-500">Total</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-2xl font-bold text-red-600">{stats.new || 0}</p>
              <p className="text-sm text-slate-500">New</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-2xl font-bold text-blue-600">{stats.read || 0}</p>
              <p className="text-sm text-slate-500">Read</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-2xl font-bold text-green-600">{stats.replied || 0}</p>
              <p className="text-sm text-slate-500">Replied</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-2xl font-bold text-orange-600">{stats.todayCount || 0}</p>
              <p className="text-sm text-slate-500">Today</p>
            </div>
          </div>
        )}

        {/* Two Column Layout - Messages List & Reply Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List Column */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-slate-600" />
                <h2 className="font-semibold text-slate-800">All Messages</h2>
              </div>
            </div>
            
            {messages.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No messages yet</p>
                <p className="text-sm text-slate-400 mt-1">When customers contact you, their messages will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-5 hover:bg-slate-50 transition cursor-pointer ${
                      selectedMessage?.id === message.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                    }`}
                    onClick={() => handleReply(message)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {message.firstName} {message.lastName}
                            {message.status === 'new' && (
                              <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                          </p>
                          <p className="text-sm text-slate-500">{message.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(message.status)}`}>
                          {message.status}
                        </span>
                        <p className="text-xs text-slate-400 mt-1">{formatDate(message.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm line-clamp-2 ml-10">
                      {message.message}
                    </p>
                    {message.phone && (
                      <div className="flex gap-4 mt-2 ml-10">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {message.phone}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reply Column - Now with Server Email Sending */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-slate-800">Reply to Customer</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">Send email directly from server</p>
            </div>

            {selectedMessage ? (
              <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto">
                {/* Success Message */}
                {sendSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-700 text-sm font-medium">Email sent successfully!</p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Selected Customer Info */}
                <div className="bg-slate-50 rounded-lg p-3 text-sm">
                  <p className="font-medium text-slate-700">Replying to:</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-slate-600">
                      <span className="font-medium">Name:</span> {selectedMessage.firstName} {selectedMessage.lastName}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-medium">Email:</span> {selectedMessage.email}
                    </p>
                    {selectedMessage.phone && (
                      <p className="text-slate-600">
                        <span className="font-medium">Phone:</span> {selectedMessage.phone}
                      </p>
                    )}
                    <p className="text-slate-600">
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getStatusBadge(selectedMessage.status)}`}>
                        {selectedMessage.status}
                      </span>
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <p className="font-medium text-slate-700">Original Message:</p>
                      <p className="text-slate-500 italic mt-1">"{selectedMessage.message}"</p>
                    </div>
                  </div>
                </div>

                {/* Email Fields */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">To *</label>
                  <input
                    type="email"
                    value={replyEmail}
                    onChange={(e) => setReplyEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Enter subject..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message *</label>
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    placeholder="Type your reply here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Admin Notes (Internal)</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none text-sm"
                    placeholder="Add internal notes (not sent to customer)..."
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={sendEmailReply}
                  disabled={sending}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Email Directly
                    </>
                  )}
                </button>
                
                <p className="text-xs text-slate-400 text-center">
                  Email will be sent directly from the server using SMTP configuration
                </p>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Select a message to reply</p>
                <p className="text-sm text-slate-400 mt-1">Click on any customer message from the list</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}