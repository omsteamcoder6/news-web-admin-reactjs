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
  Send,
  MapPin,
  Home,
  Globe,
  Building2,
  User,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Printer,
  FileDown
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper to convert an image URL to a Base64 string safely for jsPDF
const convertImgToBase64 = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Prevents CORS blocks
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = (error) => {
      console.warn("Failed to convert image for PDF:", error);
      resolve(null); // Resolves null so the PDF still downloads if the image fails
    };
    img.src = url;
  });
};

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
  const [imageLoading, setImageLoading] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    pendingPayment: 0,
    awaitingVerification: 0,
    confirmed: 0,
    totalRevenue: 0
  });
  
  const { token } = useAuthStore();
  const itemsPerPage = 10;

  // Helper to build full image URL
  const getImageUrl = (nomineeImage) => {
    if (!nomineeImage) return null;
    if (nomineeImage.startsWith('http://') || nomineeImage.startsWith('https://')) {
      return nomineeImage;
    }
    const serverRoot = API_BASE_URL.replace(/\/api$/, '');
    const cleanPath = nomineeImage.startsWith('/') ? nomineeImage : `/${nomineeImage}`;
    return `${serverRoot}${cleanPath}`;
  };

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
      const response = await fetch(`${API_BASE_URL}/nominations?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('📝 Nominations API Response:', data);
      
      if (data.success) {
        const nominationsData = data.data || [];
        
        const formattedNominations = nominationsData.map(nom => ({
          id: nom._id,
          nominationId: nom._id,
          awardId: nom.awardId?._id || nom.awardId,
          awardName: nom.awardId?.name || 'Unknown Award',
          awardFee: nom.awardId?.fee || 0,
          // Personal Details
          nomineeName: nom.nomineeName || 'N/A',
          nomineeEmail: nom.nomineeEmail || 'N/A',
          nomineePhone: nom.nomineePhone || 'N/A',
          nomineeCompany: nom.nomineeCompany || 'N/A',
          nomineeDesignation: nom.nomineeDesignation || 'N/A',
          // Nominee Image
          nomineeImage: nom.nomineeImage || null,
          // Address Fields
          address: nom.address || 'N/A',
          city: nom.city || 'N/A',
          state: nom.state || 'N/A',
          pincode: nom.pincode || 'N/A',
          country: nom.country || 'N/A',
          message: nom.message || 'No message provided',
          // Reason
          reason: nom.reason || 'No reason provided',
          // Payment Details
          paymentStatus: nom.paymentStatus || 'pending',
          paymentAmount: nom.paymentAmount || nom.awardId?.fee || 0,
          paymentId: nom.paymentId || null,
          paymentDate: nom.paymentDate || null,
          transactionId: nom.transactionId || null,
          // Nomination Status
          status: nom.status || 'pending',
          adminRemarks: nom.adminRemarks || null,
          reviewedBy: nom.reviewedBy || null,
          reviewedAt: nom.reviewedAt || null,
          // Dates
          createdAt: nom.createdAt,
          updatedAt: nom.updatedAt,
          nominationDate: new Date(nom.createdAt).toISOString().split('T')[0],
          // User
          userId: nom.userId?._id || nom.userId,
          userName: nom.userId?.name || 'N/A',
          userEmail: nom.userId?.email || 'N/A',
        }));
        
        setNominations(formattedNominations);
        calculateStats(formattedNominations);
      } else {
        console.error('Failed to fetch nominations:', data.message);
        setNominations([]);
      }
    } catch (error) {
      console.error('❌ Error fetching nominations:', error);
      setNominations([]);
    } finally {
      setLoading(false);
    }
  };

  const getAdminStatusFromNomination = (nomination) => {
    const { paymentStatus, status } = nomination;
    
    if (paymentStatus === 'pending') return 'awaiting_payment';
    if (paymentStatus === 'failed') return 'payment_failed';
    if (paymentStatus === 'refunded') return 'refunded';
    if (status === 'pending') return 'pending_verification';
    if (status === 'approved') return 'confirmed';
    if (status === 'shortlisted') return 'shortlisted';
    if (status === 'winner') return 'winner';
    if (status === 'rejected') return 'rejected';
    return 'pending_verification';
  };

  const calculateStats = (nominationsList) => {
    const total = nominationsList.length;
    const pendingPayment = nominationsList.filter(n => n.paymentStatus === 'pending').length;
    const awaitingVerification = nominationsList.filter(n => 
      n.paymentStatus === 'completed' && n.status === 'pending'
    ).length;
    const confirmed = nominationsList.filter(n => n.status === 'approved').length;
    const totalRevenue = nominationsList
      .filter(n => n.paymentStatus === 'completed')
      .reduce((sum, n) => sum + (n.paymentAmount || 0), 0);
    
    setStats({ total, pendingPayment, awaitingVerification, confirmed, totalRevenue });
  };

  // Filter nominations
  const filteredNominations = nominations.filter(nom => {
    const matchesSearch = 
      nom.nomineeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nom.nomineeEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nom.nomineeCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nom.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nom.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nom.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nom.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nom.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nom.pincode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || getAdminStatusFromNomination(nom) === statusFilter;
    const matchesAward = awardFilter === "all" || nom.awardId === awardFilter;
    
    return matchesSearch && matchesStatus && matchesAward;
  });

  // Pagination
  const totalPages = Math.ceil(filteredNominations.length / itemsPerPage);
  const paginatedNominations = filteredNominations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ============================================
  // UPDATED ASYNC PDF GENERATION FUNCTION WITH IMAGE
  // ============================================
  const generateNominationPDF = async (nomination) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Add header background
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('NOMINATION DETAILS', pageWidth / 2, 20, { align: 'center' });
    
    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 30, pageWidth - 20, 30);
    
    let yPos = 40;
    const leftMargin = 20;
    const rightMargin = pageWidth - 20;
    const lineHeight = 8;

    // Fetch and inject the profile image if it exists
    if (nomination.nomineeImage) {
      try {
        const imgUrl = getImageUrl(nomination.nomineeImage);
        if (imgUrl) {
          // Await base64 format translation from URL
          const base64Img = await convertImgToBase64(imgUrl);
          if (base64Img) {
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'italic');
            doc.text('Nominee Photo:', leftMargin, yPos);
            yPos += 5;
            
            // Draw image on PDF canvas layout
            doc.addImage(base64Img, 'JPEG', leftMargin, yPos, 35, 35);
            yPos += 42; // Move structural Y pointer below the drawn photo boundaries
          }
        }
      } catch (imgError) {
        console.warn('Image processing handling error for jsPDF:', imgError);
      }
    }

    // ─── Personal Details ──────────────────────────────────────────────────
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('PERSONAL DETAILS', leftMargin, yPos);
    yPos += 6;
    doc.setDrawColor(200, 200, 200);
    doc.line(leftMargin, yPos, rightMargin, yPos);
    yPos += 6;

    const details = [
      ['Nominee Name', nomination.nomineeName || 'N/A'],
      ['Email Address', nomination.nomineeEmail || 'N/A'],
      ['Phone Number', nomination.nomineePhone || 'N/A'],
      ['Company Name', nomination.nomineeCompany || 'N/A'],
      ['Designation', nomination.nomineeDesignation || 'N/A'],
    ];

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    details.forEach(([label, value]) => {
      doc.setTextColor(100, 100, 100);
      doc.text(label + ':', leftMargin, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(value, leftMargin + 50, yPos);
      yPos += lineHeight;
    });

    yPos += 5;

    // ─── Address Details ──────────────────────────────────────────────────
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('ADDRESS DETAILS', leftMargin, yPos);
    yPos += 6;
    doc.setDrawColor(200, 200, 200);
    doc.line(leftMargin, yPos, rightMargin, yPos);
    yPos += 6;

    const addressDetails = [
      ['Address', nomination.address || 'N/A'],
      ['City', nomination.city || 'N/A'],
      ['State', nomination.state || 'N/A'],
      ['Pincode', nomination.pincode || 'N/A'],
      ['Country', nomination.country || 'N/A'],
    ];

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    addressDetails.forEach(([label, value]) => {
      doc.setTextColor(100, 100, 100);
      doc.text(label + ':', leftMargin, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(value, leftMargin + 50, yPos);
      yPos += lineHeight;
    });

    yPos += 5;

    // ─── Message ──────────────────────────────────────────────────────────
    if (nomination.message && nomination.message !== 'No message provided') {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('MESSAGE', leftMargin, yPos);
      yPos += 6;
      doc.setDrawColor(200, 200, 200);
      doc.line(leftMargin, yPos, rightMargin, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(60, 60, 60);
      const messageLines = doc.splitTextToSize(nomination.message, pageWidth - 40);
      doc.text(messageLines, leftMargin, yPos);
      yPos += messageLines.length * lineHeight + 5;
    }

    // ─── Nomination Details ──────────────────────────────────────────────
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('NOMINATION DETAILS', leftMargin, yPos);
    yPos += 6;
    doc.setDrawColor(200, 200, 200);
    doc.line(leftMargin, yPos, rightMargin, yPos);
    yPos += 6;

    const nomDetails = [
      ['Award Category', nomination.awardName || 'N/A'],
      ['Amount Paid', `₹${nomination.paymentAmount || 0}`],
      ['Payment Status', (nomination.paymentStatus || 'PENDING').toUpperCase()],
      ['Nomination Status', (nomination.status || 'pending').toUpperCase()],
      ['Payment ID', nomination.paymentId || 'N/A'],
      ['Transaction ID', nomination.transactionId || 'N/A'],
      ['Nomination Date', nomination.nominationDate || 'N/A'],
      ['Nomination ID', nomination.id || 'N/A'],
    ];

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    nomDetails.forEach(([label, value]) => {
      doc.setTextColor(100, 100, 100);
      doc.text(label + ':', leftMargin, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(value, leftMargin + 55, yPos);
      yPos += lineHeight;
    });

    yPos += 5;

    // ─── Reason ──────────────────────────────────────────────────────────
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('NOMINATION REASON', leftMargin, yPos);
    yPos += 6;
    doc.setDrawColor(200, 200, 200);
    doc.line(leftMargin, yPos, rightMargin, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const reasonLines = doc.splitTextToSize(nomination.reason || 'No reason provided', pageWidth - 40);
    doc.text(reasonLines, leftMargin, yPos);
    yPos += reasonLines.length * lineHeight + 10;

    // ─── Admin Remarks ──────────────────────────────────────────────────
    if (nomination.adminRemarks) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('ADMIN REMARKS', leftMargin, yPos);
      yPos += 6;
      doc.setDrawColor(200, 200, 200);
      doc.line(leftMargin, yPos, rightMargin, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 70, 0);
      const remarkLines = doc.splitTextToSize(nomination.adminRemarks, pageWidth - 40);
      doc.text(remarkLines, leftMargin, yPos);
      yPos += remarkLines.length * lineHeight + 5;
    }

    // ─── Footer ──────────────────────────────────────────────────────────
    const footerY = pageHeight - 20;
    doc.setDrawColor(200, 200, 200);
    doc.line(leftMargin, footerY, rightMargin, footerY);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated on ${new Date().toLocaleString()} • Nomination ID: ${nomination.id || 'N/A'}`,
      pageWidth / 2,
      footerY + 6,
      { align: 'center' }
    );

    // ─── Save PDF ──────────────────────────────────────────────────────────
    doc.save(`Nomination_${nomination.nomineeName || 'Unknown'}_${nomination.id || 'unknown'}.pdf`);
  };

  // Admin Actions
  const handleConfirmNomination = async (nomination) => {
    if (window.confirm(`Confirm nomination for ${nomination.nomineeName}?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/nominations/${nomination.id}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'approved',
            adminRemarks: 'Nomination confirmed by admin'
          })
        });
        
        const data = await response.json();
        if (data.success) {
          alert("✅ Nomination confirmed successfully!");
          fetchNominations();
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
      if (window.confirm(`Reject nomination for ${nomination.nomineeName}?`)) {
        try {
          const response = await fetch(`${API_BASE_URL}/nominations/${nomination.id}/status`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: 'rejected',
              adminRemarks: reason
            })
          });
          
          const data = await response.json();
          if (data.success) {
            alert(`✅ Nomination rejected.`);
            fetchNominations();
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

  const handleShortlistNomination = async (nomination) => {
    if (window.confirm(`Shortlist ${nomination.nomineeName} for this award?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/nominations/${nomination.id}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'shortlisted',
            adminRemarks: 'Nomination shortlisted by admin'
          })
        });
        
        const data = await response.json();
        if (data.success) {
          alert("✅ Nomination shortlisted successfully!");
          fetchNominations();
          setShowDetailsModal(false);
        } else {
          alert(data.message || "Failed to shortlist nomination");
        }
      } catch (error) {
        console.error('Error shortlisting nomination:', error);
        alert("Error shortlisting nomination");
      }
    }
  };

  const handleMarkAsWinner = async (nomination) => {
    if (window.confirm(`Mark ${nomination.nomineeName} as WINNER?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/nominations/${nomination.id}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'winner',
            adminRemarks: 'Congratulations! You are the winner!'
          })
        });
        
        const data = await response.json();
        if (data.success) {
          alert("🏆 Nomination marked as WINNER!");
          fetchNominations();
          setShowDetailsModal(false);
        } else {
          alert(data.message || "Failed to mark as winner");
        }
      } catch (error) {
        console.error('Error marking as winner:', error);
        alert("Error marking as winner");
      }
    }
  };

  const handleViewDetails = (nomination) => {
    setSelectedNomination(nomination);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (nomination) => {
    const status = getAdminStatusFromNomination(nomination);
    const badges = {
      pending_verification: { color: "bg-yellow-100 text-yellow-800", text: "Pending Verification", icon: Clock },
      awaiting_payment: { color: "bg-orange-100 text-orange-800", text: "Awaiting Payment", icon: Clock },
      confirmed: { color: "bg-green-100 text-green-800", text: "Confirmed", icon: CheckCircle },
      payment_failed: { color: "bg-red-100 text-red-800", text: "Payment Failed", icon: XCircle },
      shortlisted: { color: "bg-blue-100 text-blue-800", text: "Shortlisted", icon: CheckCircle },
      winner: { color: "bg-purple-100 text-purple-800", text: "Winner", icon: Award },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected", icon: XCircle },
      refunded: { color: "bg-gray-100 text-gray-800", text: "Refunded", icon: XCircle }
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
    const headers = [
      'Nomination ID', 'Nominee Name', 'Email', 'Phone', 'Company', 
      'Award', 'Amount', 'Payment Status', 'Nomination Status',
      'Address', 'City', 'State', 'Pincode', 'Country', 'Message',
      'Date'
    ];
    const csvData = filteredNominations.map(nom => [
      nom.id,
      nom.nomineeName,
      nom.nomineeEmail,
      nom.nomineePhone,
      nom.nomineeCompany,
      nom.awardName,
      nom.paymentAmount,
      nom.paymentStatus,
      nom.status,
      nom.address,
      nom.city,
      nom.state,
      nom.pincode,
      nom.country,
      nom.message,
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

  const uniqueAwards = [...new Map(nominations.map(n => [n.awardId, n.awardName])).values()];

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
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nomination Management</h2>
          <p className="text-gray-500 text-sm mt-1">View and manage all award nominations, payments, and personal details</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={handleExportCSV}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
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
              <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
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
                placeholder="Search by name, email, company, address, city, state, country..."
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
            <option value="shortlisted">Shortlisted</option>
            <option value="winner">Winner</option>
            <option value="rejected">Rejected</option>
            <option value="payment_failed">Payment Failed</option>
          </select>
          <select
            value={awardFilter}
            onChange={(e) => setAwardFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Awards</option>
            {awards.map(award => (
              <option key={award._id} value={award._id}>{award.name}</option>
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
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Nominee</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Image</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Award</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Company</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Address</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">City</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">State</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Pincode</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Country</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Amount</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Status</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Date</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedNominations.map((nom) => (
                <tr key={nom.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-600 text-sm font-mono">
                    {nom.id?.slice(-8) || 'N/A'}
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900">{nom.nomineeName || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{nom.nomineeEmail || 'N/A'}</p>
                      <p className="text-xs text-gray-400">{nom.nomineePhone || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    {nom.nomineeImage ? (
                      <img 
                        src={getImageUrl(nom.nomineeImage)} 
                        alt={nom.nomineeName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{nom.awardName || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{nom.nomineeCompany || 'N/A'}</td>
                  <td className="p-4 text-sm text-gray-600 max-w-[120px] truncate">
                    {nom.address || 'N/A'}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{nom.city || 'N/A'}</td>
                  <td className="p-4 text-sm text-gray-600">{nom.state || 'N/A'}</td>
                  <td className="p-4 text-sm text-gray-600">{nom.pincode || 'N/A'}</td>
                  <td className="p-4 text-sm text-gray-600">{nom.country || 'N/A'}</td>
                  <td className="p-4">
                    <span className="font-semibold text-gray-900">₹{nom.paymentAmount || 0}</span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(nom)}
                  </td>
                  <td className="p-4 text-sm text-gray-500">{nom.nominationDate || 'N/A'}</td>
                  <td className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleViewDetails(nom)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {nom.paymentStatus === "pending" && (
                        <button
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                          title="Awaiting Payment"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                      {nom.paymentStatus === "completed" && nom.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleConfirmNomination(nom)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Confirm Nomination"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleShortlistNomination(nom)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Shortlist"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {nom.status === "shortlisted" && (
                        <button
                          onClick={() => handleMarkAsWinner(nom)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Mark as Winner"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                      )}
                      {(nom.status === "pending" || nom.status === "shortlisted") && (
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
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Nomination Details</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateNominationPDF(selectedNomination)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
                  title="Download PDF"
                >
                  <FileDown className="w-5 h-5" />
                  <span className="text-sm font-medium">PDF</span>
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Profile Image Section */}
              <div className="flex items-start gap-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex-shrink-0">
                  {selectedNomination.nomineeImage ? (
                    <img 
                      src={getImageUrl(selectedNomination.nomineeImage)} 
                      alt={selectedNomination.nomineeName}
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                      <User className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedNomination.nomineeName}</h3>
                  <p className="text-gray-500">{selectedNomination.nomineeEmail}</p>
                  <p className="text-gray-500 text-sm">{selectedNomination.nomineePhone}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {getStatusBadge(selectedNomination)}
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      <CreditCard className="w-3 h-3" />
                      {selectedNomination.paymentStatus?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Details Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Full Name</label>
                    <p className="font-semibold text-gray-900">{selectedNomination.nomineeName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Email Address</label>
                    <p className="text-blue-600">{selectedNomination.nomineeEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Phone Number</label>
                    <p className="text-gray-900">{selectedNomination.nomineePhone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Company Name</label>
                    <p className="text-gray-900">{selectedNomination.nomineeCompany || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Designation</label>
                    <p className="text-gray-900">{selectedNomination.nomineeDesignation || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Address Details Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Address Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="md:col-span-3">
                    <label className="text-xs text-gray-500 font-medium">Address</label>
                    <p className="text-gray-900">{selectedNomination.address || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">City</label>
                    <p className="text-gray-900">{selectedNomination.city || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">State</label>
                    <p className="text-gray-900">{selectedNomination.state || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Pincode</label>
                    <p className="text-gray-900">{selectedNomination.pincode || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs text-gray-500 font-medium">Country</label>
                    <p className="text-gray-900">{selectedNomination.country || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Message Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  Message
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedNomination.message || 'No message provided'}</p>
                </div>
              </div>

              {/* Nomination Details Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Nomination Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Award Category</label>
                    <p className="font-semibold text-gray-900">{selectedNomination.awardName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Amount Paid</label>
                    <p className="font-semibold text-green-600">₹{selectedNomination.paymentAmount || 0}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Payment Status</label>
                    <p className={`font-medium ${selectedNomination.paymentStatus === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                      {selectedNomination.paymentStatus?.toUpperCase() || 'PENDING'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Nomination Status</label>
                    <p className="font-medium capitalize">{selectedNomination.status || 'pending'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Payment ID</label>
                    <p className="font-mono text-sm">{selectedNomination.paymentId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Transaction ID</label>
                    <p className="font-mono text-sm">{selectedNomination.transactionId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Nomination Date</label>
                    <p className="text-gray-900">{selectedNomination.nominationDate || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Nomination ID</label>
                    <p className="font-mono text-sm">{selectedNomination.id || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Reason Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  Nomination Reason
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedNomination.reason || 'No reason provided'}</p>
                </div>
              </div>

              {/* Admin Remarks */}
              {selectedNomination.adminRemarks && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    Admin Remarks
                  </h4>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-gray-700">{selectedNomination.adminRemarks}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex flex-wrap gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-white transition"
              >
                Close
              </button>
              
              <button
                onClick={() => generateNominationPDF(selectedNomination)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Download PDF
              </button>
              
              {selectedNomination.paymentStatus === "completed" && selectedNomination.status === "pending" && (
                <>
                  <button
                    onClick={() => handleConfirmNomination(selectedNomination)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <CheckSquare className="w-4 h-4 inline mr-2" />
                    Confirm Nomination
                  </button>
                  <button
                    onClick={() => handleShortlistNomination(selectedNomination)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Users className="w-4 h-4 inline mr-2" />
                    Shortlist
                  </button>
                </>
              )}
              
              {selectedNomination.status === "shortlisted" && (
                <button
                  onClick={() => handleMarkAsWinner(selectedNomination)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <Award className="w-4 h-4 inline mr-2" />
                  Mark as Winner
                </button>
              )}
              
              {(selectedNomination.status === "pending" || selectedNomination.status === "shortlisted") && (
                <button
                  onClick={() => handleRejectNomination(selectedNomination)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <XCircle className="w-4 h-4 inline mr-2" />
                  Reject
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}