// src/components/admin/NominationDashboard.jsx

import { useState, useEffect } from "react";
import { 
  Users, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Award,
  CreditCard,
  CheckSquare,
  Send
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function NominationDashboard() {
  const [nominations, setNominations] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [awardFilter, setAwardFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNomination, setSelectedNomination] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pendingPayment: 0,
    awaitingVerification: 0,
    confirmed: 0,
    totalRevenue: 0
  });
  
  const { token } = useAuthStore();
  const itemsPerPage = 10;

  // Fetch nominations from API
  useEffect(() => {
    fetchNominations();
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/awards`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAwards(data.data);
      }
    } catch (error) {
      console.error('Error fetching awards:', error);
    }
  };

  const fetchNominations = async () => {
    setLoading(true);
    try {
      // Fetch nominations from your NominationPayment model
      const response = await fetch(`${API_BASE_URL}/razorpay/nominations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        const formattedNominations = data.data.map(nom => ({
          id: nom.nominationId,
          nominationId: nom.nominationId,
          awardId: nom.awardId?._id || nom.awardId,
          awardName: nom.awardId?.name || 'Unknown Award',
          applicantName: nom.nomineeName,
          email: nom.nomineeEmail,
          phone: nom.nomineePhone,
          companyName: nom.businessName || 'N/A',
          position: 'Nominee',
          nominationDate: new Date(nom.createdAt).toISOString().split('T')[0],
          paymentStatus: nom.paymentStatus,
          paymentAmount: nom.amount,
          paymentId: nom.paymentId,
          paymentDate: nom.paymentCompletedAt ? new Date(nom.paymentCompletedAt).toISOString().split('T')[0] : null,
          adminStatus: getAdminStatusFromNominationStatus(nom.nominationStatus, nom.paymentStatus),
          nominationStatement: nom.description,
          documents: [],
          reviewedBy: null,
          reviewedAt: null,
          confirmedAt: nom.paymentCompletedAt,
          razorpayOrderId: nom.razorpayOrderId,
          signature: nom.signature
        }));
        
        setNominations(formattedNominations);
        calculateStats(formattedNominations);
      }
    } catch (error) {
      console.error('Error fetching nominations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAdminStatusFromNominationStatus = (nominationStatus, paymentStatus) => {
    if (paymentStatus === 'pending') return 'awaiting_payment';
    if (paymentStatus === 'failed') return 'payment_failed';
    if (nominationStatus === 'pending') return 'pending_verification';
    if (nominationStatus === 'approved') return 'confirmed';
    if (nominationStatus === 'shortlisted') return 'shortlisted';
    if (nominationStatus === 'winner') return 'winner';
    return 'pending_verification';
  };

  const calculateStats = (nominationsList) => {
    const total = nominationsList.length;
    const pendingPayment = nominationsList.filter(n => n.paymentStatus === 'pending').length;
    const awaitingVerification = nominationsList.filter(n => n.paymentStatus === 'completed' && n.adminStatus === 'pending_verification').length;
    const confirmed = nominationsList.filter(n => n.adminStatus === 'confirmed').length;
    const totalRevenue = nominationsList.filter(n => n.paymentStatus === 'completed').reduce((sum, n) => sum + n.paymentAmount, 0);
    
    setStats({ total, pendingPayment, awaitingVerification, confirmed, totalRevenue });
  };

  // Get unique awards for filter
  const uniqueAwards = [...new Map(nominations.map(n => [n.awardId, n.awardName])).values()];
  
  // Filter nominations
  const filteredNominations = nominations.filter(nom => {
    const matchesSearch = 
      nom.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nom.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nom.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nom.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || nom.adminStatus === statusFilter;
    const matchesAward = awardFilter === "all" || nom.awardId === awardFilter;
    
    return matchesSearch && matchesStatus && matchesAward;
  });

  // Pagination
  const totalPages = Math.ceil(filteredNominations.length / itemsPerPage);
  const paginatedNominations = filteredNominations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Admin Actions
  const handleConfirmNomination = async (nomination) => {
    if (window.confirm(`Confirm nomination for ${nomination.applicantName}? This will update the nomination status.`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/razorpay/nomination/${nomination.id}/confirm`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nominationStatus: 'approved'
          })
        });
        
        const data = await response.json();
        if (data.success) {
          alert("Nomination confirmed successfully!");
          fetchNominations(); // Refresh the list
          setShowDetailsModal(false);
        } else {
          alert(data.message || "Failed to confirm nomination");
        }
      } catch (error) {
        console.error('Error confirming nomination:', error);
        alert("Error confirming nomination");
      }
    }
  };

  const handleRejectNomination = async (nomination) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      if (window.confirm(`Reject nomination for ${nomination.applicantName}?`)) {
        try {
          const response = await fetch(`${API_BASE_URL}/razorpay/nomination/${nomination.id}/reject`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              nominationStatus: 'rejected',
              rejectionReason: reason
            })
          });
          
          const data = await response.json();
          if (data.success) {
            alert(`Nomination rejected.`);
            fetchNominations(); // Refresh the list
            setShowDetailsModal(false);
          } else {
            alert(data.message || "Failed to reject nomination");
          }
        } catch (error) {
          console.error('Error rejecting nomination:', error);
          alert("Error rejecting nomination");
        }
      }
    }
  };

  const handleSendReminder = async (nomination) => {
    try {
      const response = await fetch(`${API_BASE_URL}/razorpay/nomination/${nomination.id}/reminder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Payment reminder sent to ${nomination.email}`);
      } else {
        alert(data.message || "Failed to send reminder");
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert("Error sending reminder");
    }
  };

  const handleViewDetails = (nomination) => {
    setSelectedNomination(nomination);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending_verification: { color: "bg-yellow-100 text-yellow-800", text: "Pending Verification", icon: Clock },
      awaiting_payment: { color: "bg-orange-100 text-orange-800", text: "Awaiting Payment", icon: Clock },
      confirmed: { color: "bg-green-100 text-green-800", text: "Confirmed", icon: CheckCircle },
      payment_failed: { color: "bg-red-100 text-red-800", text: "Payment Failed", icon: XCircle },
      shortlisted: { color: "bg-blue-100 text-blue-800", text: "Shortlisted", icon: CheckCircle },
      winner: { color: "bg-purple-100 text-purple-800", text: "Winner", icon: Award }
    };
    const badge = badges[status] || badges.pending_verification;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const handleExportCSV = () => {
    const headers = ['Nomination ID', 'Applicant Name', 'Email', 'Phone', 'Company', 'Award', 'Amount', 'Payment Status', 'Nomination Status', 'Date'];
    const csvData = filteredNominations.map(nom => [
      nom.id,
      nom.applicantName,
      nom.email,
      nom.phone,
      nom.companyName,
      nom.awardName,
      nom.paymentAmount,
      nom.paymentStatus,
      nom.adminStatus,
      nom.nominationDate
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nominations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="text-gray-500 mt-3">Loading nominations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nomination Management</h2>
          <p className="text-gray-500 text-sm mt-1">View and manage all award nominations, payments, and confirmations</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Nominations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Payment</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingPayment}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Awaiting Verification</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.awaitingVerification}</p>
            </div>
            <Eye className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, company or nomination ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="awaiting_payment">Awaiting Payment</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="confirmed">Confirmed</option>
            <option value="payment_failed">Payment Failed</option>
          </select>
          <select
            value={awardFilter}
            onChange={(e) => setAwardFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Awards</option>
            {uniqueAwards.map(award => (
              <option key={award} value={award}>{award}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Nominations Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">ID</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Applicant</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Award</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Company</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Amount</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Status</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Nomination Date</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedNominations.map((nom) => (
                <tr key={nom.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-600 text-sm font-mono">{nom.id}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900">{nom.applicantName}</p>
                      <p className="text-xs text-gray-500">{nom.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{nom.awardName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{nom.companyName}</td>
                  <td className="p-4">
                    <span className="font-semibold text-gray-900">₹{nom.paymentAmount}</span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(nom.adminStatus)}
                  </td>
                  <td className="p-4 text-sm text-gray-500">{nom.nominationDate}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(nom)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {nom.adminStatus === "awaiting_payment" && (
                        <button
                          onClick={() => handleSendReminder(nom)}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                          title="Send Payment Reminder"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      )}
                      {nom.paymentStatus === "completed" && nom.adminStatus === "pending_verification" && (
                        <button
                          onClick={() => handleConfirmNomination(nom)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Confirm Nomination"
                        >
                          <CheckSquare className="w-4 h-4" />
                        </button>
                      )}
                      {(nom.adminStatus === "pending_verification" || nom.adminStatus === "awaiting_payment") && (
                        <button
                          onClick={() => handleRejectNomination(nom)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredNominations.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No nominations found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t bg-gray-50">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedNomination && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Nomination Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Nomination ID</label>
                  <p className="font-mono text-sm">{selectedNomination.id}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Award Category</label>
                  <p className="font-medium">{selectedNomination.awardName}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Applicant Name</label>
                  <p className="font-medium">{selectedNomination.applicantName}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <p className="text-blue-600">{selectedNomination.email}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Phone</label>
                  <p>{selectedNomination.phone}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Company</label>
                  <p>{selectedNomination.companyName}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Nomination Date</label>
                  <p>{selectedNomination.nominationDate}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Payment Amount</label>
                  <p className="font-semibold">₹{selectedNomination.paymentAmount}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Payment Status</label>
                  <p className={`font-medium ${selectedNomination.paymentStatus === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedNomination.paymentStatus?.toUpperCase()}
                  </p>
                </div>
                {selectedNomination.paymentId && (
                  <div>
                    <label className="text-xs text-gray-500">Payment ID</label>
                    <p className="font-mono text-sm">{selectedNomination.paymentId}</p>
                  </div>
                )}
                {selectedNomination.razorpayOrderId && (
                  <div>
                    <label className="text-xs text-gray-500">Razorpay Order ID</label>
                    <p className="font-mono text-sm">{selectedNomination.razorpayOrderId}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Nomination Statement</label>
                <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">{selectedNomination.nominationStatement}</p>
              </div>

              {selectedNomination.confirmedAt && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ Payment completed on {new Date(selectedNomination.confirmedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-white"
              >
                Close
              </button>
              {selectedNomination.adminStatus === "pending_verification" && (
                <button
                  onClick={() => {
                    handleConfirmNomination(selectedNomination);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Confirm Nomination
                </button>
              )}
              {selectedNomination.adminStatus === "awaiting_payment" && (
                <button
                  onClick={() => {
                    handleSendReminder(selectedNomination);
                  }}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Send Payment Reminder
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}