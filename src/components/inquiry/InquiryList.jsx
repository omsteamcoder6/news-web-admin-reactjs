import { useState } from 'react';
import { useInquiries } from '../../lib/advertisingInquiryApi';
import AdvertisingInquiryAPI from '../../lib/advertisingInquiryApi';
import { useAuthStore } from '../../stores/authStore';

// Get API URL from .env file
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// NO LIMIT - Shows all inquiries
const DEFAULT_OPTIONS = { page: 1, limit: null };

export default function InquiryList() {
  const { data: inquiries, loading, pagination, refetch } = useInquiries(DEFAULT_OPTIONS);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // State for email modal
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(null);

  // State for delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      contacted: 'bg-blue-100 text-blue-800',
      converted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredInquiries = inquiries?.filter(inquiry => {
    const matchesSearch = 
      inquiry.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const openMessageModal = (message) => {
    setSelectedMessage(message);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMessage(null);
  };

  // Open email modal with selected inquiry data
  const openEmailModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setEmailData({
      to: inquiry.email,
      subject: `Regarding your advertising inquiry - ${inquiry.fullName}`,
      message: `Dear ${inquiry.fullName},\n\nThank you for your inquiry. \n\nRegarding: "${inquiry.message ? inquiry.message.substring(0, 100) + (inquiry.message.length > 100 ? '...' : '') : 'Your inquiry'}"\n\nWe will get back to you shortly.\n\nBest regards,\nTeam`
    });
    setEmailModalOpen(true);
    setEmailError(null);
    setEmailSuccess(null);
  };

  const closeEmailModal = () => {
    setEmailModalOpen(false);
    setSelectedInquiry(null);
    setEmailData({
      to: '',
      subject: '',
      message: ''
    });
  };

  // Handle email input changes
  const handleEmailInputChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({ ...prev, [name]: value }));
  };

  // Send email function using backend API with authentication
  const sendEmail = async () => {
    // Validation
    if (!emailData.to) {
      setEmailError('Recipient email is required');
      return;
    }
    if (!emailData.subject) {
      setEmailError('Subject is required');
      return;
    }
    if (!emailData.message) {
      setEmailError('Message content is required');
      return;
    }

    setSendingEmail(true);
    setEmailError(null);
    setEmailSuccess(null);

    try {
      // ✅ CORRECT WAY - Get token from authStore (not localStorage directly)
      const token = useAuthStore.getState().getToken();
      
      // Send email with authorization header
      const response = await fetch(`${API_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          text: emailData.message,
          inquiryId: selectedInquiry?._id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }

      const result = await response.json();
      
      // Update inquiry status to 'contacted' after sending email with authentication
      const updateResponse = await fetch(`${API_URL}/advertising-inquiry/${selectedInquiry._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ status: 'contacted' }),
      });

      if (updateResponse.ok) {
        refetch(); // Refresh the inquiries list
      }

      setEmailSuccess('Email sent successfully!');
      
      // Close modal after 2 seconds on success
      setTimeout(() => {
        closeEmailModal();
        setEmailSuccess(null);
      }, 2000);
      
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError(error.message || 'Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  // Handle call action - opens phone dialer
  const handleCall = (phoneNumber) => {
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    const telLink = `tel:${cleanPhone}`;
    window.location.href = telLink;
  };

  // Open delete confirmation modal
  const openDeleteModal = (inquiry) => {
    setInquiryToDelete(inquiry);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setInquiryToDelete(null);
    setDeleting(false);
    setDeleteError(null);
  };

  // Handle delete inquiry using API method
  const handleDeleteInquiry = async () => {
    if (!inquiryToDelete) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await AdvertisingInquiryAPI.deleteInquiry(inquiryToDelete._id);
      closeDeleteModal();
      refetch();
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      setDeleteError(error.message || 'Failed to delete inquiry. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-slate-500">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-slate-200">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">All Inquiries</h2>
            <p className="text-slate-500 text-sm mt-1">
              Total: {pagination?.total || inquiries?.length || 0} submissions
            </p>
          </div>
          
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
              <option value="rejected">Rejected</option>
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Full Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredInquiries?.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-slate-500">
                  No inquiries found
                </td>
              </tr>
            ) : (
              filteredInquiries?.map((inquiry, index) => (
                <tr key={inquiry._id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm text-slate-600">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{inquiry.fullName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{inquiry.companyName || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{inquiry.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <span>{inquiry.phone}</span>
                      <button
                        onClick={() => handleCall(inquiry.phone)}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                        title="Call this number"
                      >
                        Call
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(inquiry.status)}`}>
                      {inquiry.status?.charAt(0).toUpperCase() + inquiry.status?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => openMessageModal(inquiry.message)}
                      className="text-left text-slate-600 hover:text-blue-600 hover:underline max-w-xs truncate block w-full cursor-pointer"
                      title="Click to view full message"
                    >
                      {inquiry.message || '-'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEmailModal(inquiry)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                        title="Send email to this contact"
                      >
                        Email
                      </button>
                      <button
                        onClick={() => openDeleteModal(inquiry)}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                        title="Delete this inquiry"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for full message */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b p-4 bg-slate-50 rounded-t-lg">
              <h3 className="text-lg font-semibold text-slate-800">Full Message</h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-700 whitespace-pre-wrap break-words">{selectedMessage || 'No message content'}</p>
            </div>
            <div className="border-t p-4 bg-slate-50 rounded-b-lg flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Composition Modal - No From field */}
      {emailModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeEmailModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b p-4 bg-slate-50 rounded-t-lg">
              <h3 className="text-lg font-semibold text-slate-800">Compose Email</h3>
              <button
                onClick={closeEmailModal}
                className="text-slate-400 hover:text-slate-600 transition text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {emailSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  {emailSuccess}
                </div>
              )}
              {emailError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  {emailError}
                </div>
              )}

              {/* To Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  To <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="to"
                  value={emailData.to}
                  onChange={handleEmailInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="recipient@example.com"
                />
                <p className="text-xs text-slate-500 mt-1">Recipient: {selectedInquiry?.fullName}</p>
              </div>

              {/* Subject Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={emailData.subject}
                  onChange={handleEmailInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email subject"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={emailData.message}
                  onChange={handleEmailInputChange}
                  rows={10}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Type your message here..."
                />
              </div>

              <div className="text-right text-xs text-slate-500">
                {emailData.message.length} characters
              </div>
            </div>

            <div className="border-t p-4 bg-slate-50 rounded-b-lg flex justify-end gap-3">
              <button
                onClick={closeEmailModal}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition"
                disabled={sendingEmail}
              >
                Cancel
              </button>
              <button
                onClick={sendEmail}
                disabled={sendingEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sendingEmail ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Email'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeDeleteModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b p-4 bg-slate-50 rounded-t-lg">
              <h3 className="text-lg font-semibold text-slate-800">Confirm Delete</h3>
              <button
                onClick={closeDeleteModal}
                className="text-slate-400 hover:text-slate-600 transition text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6">
              {deleteError && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  {deleteError}
                </div>
              )}
              
              <div className="text-center">
                <svg className="mx-auto mb-4 text-red-600 w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">Are you sure?</h4>
                <p className="text-slate-600 mb-4">
                  You are about to delete the inquiry from <strong>{inquiryToDelete?.fullName}</strong> 
                  {inquiryToDelete?.companyName && ` at ${inquiryToDelete.companyName}`}.
                </p>
                <p className="text-sm text-red-600 mb-4">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="border-t p-4 bg-slate-50 rounded-b-lg flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteInquiry}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Inquiry'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}