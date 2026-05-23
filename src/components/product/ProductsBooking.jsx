import { useState } from "react"

export default function ProductsBooking({ products }) {
  const [bookings, setBookings] = useState([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: ""
  })

  // Only show books (you can filter by category "Books" or just show all products)
  const availableBooks = products.filter(p => p.status === "published")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBookingForm(prev => ({ ...prev, [name]: value }))
  }

  const handleBookingSubmit = (e) => {
    e.preventDefault()
    
    if (!selectedProductId) {
      alert("Please select a book")
      return
    }

    const selectedBook = products.find(p => p.id === parseInt(selectedProductId))
    
    const newBooking = {
      id: Date.now(),
      bookId: selectedBook.id,
      bookName: selectedBook.name,
      bookPrice: selectedBook.price,
      customerName: bookingForm.name,
      customerEmail: bookingForm.email,
      customerPhone: bookingForm.phone,
      bookingDate: new Date().toISOString(),
      status: "requested"
    }

    setBookings([newBooking, ...bookings])
    
    // Reset form
    setSelectedProductId("")
    setBookingForm({ name: "", email: "", phone: "" })
    
    alert(`Booking request sent for "${selectedBook.name}"!`)
  }

  return (
    <div className="space-y-6">
      {/* Booking Form - Client Side */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Book a Book</h2>
        <p className="text-slate-600 mb-6">Fill in your details and choose a book to book</p>
        
        {availableBooks.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No books available for booking. Please check back later.
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-5">
            {/* Book Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select a Book *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose a book --</option>
                {availableBooks.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.name} - ${parseFloat(book.price).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={bookingForm.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={bookingForm.email}
                onChange={handleInputChange}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={bookingForm.phone}
                onChange={handleInputChange}
                required
                placeholder="+1234567890"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Submit Booking Request
            </button>
          </form>
        )}
      </div>

      {/* Recent Bookings List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">Recent Booking Requests</h2>
        </div>
        
        {bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No bookings yet. Submit a booking request above.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{booking.bookName}</h3>
                    <p className="text-sm text-slate-500">${parseFloat(booking.bookPrice).toFixed(2)}</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {booking.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm mt-3">
                  <div>
                    <span className="text-slate-500">Name:</span>
                    <span className="ml-2 text-slate-700">{booking.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span>
                    <span className="ml-2 text-slate-700">{booking.customerEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Phone:</span>
                    <span className="ml-2 text-slate-700">{booking.customerPhone}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Requested on: {new Date(booking.bookingDate).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}