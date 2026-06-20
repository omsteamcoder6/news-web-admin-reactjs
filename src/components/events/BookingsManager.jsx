import { useState, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function BookingsManager({ events, token, onUpdate }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [error, setError] = useState(null);
  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const LIMIT = 10;

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  // ─── Fetch bookings from API ───────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (filterStatus !== "all") params.append("paymentStatus", filterStatus);

      const res = await fetch(
        `${API_BASE_URL}/bookings/admin/all?${params.toString()}`,
        { headers: getAuthHeaders() }
      );
      const data = await res.json();

      if (data.success) {
        setBookings(data.data);
        setPagination(data.pagination || { total: data.data.length, pages: 1 });
      } else {
        setError(data.message || "Failed to fetch bookings");
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus, page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ─── Cancel booking via API ────────────────────────────────────────────────
  const handleCancel = async (booking) => {
    if (
      !window.confirm(
        `Cancel booking ${booking.bookingNumber} for ${booking.fullName}?`
      )
    )
      return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/bookings/admin/${booking._id}/cancel`,
        { method: "PUT", headers: getAuthHeaders() }
      );
      const data = await res.json();

      if (data.success) {
        alert(`Booking ${booking.bookingNumber} cancelled successfully.`);
        await fetchBookings();
        if (onUpdate) onUpdate();
      } else {
        alert(data.message || "Failed to cancel booking");
      }
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Error cancelling booking. Please try again.");
    }
  };

  // ─── Helper: event title by eventId ───────────────────────────────────────
  const getEventTitle = (eventId) => {
    if (eventId && typeof eventId === "object") return eventId.title || "—";
    const event = events.find(
      (ev) => ev._id === eventId || ev.id === eventId
    );
    return event ? event.title : "Unknown Event";
  };

  // ─── Get event by ID ──────────────────────────────────────────────────────
  const getEvent = (eventId) => {
    if (eventId && typeof eventId === "object") return eventId;
    return events.find((ev) => ev._id === eventId || ev.id === eventId);
  };

  // ─── Status badge colours ──────────────────────────────────────────────────
  const paymentBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-purple-100 text-purple-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  const bookingBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  // ─── Generate PDF for Booking ─────────────────────────────────────────────
  const generateBookingPDF = (booking) => {
    const event = getEvent(booking.eventId);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    
    // Colors
    const primaryColor = [124, 58, 237];
    const secondaryColor = [243, 244, 246];
    const textColor = [31, 41, 55];
    const mutedTextColor = [107, 114, 128];

    const setTextColor = (color) => {
      doc.setTextColor(color[0], color[1], color[2]);
    };

    const setFillColor = (color) => {
      doc.setFillColor(color[0], color[1], color[2]);
    };

    const drawLine = (y) => {
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, y, pageWidth - margin, y);
    };

    // ─── Header ─────────────────────────────────────────────────────────────
    doc.setFontSize(24);
    setTextColor(primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Event Booking", margin, 30);

    doc.setFontSize(12);
    setTextColor(mutedTextColor);
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

    drawLine(48);

    // ─── Customer Details ──────────────────────────────────────────────────
    let yPos = 58;
    doc.setFontSize(16);
    setTextColor(textColor);
    doc.setFont("helvetica", "bold");
    doc.text("Customer Details", margin, yPos);
    yPos += 8;

    setFillColor(secondaryColor);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 45, 3, 3, "F");
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    let textY = yPos + 8;
    
    doc.text(`Name: ${booking.fullName}`, margin + 8, textY);
    textY += 7;
    if (booking.companyName) {
      doc.text(`Company: ${booking.companyName}`, margin + 8, textY);
      textY += 7;
    }
    doc.text(`Email: ${booking.email}`, margin + 8, textY);
    textY += 7;
    doc.text(`Phone: ${booking.contactNumber || "N/A"}`, margin + 8, textY);
    
    if (booking.address || booking.city || booking.state) {
      const addressStr = [
        booking.address,
        booking.city,
        booking.state,
        booking.pincode,
      ]
        .filter(Boolean)
        .join(", ");
      doc.text(`Address: ${addressStr}`, margin + 120, textY - 14);
    }

    yPos += 53;

    // ─── Event Details ─────────────────────────────────────────────────────
    doc.setFontSize(16);
    setTextColor(textColor);
    doc.setFont("helvetica", "bold");
    doc.text("Event Details", margin, yPos);
    yPos += 8;

    setFillColor(secondaryColor);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 40, 3, 3, "F");
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    textY = yPos + 8;
    
    doc.text(`Event: ${getEventTitle(booking.eventId)}`, margin + 8, textY);
    textY += 7;
    doc.text(`Tickets: ${booking.tickets}`, margin + 8, textY);
    textY += 7;
    doc.text(`Price per ticket: ₹${(booking.ticketPrice || 0).toLocaleString()}`, margin + 8, textY);
    textY += 7;
    doc.text(`Total Amount: ₹${(booking.totalAmount || 0).toLocaleString()}`, margin + 8, textY);

    // Event image
    const eventImage = booking.eventImage || event?.imageUrl;
    if (eventImage) {
      try {
        doc.setFontSize(10);
        setTextColor(mutedTextColor);
        doc.text("Event Image:", pageWidth - margin - 90, yPos + 8);
        doc.roundedRect(pageWidth - margin - 90, yPos + 12, 70, 20, 2, 2, "S");
        doc.setFontSize(8);
        doc.text("Image attached", pageWidth - margin - 55, yPos + 25);
      } catch (err) {
        console.log("Could not render image in PDF");
      }
    }

    yPos += 48;

    // ─── Booking Image ──────────────────────────────────────────────────────
    if (booking.bookingImage) {
      doc.setFontSize(16);
      setTextColor(textColor);
      doc.setFont("helvetica", "bold");
      doc.text("Booking Image", margin, yPos);
      yPos += 8;

      setFillColor(secondaryColor);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 30, 3, 3, "F");
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      setTextColor(mutedTextColor);
      doc.text("Booking image attached", margin + 8, yPos + 18);
      
      yPos += 38;
    }

    // ─── Payment & Status ──────────────────────────────────────────────────
    doc.setFontSize(16);
    setTextColor(textColor);
    doc.setFont("helvetica", "bold");
    doc.text("Payment & Status", margin, yPos);
    yPos += 8;

    setFillColor(secondaryColor);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 35, 3, 3, "F");
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    textY = yPos + 8;
    
    const paymentStatusMap = {
      pending: "Pending",
      completed: "Completed",
      failed: "Failed",
      refunded: "Refunded",
    };
    const bookingStatusMap = {
      pending: "Pending",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      completed: "Completed",
    };
    
    doc.text(`Payment Status: ${paymentStatusMap[booking.paymentStatus] || booking.paymentStatus}`, margin + 8, textY);
    textY += 7;
    doc.text(`Booking Status: ${bookingStatusMap[booking.bookingStatus] || booking.bookingStatus}`, margin + 8, textY);
    textY += 7;
    
    if (booking.paymentCompletedAt) {
      const paidDate = new Date(booking.paymentCompletedAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      doc.text(`Paid On: ${paidDate}`, margin + 8, textY);
      textY += 7;
    }

    if (booking.razorpayPaymentId) {
      doc.text(`Payment ID: ${booking.razorpayPaymentId}`, margin + 8, textY);
    }

    yPos += 43;

    // ─── Message ────────────────────────────────────────────────────────────
    if (booking.message) {
      doc.setFontSize(14);
      setTextColor(textColor);
      doc.setFont("helvetica", "bold");
      doc.text("Message from Customer", margin, yPos);
      yPos += 6;

      setFillColor(secondaryColor);
      const messageLines = doc.splitTextToSize(booking.message, pageWidth - 2 * margin - 16);
      const messageHeight = Math.max(20, messageLines.length * 6 + 16);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, messageHeight, 3, 3, "F");
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      setTextColor(textColor);
      doc.text(messageLines, margin + 8, yPos + 8);
      
      yPos += messageHeight + 10;
    }

    // ─── Footer ─────────────────────────────────────────────────────────────
    const footerY = doc.internal.pageSize.getHeight() - 20;
    drawLine(footerY);
    doc.setFontSize(10);
    setTextColor(mutedTextColor);
    doc.setFont("helvetica", "italic");
    doc.text(
      "This is a system-generated booking confirmation. Please keep this for your records.",
      margin,
      footerY + 8
    );
    doc.text(
      `Generated on: ${new Date().toLocaleString("en-IN")}`,
      pageWidth - margin - 70,
      footerY + 8
    );

    doc.save(`Booking_${booking.bookingNumber}.pdf`);
  };

  // ─── Stats ────────────────────────────────────────────────────────────────
  const totalRevenue = bookings
    .filter((bk) => bk.paymentStatus === "completed")
    .reduce((sum, bk) => sum + (bk.totalAmount || 0), 0);

  const pendingCount = bookings.filter(
    (bk) => bk.paymentStatus === "pending"
  ).length;
  const completedCount = bookings.filter(
    (bk) => bk.paymentStatus === "completed"
  ).length;
  const cancelledCount = bookings.filter(
    (bk) => bk.bookingStatus === "cancelled"
  ).length;
  const refundedCount = bookings.filter(
    (bk) => bk.paymentStatus === "refunded"
  ).length;

  const filterOptions = [
    { label: "All", value: "all", count: pagination.total },
    { label: "Pending", value: "pending", count: pendingCount },
    { label: "Completed", value: "completed", count: completedCount },
    { label: "Refunded", value: "refunded", count: refundedCount },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">
          Booking Management
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Manage ticket bookings and payments
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
          <button
            onClick={fetchBookings}
            className="ml-4 underline text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {pagination.total}
              </p>
            </div>
            <i className="fas fa-ticket-alt text-3xl text-orange-600"></i>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingCount}
              </p>
            </div>
            <i className="fas fa-clock text-3xl text-yellow-600"></i>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">
                {completedCount}
              </p>
            </div>
            <i className="fas fa-check-circle text-3xl text-green-600"></i>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{totalRevenue.toLocaleString()}
              </p>
            </div>
            <i className="fas fa-rupee-sign text-3xl text-green-600"></i>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Ticket Price</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹
                {completedCount > 0
                  ? Math.round(totalRevenue / completedCount).toLocaleString()
                  : 0}
              </p>
            </div>
            <i className="fas fa-chart-line text-3xl text-blue-600"></i>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 flex-wrap">
        {filterOptions.map(({ label, value, count }) => (
          <button
            key={value}
            onClick={() => {
              setFilterStatus(value);
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium transition ${
              filterStatus === value
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
            {count > 0 && (
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
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
        </div>
      )}

      {/* Table */}
      {!loading && bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <i className="fas fa-credit-card text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No bookings found</p>
          <p className="text-gray-400 mt-2">
            Bookings will appear here when customers purchase tickets
          </p>
        </div>
      ) : (
        !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Booking #
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Customer
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Contact
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Event
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Tickets
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Payment
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Booking
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Image
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 font-mono text-sm">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="text-orange-600 hover:underline"
                        >
                          {booking.bookingNumber}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {booking.fullName}
                        {booking.companyName && (
                          <div className="text-xs text-gray-400">
                            {booking.companyName}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>{booking.email}</div>
                        <div className="text-xs text-gray-500">
                          {booking.contactNumber || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getEventTitle(booking.eventId)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="font-medium">{booking.tickets}</span>{" "}
                        ticket(s)
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
                        {booking.bookingImage ? (
                          <img 
                            src={booking.bookingImage} 
                            alt="Booking" 
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : booking.eventImage ? (
                          <img 
                            src={booking.eventImage} 
                            alt="Event" 
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No image</span>
                        )}
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
                                onClick={() => handleCancel(booking)}
                                className="text-red-600 hover:text-red-800"
                                title="Cancel Booking"
                              >
                                <i className="fas fa-times-circle text-lg"></i>
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Page {page} of {pagination.pages} &nbsp;·&nbsp;{" "}
                  {pagination.total} total bookings
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === pagination.pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )
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
                    Created:{" "}
                    {selectedBooking.createdAt
                      ? new Date(selectedBooking.createdAt).toLocaleString()
                      : "—"}
                  </p>
                  {selectedBooking.razorpayOrderId && (
                    <p className="text-xs text-gray-400 mt-1">
                      Razorpay Order: {selectedBooking.razorpayOrderId}
                    </p>
                  )}
                  {selectedBooking.razorpayPaymentId && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Payment ID: {selectedBooking.razorpayPaymentId}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Customer Details
                  </p>
                  <p className="font-medium">{selectedBooking.fullName}</p>
                  {selectedBooking.companyName && (
                    <p className="text-sm text-gray-600">
                      {selectedBooking.companyName}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    {selectedBooking.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.contactNumber || "No phone provided"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {[
                      selectedBooking.address,
                      selectedBooking.city,
                      selectedBooking.state,
                      selectedBooking.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Event Details
                  </p>
                  <p className="font-medium">
                    {getEventTitle(selectedBooking.eventId)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tickets: {selectedBooking.tickets}
                  </p>
                  <p className="text-sm text-gray-600">
                    Price per ticket: ₹
                    {(selectedBooking.ticketPrice || 0).toLocaleString()}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    Total: ₹
                    {(selectedBooking.totalAmount || 0).toLocaleString()}
                  </p>
                </div>

                {/* Images */}
                {(selectedBooking.bookingImage || selectedBooking.eventImage) && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Images
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      {selectedBooking.bookingImage && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Booking Image</p>
                          <img 
                            src={selectedBooking.bookingImage} 
                            alt="Booking" 
                            className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect width="96" height="96" fill="%23f3f4f6"/%3E%3Ctext x="48" y="48" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10" font-family="sans-serif"%3ENo image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      )}
                      {selectedBooking.eventImage && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Event Image</p>
                          <img 
                            src={selectedBooking.eventImage} 
                            alt="Event" 
                            className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect width="96" height="96" fill="%23f3f4f6"/%3E%3Ctext x="48" y="48" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10" font-family="sans-serif"%3ENo image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      )}
                    </div>
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
                  {selectedBooking.paymentCompletedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Paid on:{" "}
                      {new Date(
                        selectedBooking.paymentCompletedAt
                      ).toLocaleString()}
                    </p>
                  )}
                </div>

                {selectedBooking.message && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Message
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedBooking.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => generateBookingPDF(selectedBooking)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-file-pdf"></i>
                  Download PDF
                </button>
                {selectedBooking.bookingStatus !== "cancelled" &&
                  selectedBooking.bookingStatus !== "completed" && (
                    <button
                      onClick={() => {
                        handleCancel(selectedBooking);
                        setSelectedBooking(null);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Cancel Booking
                    </button>
                  )}
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