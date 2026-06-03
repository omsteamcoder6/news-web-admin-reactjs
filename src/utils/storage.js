// utils/storage.js

// Event storage
export const getEvents = () => {
  const stored = localStorage.getItem("events");
  if (stored) return JSON.parse(stored);
  
  // Default events
  const defaultEvents = [
    { id: "ev1", title: "South India Business Awards 2025", categorySlug: "corporate-events", date: "2026-07-15T18:00", venue: "Chennai Grand Hall", mapUrl: "", desc: "Prestigious awards ceremony celebrating business excellence", capacity: 450, price: 2500, status: "current", imageUrl: "", enquiries: 12, bookings: 8 },
    { id: "ev2", title: "Startup Expo & Trade Show", categorySlug: "trade-business", date: "2026-08-05T10:00", venue: "CODISSIA Coimbatore", mapUrl: "", desc: "Connect with innovators and investors", capacity: 800, price: 1200, status: "current", imageUrl: "", enquiries: 5, bookings: 3 },
    { id: "ev3", title: "Royal Wedding Expo", categorySlug: "wedding-family", date: "2025-12-10T11:00", venue: "Leela Palace Chennai", mapUrl: "", desc: "Dream wedding showcase", capacity: 300, price: 499, status: "past", imageUrl: "", enquiries: 18, bookings: 22 },
    { id: "ev4", title: "Corporate Leadership Conclave", categorySlug: "corporate-events", date: "2026-09-20T09:00", venue: "Hyatt Regency", mapUrl: "", desc: "Annual leadership meet", capacity: 250, price: 3500, status: "draft", imageUrl: "", enquiries: 0, bookings: 0 }
  ];
  saveEvents(defaultEvents);
  return defaultEvents;
};

export const saveEvents = (events) => {
  localStorage.setItem("events", JSON.stringify(events));
};

// Category storage
export const getCategories = () => {
  const stored = localStorage.getItem("categories");
  if (stored) return JSON.parse(stored);
  
  const defaultCategories = [
    { id: "cat1", name: "Corporate Events", slug: "corporate-events", description: "Business conferences, awards, seminars", status: "active", createdAt: new Date().toISOString() },
    { id: "cat2", name: "Wedding & Family", slug: "wedding-family", description: "Wedding expos, family gatherings", status: "active", createdAt: new Date().toISOString() },
    { id: "cat3", name: "Entertainment Events", slug: "entertainment", description: "Concerts, shows, performances", status: "active", createdAt: new Date().toISOString() },
    { id: "cat4", name: "Educational Events", slug: "educational", description: "Workshops, seminars, training", status: "active", createdAt: new Date().toISOString() },
    { id: "cat5", name: "Trade & Business", slug: "trade-business", description: "Expos, trade shows, networking", status: "active", createdAt: new Date().toISOString() },
    { id: "cat6", name: "Sports & Fitness", slug: "sports-fitness", description: "Tournaments, marathons, fitness camps", status: "active", createdAt: new Date().toISOString() }
  ];
  saveCategories(defaultCategories);
  return defaultCategories;
};

export const saveCategories = (categories) => {
  localStorage.setItem("categories", JSON.stringify(categories));
};

// Enquiry storage
export const getEnquiries = () => {
  const stored = localStorage.getItem("enquiries");
  if (stored) return JSON.parse(stored);
  
  const defaultEnquiries = [
    { id: "enq1", name: "Rajesh K", email: "rajesh@example.com", phone: "9876543210", eventId: "ev1", message: "Interested in sponsorship opportunities for the awards ceremony", date: "2026-05-20", status: "unread" },
    { id: "enq2", name: "Meena S", email: "meena@traders.com", phone: "9988776655", eventId: "ev2", message: "Need exhibition stall details and pricing", date: "2026-05-22", status: "read" }
  ];
  saveEnquiries(defaultEnquiries);
  return defaultEnquiries;
};

export const saveEnquiries = (enquiries) => {
  localStorage.setItem("enquiries", JSON.stringify(enquiries));
};

// Booking storage
export const getBookings = () => {
  const stored = localStorage.getItem("bookings");
  if (stored) return JSON.parse(stored);
  
  const defaultBookings = [
    { id: "bok1", customer: "Vinod Enterprises", eventId: "ev1", tickets: 5, amount: 12500, status: "Paid", date: "2026-05-15" },
    { id: "bok2", customer: "Lakshmi Wedding Planners", eventId: "ev3", tickets: 2, amount: 998, status: "Paid", date: "2025-11-20" },
    { id: "bok3", customer: "TechStart Solutions", eventId: "ev2", tickets: 10, amount: 12000, status: "Pending", date: "2026-05-25" }
  ];
  saveBookings(defaultBookings);
  return defaultBookings;
};

export const saveBookings = (bookings) => {
  localStorage.setItem("bookings", JSON.stringify(bookings));
};

// Helper to generate slug from name
export const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
};