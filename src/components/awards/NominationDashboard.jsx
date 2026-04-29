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

export default function NominationDashboard() {
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [awardFilter, setAwardFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNomination, setSelectedNomination] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const itemsPerPage = 10;

  // Mock data - Replace with your API call
  useEffect(() => {
    const fetchNominations = async () => {
      setLoading(true);
      // Simulate API delay
      setTimeout(() => {
        const mockData = [
          {
            id: "NOM-001",
            awardName: "Best Startup Award",
            awardId: 1,
            applicantName: "Rajesh Kumar",
            email: "rajesh@techstartup.com",
            phone: "+91 98765 43210",
            companyName: "TechInnovate Solutions",
            position: "CEO & Founder",
            nominationDate: "2024-03-15",
            paymentStatus: "paid",
            paymentAmount: 499.00,
            paymentId: "PAY_123456",
            paymentDate: "2024-03-16",
            adminStatus: "pending_verification",
            nominationStatement: "Revolutionized the local e-commerce space with AI-driven personalization...",
            documents: ["resume.pdf", "portfolio.pdf"],
            reviewedBy: null,
            reviewedAt: null,
            confirmedAt: null
          },
          {
            id: "NOM-002",
            awardName: "Excellence in Technology",
            awardId: 2,
            applicantName: "Priya Sharma",
            email: "priya@aiinnovations.com",
            phone: "+91 87654 32109",
            companyName: "AI Innovations Pvt Ltd",
            position: "CTO",
            nominationDate: "2024-03-10",
            paymentStatus: "paid",
            paymentAmount: 499.00,
            paymentId: "PAY_123457",
            paymentDate: "2024-03-11",
            adminStatus: "confirmed",
            nominationStatement: "Developed breakthrough AI model for healthcare diagnosis...",
            documents: ["research.pdf", "certificate.pdf"],
            reviewedBy: "Admin User",
            reviewedAt: "2024-03-12",
            confirmedAt: "2024-03-13"
          },
          {
            id: "NOM-003",
            awardName: "Business Leadership Award",
            awardId: 3,
            applicantName: "Amit Patel",
            email: "amit@globalcorp.com",
            phone: "+91 76543 21098",
            companyName: "Global Corp Industries",
            position: "Managing Director",
            nominationDate: "2024-03-05",
            paymentStatus: "pending",
            paymentAmount: 499.00,
            paymentId: null,
            paymentDate: null,
            adminStatus: "awaiting_payment",
            nominationStatement: "Led company to achieve 200% growth in 2 years...",
            documents: ["leadership.pdf"],
            reviewedBy: null,
            reviewedAt: null,
            confirmedAt: null
          },
          {
            id: "NOM-004",
            awardName: "Customer Service Excellence",
            awardId: 4,
            applicantName: "Sneha Reddy",
            email: "sneha@customersfirst.com",
            phone: "+91 65432 10987",
            companyName: "Customers First Solutions",
            position: "Customer Experience Head",
            nominationDate: "2024-03-18",
            paymentStatus: "paid",
            paymentAmount: 499.00,
            paymentId: "PAY_123458",
            paymentDate: "2024-03-19",
            adminStatus: "pending_verification",
            nominationStatement: "Reduced customer complaints by 75% through innovative training...",
            documents: ["report.pdf", "testimonials.pdf"],
            reviewedBy: null,
            reviewedAt: null,
            confirmedAt: null
          },
          {
            id: "NOM-005",
            awardName: "Best Startup Award",
            awardId: 1,
            applicantName: "Vikram Singh",
            email: "vikram@greenenergy.com",
            phone: "+91 54321 09876",
            companyName: "Green Energy Solutions",
            position: "Co-Founder",
            nominationDate: "2024-03-12",
            paymentStatus: "failed",
            paymentAmount: 499.00,
            paymentId: "PAY_123459",
            paymentDate: "2024-03-12",
            adminStatus: "payment_failed",
            nominationStatement: "Pioneered affordable solar solutions for rural areas...",
            documents: ["project_report.pdf"],
            reviewedBy: null,
            reviewedAt: null,
            confirmedAt: null
          }
        ];
        setNominations(mockData);
        setLoading(false);
      }, 500);
    };

    fetchNominations();
  }, []);

  // Get unique awards for filter
  const uniqueAwards = [...new Map(nominations.map(n => [n.awardId, n.awardName])).values()];
  
  // Stats calculations
  const stats = {
    total: nominations.length,
    pendingPayment: nominations.filter(n => n.paymentStatus === "pending" || n.adminStatus === "awaiting_payment").length,
    awaitingVerification: nominations.filter(n => n.paymentStatus === "paid" && n.adminStatus === "pending_verification").length,
    confirmed: nominations.filter(n => n.adminStatus === "confirmed").length,
    totalRevenue: nominations.filter(n => n.paymentStatus === "paid").reduce((sum, n) => sum + n.paymentAmount, 0)
  };

  // Filter nominations
  const filteredNominations = nominations.filter(nom => {
    const matchesSearch = 
      nom.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nom.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nom.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nom.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || nom.adminStatus === statusFilter;
    const matchesAward = awardFilter === "all" || nom.awardId.toString() === awardFilter;
    
    return matchesSearch && matchesStatus && matchesAward;
  });

  // Pagination
  const totalPages = Math.ceil(filteredNominations.length / itemsPerPage);
  const paginatedNominations = filteredNominations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Admin Actions
  const handleVerifyPayment = (nomination) => {
    if (window.confirm(`Verify payment for ${nomination.applicantName}?`)) {
      // TODO: API call to verify payment
      setNominations(prev => prev.map(n => 
        n.id === nomination.id 
          ? { ...n, adminStatus: "pending_verification", paymentStatus: "paid" }
          : n
      ));
      alert("Payment verified! Ready for confirmation.");
    }
  };

  const handleConfirmNomination = (nomination) => {
    if (window.confirm(`Confirm nomination for ${nomination.applicantName}? This will send a confirmation email.`)) {
      // TODO: API call to confirm nomination
      setNominations(prev => prev.map(n => 
        n.id === nomination.id 
          ? { 
              ...n, 
              adminStatus: "confirmed",
              confirmedAt: new Date().toISOString().split('T')[0],
              reviewedBy: "Admin User",
              reviewedAt: new Date().toISOString().split('T')[0]
            }
          : n
      ));
      alert("Nomination confirmed! Email sent to applicant.");
    }
  };

  const handleRejectNomination = (nomination) => {
    const reason = prompt("Enter rejection reason (will be sent to applicant):");
    if (reason) {
      if (window.confirm(`Reject nomination for ${nomination.applicantName}?`)) {
        // TODO: API call to reject
        setNominations(prev => prev.filter(n => n.id !== nomination.id));
        alert(`Nomination rejected. Reason sent to ${nomination.email}`);
      }
    }
  };

  const handleSendReminder = (nomination) => {
    // TODO: API call to send payment reminder
    alert(`Payment reminder sent to ${nomination.email}`);
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
      payment_failed: { color: "bg-red-100 text-red-800", text: "Payment Failed", icon: XCircle }
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
        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
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
              <option key={award} value={award.split(' ')[0]}>{award}</option>
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
                      {nom.paymentStatus === "paid" && nom.adminStatus === "pending_verification" && (
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
                  <label className="text-xs text-gray-500">Position</label>
                  <p>{selectedNomination.position}</p>
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
                  <label className="text-xs text-gray-500">Payment Status</label>
                  <p className={`font-medium ${selectedNomination.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedNomination.paymentStatus.toUpperCase()}
                  </p>
                </div>
                {selectedNomination.paymentId && (
                  <div>
                    <label className="text-xs text-gray-500">Transaction ID</label>
                    <p className="font-mono text-sm">{selectedNomination.paymentId}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Nomination Statement</label>
                <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">{selectedNomination.nominationStatement}</p>
              </div>

              {selectedNomination.documents && (
                <div>
                  <label className="text-xs text-gray-500">Documents</label>
                  <div className="flex gap-2 mt-1">
                    {selectedNomination.documents.map((doc, i) => (
                      <button key={i} className="text-sm text-blue-600 hover:underline">
                        📄 {doc}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedNomination.confirmedAt && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ Confirmed on {selectedNomination.confirmedAt} by {selectedNomination.reviewedBy}
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
                    setShowDetailsModal(false);
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
                    setShowDetailsModal(false);
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