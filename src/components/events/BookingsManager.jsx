import { useState } from "react";

export default function BookingsManager({ bookings, events, onUpdate, onUpdateEventCapacity }) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [paymentNote, setPaymentNote] = useState("");

  const getEventTitle = (eventId) => {
    const event = events.find(ev => ev.id === eventId);
    return event ? event.title : "Unknown Event";
  };

  const getEvent = (eventId) => {
    return events.find(ev => ev.id === eventId);
  };

  const getRemainingCapacity = (eventId) => {
    const event = getEvent(eventId);
    if (!event) return 0;
    const eventBookings = bookings.filter(bk => bk.eventId === eventId && bk.status === "Paid");
    const ticketsSold = eventBookings.reduce((sum, bk) => sum + (bk.tickets || 1), 0);
    return event.capacity - ticketsSold;
  };

  const handleUpdateStatus = (bookingId, newStatus) => {
    const booking = bookings.find(bk => bk.id === bookingId);
    if (!booking) return;

    let updatedBookings = [...bookings];
    
    if (newStatus === "Paid" && booking.status === "Pending") {
      // Confirm payment - this reduces capacity
      if (window.confirm(`Confirm payment for ${booking.customer}? This will deduct ${booking.tickets} tickets from event capacity.\n\nAmount: ₹${booking.amount}`)) {
        updatedBookings = bookings.map(bk =>
          bk.id === bookingId ? { ...bk, status: newStatus, paidAt: new Date().toISOString() } : bk
        );
        onUpdate(updatedBookings);
        
        // Update event capacity if needed
        if (onUpdateEventCapacity) {
          const event = getEvent(booking.eventId);
          const eventBookings = updatedBookings.filter(bk => bk.eventId === booking.eventId && bk.status === "Paid");
          const ticketsSold = eventBookings.reduce((sum, bk) => sum + (bk.tickets || 1), 0);
          onUpdateEventCapacity(booking.eventId, ticketsSold);
        }
        
        // Send confirmation email simulation
        alert(`✅ Payment Confirmed!\n\nBooking ID: ${booking.id}\nCustomer: ${booking.customer}\nTickets: ${booking.tickets}\nAmount: ₹${booking.amount}\n\n📧 Confirmation email sent to ${booking.email}\n📱 SMS sent to ${booking.phone || 'N/A'}`);
      }
    } 
    else if (newStatus === "Cancelled" && booking.status === "Pending") {
      // Cancel pending booking - release seat hold
      if (window.confirm(`Cancel pending booking for ${booking.customer}? This will release ${booking.tickets} held seats.`)) {
        updatedBookings = bookings.map(bk =>
          bk.id === bookingId ? { ...bk, status: newStatus, cancelledAt: new Date().toISOString() } : bk
        );
        onUpdate(updatedBookings);
        
        // Release the held seats back to capacity
        if (onUpdateEventCapacity) {
          const event = getEvent(booking.eventId);
          // Note: For pending bookings, seats were on hold. We need to release them.
          // This depends on how you track holds. For now, we just recalc paid bookings.
          const eventBookings = updatedBookings.filter(bk => bk.eventId === booking.eventId && bk.status === "Paid");
          const ticketsSold = eventBookings.reduce((sum, bk) => sum + (bk.tickets || 1), 0);
          onUpdateEventCapacity(booking.eventId, ticketsSold);
        }
        alert(`❌ Booking cancelled for ${booking.customer}. Held seats have been released.`);
      }
    }
    else if (newStatus === "Refunded" && booking.status === "Paid") {
      // Refund - this INCREASES capacity back
      if (window.confirm(`Refund ₹${booking.amount} to ${booking.customer}? This will add ${booking.tickets} tickets back to capacity.`)) {
        updatedBookings = bookings.map(bk =>
          bk.id === bookingId ? { ...bk, status: newStatus, refundedAt: new Date().toISOString() } : bk
        );
        onUpdate(updatedBookings);
        
        // Increase capacity back
        if (onUpdateEventCapacity) {
          const event = getEvent(booking.eventId);
          const eventBookings = updatedBookings.filter(bk => bk.eventId === booking.eventId && bk.status === "Paid");
          const ticketsSold = eventBookings.reduce((sum, bk) => sum + (bk.tickets || 1), 0);
          onUpdateEventCapacity(booking.eventId, ticketsSold);
        }
        alert(`💰 Refund processed for ${booking.customer}. ${booking.tickets} ticket(s) added back to inventory.`);
      }
    }
    else {
      updatedBookings = bookings.map(bk =>
        bk.id === bookingId ? { ...bk, status: newStatus } : bk
      );
      onUpdate(updatedBookings);
    }
  };

  const handleDelete = (bookingId) => {
    const booking = bookings.find(bk => bk.id === bookingId);
    if (!booking) return;
    
    let warningMsg = `Are you sure you want to delete booking for ${booking.customer}?`;
    if (booking.status === "Paid") {
      warningMsg = `⚠️ WARNING: This booking is PAID (₹${booking.amount}).\n\nDeleting will remove ${booking.tickets} tickets from capacity.\n\nAre you sure?`;
    }
    
    if (window.confirm(warningMsg)) {
      let updatedBookings = bookings.filter(bk => bk.id !== bookingId);
      onUpdate(updatedBookings);
      
      // Update capacity if deleting a paid booking
      if (booking.status === "Paid" && onUpdateEventCapacity) {
        const event = getEvent(booking.eventId);
        const eventBookings = updatedBookings.filter(bk => bk.eventId === booking.eventId && bk.status === "Paid");
        const ticketsSold = eventBookings.reduce((sum, bk) => sum + (bk.tickets || 1), 0);
        onUpdateEventCapacity(booking.eventId, ticketsSold);
      }
      alert(`🗑️ Booking deleted for ${booking.customer}.`);
    }
  };

  const handleSendReminder = (booking) => {
    if (booking.status === "Pending") {
      alert(`📧 Reminder sent to ${booking.email}\n📱 SMS sent to ${booking.phone}\n\nSubject: Complete your payment for ${getEventTitle(booking.eventId)}\n\nBooking ID: ${booking.id}\nAmount Due: ₹${booking.amount}`);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Paid: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Cancelled: "bg-red-100 text-red-800",
      Refunded: "bg-purple-100 text-purple-800"
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const filteredBookings = filterStatus === "all"
    ? bookings
    : bookings.filter(bk => bk.status === filterStatus);

  const totalRevenue = bookings
    .filter(bk => bk.status === "Paid")
    .reduce((sum, bk) => sum + bk.amount, 0);

  const pendingCount = bookings.filter(bk => bk.status === "Pending").length;
  const paidCount = bookings.filter(bk => bk.status === "Paid").length;
  const cancelledCount = bookings.filter(bk => bk.status === "Cancelled").length;
  const refundedCount = bookings.filter(bk => bk.status === "Refunded").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Booking Management</h2>
        <p className="text-slate-500 text-sm mt-1">Manage ticket bookings, payments, and capacity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
            <i className="fas fa-ticket-alt text-3xl text-orange-600"></i>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <i className="fas fa-clock text-3xl text-yellow-600"></i>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">{paidCount}</p>
            </div>
            <i className="fas fa-check-circle text-3xl text-green-600"></i>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <i className="fas fa-rupee-sign text-3xl text-green-600"></i>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Ticket Price</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{paidCount > 0 ? Math.round(totalRevenue / paidCount) : 0}
              </p>
            </div>
            <i className="fas fa-chart-line text-3xl text-blue-600"></i>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 flex-wrap">
        {["all", "Pending", "Paid", "Cancelled", "Refunded"].map(status => {
          let count = 0;
          if (status === "all") count = bookings.length;
          else if (status === "Pending") count = pendingCount;
          else if (status === "Paid") count = paidCount;
          else if (status === "Cancelled") count = cancelledCount;
          else if (status === "Refunded") count = refundedCount;
          
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-sm font-medium transition ${
                filterStatus === status
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {status === "all" ? "All" : status}
              {count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                  status === "Paid" ? "bg-green-100 text-green-800" :
                  status === "Cancelled" ? "bg-red-100 text-red-800" :
                  status === "Refunded" ? "bg-purple-100 text-purple-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <i className="fas fa-credit-card text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No bookings found</p>
          <p className="text-gray-400 mt-2">Bookings will appear here when customers purchase tickets</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Booking ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Contact</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Event</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Tickets</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map(booking => {
                  const event = getEvent(booking.eventId);
                  const remainingCapacity = event ? getRemainingCapacity(booking.eventId) : 0;
                  
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono text-sm">
                        <button 
                          onClick={() => setSelectedBooking(booking)}
                          className="text-orange-600 hover:underline"
                        >
                          {booking.id.slice(0, 8)}...
                        </button>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{booking.customer}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>{booking.email}</div>
                        <div className="text-xs text-gray-500">{booking.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getEventTitle(booking.eventId)}
                        {remainingCapacity < 20 && remainingCapacity > 0 && booking.status === "Pending" && (
                          <span className="ml-2 text-xs text-orange-600">(Only {remainingCapacity} left!)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="font-medium">{booking.tickets}</span> ticket(s)
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">₹{booking.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {booking.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(booking.id, "Paid")}
                                className="text-green-600 hover:text-green-800"
                                title="Confirm Payment & Book Tickets"
                              >
                                <i className="fas fa-check-circle text-xl"></i>
                              </button>
                              <button
                                onClick={() => handleSendReminder(booking)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Send Payment Reminder"
                              >
                                <i className="fas fa-bell text-xl"></i>
                              </button>
                            </>
                          )}
                          {booking.status === "Paid" && (
                            <button
                              onClick={() => handleUpdateStatus(booking.id, "Refunded")}
                              className="text-purple-600 hover:text-purple-800"
                              title="Refund Payment"
                            >
                              <i className="fas fa-undo-alt text-xl"></i>
                            </button>
                          )}
                          {booking.status !== "Cancelled" && booking.status !== "Refunded" && (
                            <button
                              onClick={() => handleUpdateStatus(booking.id, "Cancelled")}
                              className="text-red-600 hover:text-red-800"
                              title="Cancel Booking"
                            >
                              <i className="fas fa-times-circle text-xl"></i>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Delete Booking"
                          >
                            <i className="fas fa-trash-alt text-xl"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Booking Information</p>
                  <p className="font-mono text-sm mt-1">{selectedBooking.id}</p>
                  <p className="text-xs text-gray-400 mt-1">Created: {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString() : selectedBooking.date}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Customer Details</p>
                  <p className="font-medium mt-1">{selectedBooking.customer}</p>
                  <p className="text-sm">{selectedBooking.email}</p>
                  <p className="text-sm">{selectedBooking.phone || 'No phone provided'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Event Details</p>
                  <p className="font-medium mt-1">{getEventTitle(selectedBooking.eventId)}</p>
                  <p className="text-sm">Tickets: {selectedBooking.tickets}</p>
                  <p className="text-sm">Amount: ₹{selectedBooking.amount.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <span className={`inline-flex mt-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                  {selectedBooking.paidAt && (
                    <p className="text-xs text-gray-500 mt-1">Paid on: {new Date(selectedBooking.paidAt).toLocaleString()}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                {selectedBooking.status === "Pending" && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedBooking.id, "Paid");
                      setSelectedBooking(null);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Confirm Payment
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