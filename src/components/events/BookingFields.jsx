// src/components/events/BookingFields.jsx
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useAuthStore } from "../../stores/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function BookingFields() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    revenue: 0,
  });

  const { token, isAuthenticated } = useAuthStore();

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        "Content-Type": "application/json",
      };

      if (token && isAuthenticated) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const url = new URL(`${API_BASE_URL}/event-bookings/admin/all`);
      
      // Add filter params
      if (filterStatus !== "all") {
        url.searchParams.append("paymentStatus", filterStatus);
      }

      const response = await fetch(url.toString(), { headers });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch bookings");
      }

      const data = await response.json();
      
      // Transform API data to match component structure
      const transformedBookings = data.data.map((booking) => ({
        id: booking._id,
        bookingNumber: booking.bookingNumber,
        customerName: booking.fullName || booking.userId?.name || "N/A",
        email: booking.email,
        phone: booking.contactNumber || "N/A",
        eventTitle: booking.eventId?.title || "Event",
        tickets: booking.tickets,
        ticketPrice: booking.ticketPrice || 0,
        totalAmount: booking.totalAmount || 0,
        paymentStatus: booking.paymentStatus || "pending",
        bookingStatus: booking.bookingStatus || "pending",
        createdAt: booking.createdAt,
        eventImage: booking.eventId?.bannerImage || null,
        razorpayPaymentId: booking.razorpayPaymentId || null,
        razorpayOrderId: booking.razorpayOrderId || null,
        companyName: booking.companyName || "",
        address: booking.address || "",
        city: booking.city || "",
        pincode: booking.pincode || "",
        state: booking.state || "",
        country: booking.country || "IN",
        message: booking.message || "",
      }));

      setBookings(transformedBookings);

      // Calculate stats
      const totalBookings = transformedBookings.length;
      const pendingCount = transformedBookings.filter(
        (b) => b.paymentStatus === "pending"
      ).length;
      const completedCount = transformedBookings.filter(
        (b) => b.paymentStatus === "completed"
      ).length;
      const totalRevenue = transformedBookings
        .filter((b) => b.paymentStatus === "completed")
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      setStats({
        total: totalBookings,
        pending: pendingCount,
        confirmed: completedCount,
        revenue: totalRevenue,
      });

    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and refetch when filter changes
  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  // Delete booking
  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (token && isAuthenticated) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/event-bookings/admin/${bookingId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete booking");
      }

      setBookings(bookings.filter((b) => b.id !== bookingId));
      // Update stats after deletion
      fetchBookings();
      alert("Booking deleted successfully!");

    } catch (err) {
      console.error("Error deleting booking:", err);
      alert(err.message || "Failed to delete booking");
    }
  };

  // Cancel booking (admin or user)
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (token && isAuthenticated) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/event-bookings/${bookingId}/cancel`,
        {
          method: "PUT",
          headers,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel booking");
      }

      const data = await response.json();
      
      // Update local state
      const updatedBookings = bookings.map((b) =>
        b.id === bookingId
          ? { ...b, bookingStatus: "cancelled" }
          : b
      );
      setBookings(updatedBookings);
      alert("Booking cancelled successfully!");

    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert(err.message || "Failed to cancel booking");
    }
  };

  // Update booking status (admin)
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (token && isAuthenticated) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/event-bookings/admin/${bookingId}/status`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ bookingStatus: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update status");
      }

      const data = await response.json();
      
      // Update local state
      const updatedBookings = bookings.map((b) =>
        b.id === bookingId
          ? { ...b, bookingStatus: newStatus }
          : b
      );
      setBookings(updatedBookings);
      alert(`Booking status updated to ${newStatus}`);

    } catch (err) {
      console.error("Error updating status:", err);
      alert(err.message || "Failed to update status");
    }
  };

  // Payment Status Badge
  const paymentBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-purple-100 text-purple-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  // Booking Status Badge
  const bookingBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  // Generate PDF
  const generateBookingPDF = (booking) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    doc.setFontSize(20);
    doc.setTextColor(124, 58, 237);
    doc.setFont("helvetica", "bold");
    doc.text("Event Booking Confirmation", margin, 30);

    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text(`Booking #: ${booking.bookingNumber}`, margin, 40);

    const dateStr = booking.createdAt
      ? new Date(booking.createdAt).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";
    doc.text(`Date: ${dateStr}`, pageWidth - margin - 60, 40);

    // Customer Details
    let yPos = 58;
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.text("Customer Details", margin, yPos);
    yPos += 8;

    doc.setFillColor(243, 244, 246);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 45, 3, 3, "F");

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    let textY = yPos + 8;

    doc.text(`Name: ${booking.customerName}`, margin + 8, textY);
    textY += 7;
    doc.text(`Email: ${booking.email}`, margin + 8, textY);
    textY += 7;
    doc.text(`Phone: ${booking.phone}`, margin + 8, textY);
    textY += 7;
    doc.text(`Company: ${booking.companyName || "N/A"}`, margin + 8, textY);

    yPos += 53;

    // Event Details
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.text("Event Details", margin, yPos);
    yPos += 8;

    doc.setFillColor(243, 244, 246);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 45, 3, 3, "F");

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    textY = yPos + 8;

    doc.text(`Event: ${booking.eventTitle}`, margin + 8, textY);
    textY += 7;
    doc.text(`Tickets: ${booking.tickets}`, margin + 8, textY);
    textY += 7;
    doc.text(`Price per ticket: ₹${(booking.ticketPrice || 0).toLocaleString()}`, margin + 8, textY);
    textY += 7;
    doc.text(
      `Address: ${booking.address || ""}, ${booking.city || ""}, ${booking.state || ""} ${booking.pincode || ""}`,
      margin + 8,
      textY
    );

    yPos += 53;

    // Payment & Status
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.text("Payment & Status", margin, yPos);
    yPos += 8;

    doc.setFillColor(243, 244, 246);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 40, 3, 3, "F");

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    textY = yPos + 8;

    doc.text(`Payment Status: ${booking.paymentStatus.toUpperCase()}`, margin + 8, textY);
    textY += 7;
    doc.text(`Booking Status: ${booking.bookingStatus.toUpperCase()}`, margin + 8, textY);
    textY += 7;
    if (booking.razorpayPaymentId) {
      doc.text(`Payment ID: ${booking.razorpayPaymentId}`, margin + 8, textY);
      textY += 7;
    }

    yPos += 48;

    // Total Amount
    doc.setFontSize(16);
    doc.setTextColor(124, 58, 237);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: ₹${(booking.totalAmount || 0).toLocaleString()}`, margin, yPos);

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "italic");
    doc.text(
      "This is a system-generated booking confirmation.",
      margin,
      footerY + 8
    );

    doc.save(`Booking_${booking.bookingNumber}.pdf`);
  };

  // Filter bookings
  const filteredBookings = filterStatus === "all"
    ? bookings
    : bookings.filter((b) => b.paymentStatus === filterStatus);

  // Get filter counts
  const getFilterCounts = () => {
    const counts = {
      all: bookings.length,
      pending: bookings.filter((b) => b.paymentStatus === "pending").length,
      completed: bookings.filter((b) => b.paymentStatus === "completed").length,
      refunded: bookings.filter((b) => b.paymentStatus === "refunded").length,
    };
    return counts;
  };

  const filterCounts = getFilterCounts();

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Refunded", value: "refunded" },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12 text-center">
        <i className="fas fa-exclamation-circle text-6xl text-red-400 mb-4"></i>
        <p className="text-red-600 text-lg">Error loading bookings</p>
        <p className="text-gray-500 mt-2">{error}</p>
        <button
          onClick={fetchBookings}
          className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          <i className="fas fa-sync-alt mr-2"></i>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
      
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <i className="fas fa-ticket-alt text-3xl text-orange-600"></i>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <i className="fas fa-clock text-3xl text-yellow-600"></i>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <i className="fas fa-check-circle text-3xl text-green-600"></i>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{stats.revenue.toLocaleString()}</p>
            </div>
            <i className="fas fa-rupee-sign text-3xl text-green-600"></i>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 flex-wrap">
        {filterOptions.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilterStatus(value)}
            className={`px-4 py-2 text-sm font-medium transition ${
              filterStatus === value
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
            {filterCounts[value] > 0 && (
              <span
                className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  value === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : value === "completed"
                    ? "bg-green-100 text-green-800"
                    : value === "refunded"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {filterCounts[value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <i className="fas fa-credit-card text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No bookings found</p>
          <p className="text-gray-400 mt-2">
            {filterStatus === "all"
              ? "Bookings will appear here when created"
              : `No bookings with ${filterStatus} payment status`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Booking #</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Contact</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Event</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Tickets</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Payment</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Booking</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono text-sm">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="text-orange-600 hover:underline"
                      >
                        {booking.bookingNumber}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {booking.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{booking.email}</div>
                      <div className="text-xs text-gray-500">
                        {booking.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {booking.eventTitle}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="font-medium">{booking.tickets}</span> ticket(s)
                      {booking.ticketPrice > 0 && (
                        <div className="text-xs text-gray-400">
                          @ ₹{booking.ticketPrice.toLocaleString()} each
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ₹{(booking.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${paymentBadge(
                          booking.paymentStatus
                        )}`}
                      >
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${bookingBadge(
                          booking.bookingStatus
                        )}`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <i className="fas fa-eye text-lg"></i>
                        </button>
                        <button
                          onClick={() => generateBookingPDF(booking)}
                          className="text-green-600 hover:text-green-800"
                          title="Download PDF"
                        >
                          <i className="fas fa-file-pdf text-lg"></i>
                        </button>
                        {booking.bookingStatus !== "cancelled" &&
                          booking.bookingStatus !== "completed" && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Cancel Booking"
                            >
                              <i className="fas fa-times-circle text-lg"></i>
                            </button>
                          )}
                        {isAuthenticated && (
                          <>
                            <button
                              onClick={() => {
                                const statuses = ["pending", "confirmed", "cancelled", "completed"];
                                const currentIndex = statuses.indexOf(booking.bookingStatus);
                                const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                                handleUpdateStatus(booking.id, nextStatus);
                              }}
                              className="text-purple-600 hover:text-purple-800"
                              title="Update Status"
                            >
                              <i className="fas fa-sync-alt text-lg"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete Booking"
                            >
                              <i className="fas fa-trash-alt text-lg"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {filteredBookings.length} booking(s) found
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <i className="fas fa-database text-green-500"></i>
              Live data from API
            </p>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Booking Details
                </h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Booking Information
                  </p>
                  <p className="font-mono text-sm font-medium">
                    {selectedBooking.bookingNumber}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Created: {selectedBooking.createdAt
                      ? new Date(selectedBooking.createdAt).toLocaleString()
                      : "—"}
                  </p>
                  {selectedBooking.razorpayPaymentId && (
                    <p className="text-xs text-gray-400 mt-1">
                      Payment ID: {selectedBooking.razorpayPaymentId}
                    </p>
                  )}
                  {selectedBooking.razorpayOrderId && (
                    <p className="text-xs text-gray-400">
                      Order ID: {selectedBooking.razorpayOrderId}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Customer Details
                  </p>
                  <p className="font-medium">{selectedBooking.customerName}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.email}</p>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.phone}
                  </p>
                  {selectedBooking.companyName && (
                    <p className="text-sm text-gray-600">
                      Company: {selectedBooking.companyName}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Address
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.address || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.city || ""}, {selectedBooking.state || ""} {selectedBooking.pincode || ""}
                  </p>
                  <p className="text-sm text-gray-600">
                    Country: {selectedBooking.country || "IN"}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Event Details
                  </p>
                  <p className="font-medium">{selectedBooking.eventTitle}</p>
                  <p className="text-sm text-gray-600">
                    Tickets: {selectedBooking.tickets}
                  </p>
                  <p className="text-sm text-gray-600">
                    Price per ticket: ₹{(selectedBooking.ticketPrice || 0).toLocaleString()}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    Total: ₹{(selectedBooking.totalAmount || 0).toLocaleString()}
                  </p>
                </div>

                {selectedBooking.message && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Message
                    </p>
                    <p className="text-sm text-gray-600">{selectedBooking.message}</p>
                  </div>
                )}

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Status
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Payment</p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${paymentBadge(
                          selectedBooking.paymentStatus
                        )}`}
                      >
                        {selectedBooking.paymentStatus}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Booking</p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${bookingBadge(
                          selectedBooking.bookingStatus
                        )}`}
                      >
                        {selectedBooking.bookingStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => generateBookingPDF(selectedBooking)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-file-pdf"></i>
                  Download PDF
                </button>
                <button
                  onClick={() => setSelectedBooking(null)}
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