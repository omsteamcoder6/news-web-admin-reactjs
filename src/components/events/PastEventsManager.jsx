import { useState } from "react";

export default function PastEventsManager({ events, enquiries, bookings, categories }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const pastEvents = events.filter(ev => ev.status === "past");

  const getCategoryName = (slug) => {
    const category = categories.find(cat => cat.slug === slug);
    return category ? category.name : slug;
  };

  const getEventEnquiries = (eventId) => {
    return enquiries.filter(enq => enq.eventId === eventId);
  };

  const getEventBookings = (eventId) => {
    return bookings.filter(bk => bk.eventId === eventId);
  };

  const getTotalRevenue = (eventId) => {
    return getEventBookings(eventId)
      .filter(bk => bk.status === "Paid")
      .reduce((sum, bk) => sum + bk.amount, 0);
  };

  const getTotalTicketsSold = (eventId) => {
    return getEventBookings(eventId).reduce((sum, bk) => sum + (bk.tickets || 1), 0);
  };

  if (pastEvents.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Past Events Archive</h2>
          <p className="text-slate-500 text-sm mt-1">Archived events that have already taken place</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <i className="fas fa-archive text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No past events</p>
          <p className="text-gray-400 mt-2">Events marked as "Past" will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Past Events Archive</h2>
        <p className="text-slate-500 text-sm mt-1">
          Archived events that have already taken place
          <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
            {pastEvents.length} events
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pastEvents.map(event => {
          const eventEnquiries = getEventEnquiries(event.id);
          const eventBookings = getEventBookings(event.id);
          const totalRevenue = getTotalRevenue(event.id);
          const totalTicketsSold = getTotalTicketsSold(event.id);
          
          return (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-5 py-4 text-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                        {getCategoryName(event.categorySlug)}
                      </span>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-map-marker-alt text-gray-400"></i>
                    <span className="text-gray-600">{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-chair text-gray-400"></i>
                    <span className="text-gray-600">Total Seats: {event.capacity}</span>
                  </div>
                </div>

                {event.desc && (
                  <p className="text-sm text-gray-600 line-clamp-2">{event.desc}</p>
                )}

                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{totalTicketsSold}</p>
                    <p className="text-xs text-gray-500">Tickets Sold</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{eventEnquiries.length}</p>
                    <p className="text-xs text-gray-500">Enquiries</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedEvent(event)}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <i className="fas fa-chart-line"></i>
                  View Analytics & Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">{new Date(selectedEvent.date).toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Venue</p>
                  <p className="font-medium">{selectedEvent.venue}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{getCategoryName(selectedEvent.categorySlug)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Total Seats</p>
                  <p className="font-medium">{selectedEvent.capacity}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Ticket Price</p>
                  <p className="font-medium">{selectedEvent.price > 0 ? `₹${selectedEvent.price}` : "Free"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Tickets Sold</p>
                  <p className="font-medium">{getTotalTicketsSold(selectedEvent.id)}</p>
                </div>
              </div>

              {selectedEvent.desc && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700">{selectedEvent.desc}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  <i className="fas fa-envelope mr-2 text-orange-600"></i>
                  Enquiries ({getEventEnquiries(selectedEvent.id).length})
                </h3>
                {getEventEnquiries(selectedEvent.id).length === 0 ? (
                  <p className="text-gray-500 text-sm">No enquiries for this event</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {getEventEnquiries(selectedEvent.id).map(enq => (
                      <div key={enq.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{enq.name}</span>
                          <span className="text-gray-500">{enq.date}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{enq.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{enq.email} | {enq.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  <i className="fas fa-ticket-alt mr-2 text-orange-600"></i>
                  Bookings ({getEventBookings(selectedEvent.id).length})
                </h3>
                {getEventBookings(selectedEvent.id).length === 0 ? (
                  <p className="text-gray-500 text-sm">No bookings for this event</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2">Customer</th>
                          <th className="text-left p-2">Tickets</th>
                          <th className="text-left p-2">Amount</th>
                          <th className="text-left p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getEventBookings(selectedEvent.id).map(bk => (
                          <tr key={bk.id} className="border-t border-gray-100">
                            <td className="p-2">{bk.customer}</td>
                            <td className="p-2">{bk.tickets || 1}</td>
                            <td className="p-2">₹{bk.amount.toLocaleString()}</td>
                            <td className="p-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                bk.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {bk.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}