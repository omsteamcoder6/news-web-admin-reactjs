// src/components/events/UpcomingEventForm.jsx
import { useState, useRef, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function UpcomingEventForm({ 
  token, 
  categories = [], 
  onClose, 
  onSuccess,
  event = null,      // ✅ Event data for editing
  isEdit = false     // ✅ Flag for edit mode
}) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    status: "upcoming",
    date: "",
    time: "",
    venue: "",
    googleMapsUrl: "",
    description: "",
    capacity: 100,
    price: 0,
  });

  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null); // ✅ Store existing image URL
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // ✅ Populate form when editing
  useEffect(() => {
    if (event && isEdit) {
      console.log("📝 Populating form with event data:", event);
      console.log("📋 Available categories:", categories);
      
      // Format date for input field (YYYY-MM-DD)
      let formattedDate = "";
      if (event.date) {
        const dateObj = new Date(event.date);
        formattedDate = dateObj.toISOString().split('T')[0];
      }

      // Format time (HH:MM)
      let formattedTime = "";
      if (event.time) {
        // If time is already in HH:MM format
        if (event.time.includes(':')) {
          formattedTime = event.time;
        } else {
          // Try to parse from date
          try {
            const timeObj = new Date(event.time);
            formattedTime = timeObj.toTimeString().slice(0, 5);
          } catch {
            formattedTime = event.time;
          }
        }
      }

      // ✅ FIX: Find the matching category slug from available categories
      let categoryValue = "";
      
      // First, determine what category identifier we have from the event
      let eventCategoryIdentifier = "";
      
      if (event.categorySlug) {
        eventCategoryIdentifier = event.categorySlug;
      } else if (event.category) {
        if (typeof event.category === "object") {
          // If category is an object, try to get slug, _id, or name
          eventCategoryIdentifier = event.category.slug || event.category._id || event.category.name || "";
        } else {
          // If category is a string
          eventCategoryIdentifier = event.category;
        }
      }

      console.log("🔍 Event category identifier:", eventCategoryIdentifier);

      // Now find matching category from the categories prop
      if (eventCategoryIdentifier && categories.length > 0) {
        // Try to find category by slug first
        let matchedCategory = categories.find(cat => cat.slug === eventCategoryIdentifier);
        
        // If not found by slug, try by _id
        if (!matchedCategory) {
          matchedCategory = categories.find(cat => cat._id === eventCategoryIdentifier);
        }
        
        // If still not found, try by name (case-insensitive)
        if (!matchedCategory) {
          matchedCategory = categories.find(cat => 
            cat.name.toLowerCase() === eventCategoryIdentifier.toLowerCase()
          );
        }
        
        // If we found a match, use its slug
        if (matchedCategory) {
          categoryValue = matchedCategory.slug;
          console.log("✅ Matched category:", matchedCategory.name, "with slug:", matchedCategory.slug);
        } else {
          // If no match found, try to use the original value if it looks like a slug
          // (This handles cases where the category data might already be a slug)
          const isSlug = categories.some(cat => cat.slug === eventCategoryIdentifier);
          if (isSlug) {
            categoryValue = eventCategoryIdentifier;
            console.log("✅ Using original value as slug:", eventCategoryIdentifier);
          } else {
            console.warn("⚠️ No matching category found for:", eventCategoryIdentifier);
            // Set to empty string to show "Select a category" placeholder
            categoryValue = "";
          }
        }
      }

      setFormData({
        title: event.title || "",
        category: categoryValue, // 👈 Now properly matched to dropdown options
        status: event.status || "upcoming",
        date: formattedDate,
        time: formattedTime,
        venue: event.venue || "",
        googleMapsUrl: event.googleMapsUrl || "",
        description: event.description || "",
        capacity: event.capacity || 100,
        price: event.price || 0,
      });

      // Set existing image preview
      if (event.coverImageUrl) {
        const baseUrl = API_BASE_URL.replace('/api', '');
        setExistingImageUrl(`${baseUrl}${event.coverImageUrl}`);
        setCoverImagePreview(`${baseUrl}${event.coverImageUrl}`);
      }

      if (event.coverImage) {
        setExistingImageUrl(event.coverImage);
      }
    }
  }, [event, isEdit, categories]); // ✅ Added categories to dependencies

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("❌ Please upload a JPEG, PNG, GIF, or WebP image.");
      e.target.value = "";
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("❌ Image size must be under 5MB.");
      e.target.value = "";
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setCoverImage(file);
    setCoverImagePreview(previewUrl);
    setExistingImageUrl(null); // ✅ Clear existing image when new one is selected
  };

  // Remove uploaded image
  const removeImage = () => {
    if (coverImagePreview && !existingImageUrl) {
      URL.revokeObjectURL(coverImagePreview);
    }
    setCoverImage(null);
    setCoverImagePreview(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submission for both create and update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!formData.title.trim()) {
      alert("❌ Please enter event title");
      return;
    }
    if (!formData.category) {
      alert("❌ Please select a category");
      return;
    }
    if (!formData.date) {
      alert("❌ Please select event date");
      return;
    }
    if (!formData.time) {
      alert("❌ Please select event time");
      return;
    }
    if (!formData.capacity || formData.capacity < 1) {
      alert("❌ Please enter max capacity (minimum 1)");
      return;
    }

    // Validate Google Maps URL (optional)
    if (formData.googleMapsUrl.trim()) {
      try {
        new URL(formData.googleMapsUrl);
      } catch (_) {
        alert("❌ Please enter a valid Google Maps URL");
        return;
      }
    }

    setLoading(true);

    try {
      // Create FormData for multipart/form-data upload
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("category", formData.category);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("time", formData.time);
      formDataToSend.append("venue", formData.venue || "");
      formDataToSend.append("googleMapsUrl", formData.googleMapsUrl || "");
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("capacity", formData.capacity.toString());
      formDataToSend.append("price", formData.price.toString());

      // Append image if a new one is selected
      if (coverImage) {
        formDataToSend.append("coverImage", coverImage);
      }

      // Determine if POST (create) or PUT (update)
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit 
        ? `${API_BASE_URL}/upcoming-events/${event._id || event.id}` 
        : `${API_BASE_URL}/upcoming-events`;

      console.log(`📤 ${method} request to:`, url);
      console.log("📦 Form data being sent:", {
        title: formData.title,
        category: formData.category,
        status: formData.status,
        date: formData.date,
        time: formData.time,
        venue: formData.venue,
        capacity: formData.capacity,
        price: formData.price,
        hasImage: !!coverImage
      });

      // Send to API
      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`,
          // DON'T set Content-Type - browser will set it with boundary for FormData
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${isEdit ? 'Event updated' : 'Upcoming event created'} successfully!`);
        
        // Reset form if creating new
        if (!isEdit) {
          setFormData({
            title: "",
            category: "",
            status: "upcoming",
            date: "",
            time: "",
            venue: "",
            googleMapsUrl: "",
            description: "",
            capacity: 100,
            price: 0,
          });
          removeImage();
        }
        
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(data.message || `Failed to ${isEdit ? 'update' : 'create'} event`);
        alert(`❌ ${data.message || `Failed to ${isEdit ? 'update' : 'create'} event`}`);
      }
    } catch (error) {
      console.error(`❌ Error ${isEdit ? 'updating' : 'creating'} upcoming event:`, error);
      setError("Failed to connect to server. Please try again.");
      alert(`❌ Error ${isEdit ? 'updating' : 'creating'} event. Please check your connection.`);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Get active categories
  const activeCategories = categories.filter(cat => cat.status === "active");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-orange-600">
              {isEdit ? "✏️ Edit Upcoming Event" : "📅 Create Upcoming Event"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit 
                ? `Editing: ${event?.title || 'Event'}` 
                : "Create a new upcoming event (Connected to backend API)"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Event Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="e.g., South India Business Awards 2025"
              required
            />
          </div>

          {/* Category Dropdown from Backend */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              required
            >
              <option value="">-- Select a category --</option>
              {activeCategories.length > 0 ? (
                activeCategories.map((category) => (
                  <option key={category._id} value={category.slug}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>No categories available. Please create one first.</option>
              )}
            </select>
            {activeCategories.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                ⚠️ No categories found. Please create a category in the Categories tab first.
              </p>
            )}
            {activeCategories.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {activeCategories.length} category(ies) available from backend
              </p>
            )}
            {isEdit && formData.category && (
              <p className="text-xs text-green-600 mt-1">
                ✅ Selected category: {activeCategories.find(cat => cat.slug === formData.category)?.name || formData.category}
              </p>
            )}
          </div>

          {/* Event Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              required
            >
              <option value="upcoming">📅 Upcoming</option>
              <option value="past">⏪ Past</option>
              <option value="cancelled">🚫 Cancelled</option>
            </select>
          </div>

          {/* Event Date & Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Date & Time <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Format: {formatDateForDisplay(formData.date) || "dd-mm-yyyy"}
                </p>
              </div>
              <div>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter time in IST (local timezone)
                </p>
              </div>
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Venue Name
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) =>
                setFormData({ ...formData, venue: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="e.g., Chennai Trade Centre"
            />
          </div>

          {/* Google Maps Embed URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Google Maps Embed URL
            </label>
            <input
              type="url"
              value={formData.googleMapsUrl}
              onChange={(e) =>
                setFormData({ ...formData, googleMapsUrl: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="https://maps.google.com/..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Paste the Google Maps embed or share URL
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description / Highlights
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="Describe your event, highlights, agenda..."
            />
          </div>

          {/* Seats & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total Seats <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price per Ticket (₹)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cover Image
              {isEdit && existingImageUrl && (
                <span className="text-xs text-gray-400 ml-2">(Current image shown below)</span>
              )}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-400 transition">
              {!coverImagePreview ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="text-sm text-gray-600 mb-2">
                    Upload Image • JPEG, PNG, GIF, WebP up to 5MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                  />
                  {isEdit && existingImageUrl && (
                    <p className="text-xs text-green-600 mt-2">
                      ✅ Current image will be kept unless you upload a new one
                    </p>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition shadow-lg"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {coverImage?.name ? `${coverImage.name} (${(coverImage.size / 1024).toFixed(1)} KB)` : 'Image preview'}
                  </p>
                  {isEdit && existingImageUrl && (
                    <p className="text-xs text-orange-500 mt-1 text-center">
                      ⚠️ New image will replace existing image
                    </p>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              JPEG, PNG, GIF, WebP up to 5MB
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEdit ? '✏️ Update Event' : '📅 Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}