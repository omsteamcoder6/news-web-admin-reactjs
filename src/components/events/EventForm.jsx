import { useState } from "react";

export default function EventForm({ event, categories, onSave, onClose }) {
  // ✅ FIXED: Use VITE_API_URL from environment
  const RAW_API_URL = import.meta.env.VITE_API_URL || '';
  const API_BASE_URL = RAW_API_URL.replace(/\/api\/?$/, '');

  // ✅ FIXED: Helper function to get full image URL
  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    if (imageUrl.startsWith('/uploads')) {
      return `${API_BASE_URL}${imageUrl}`;
    }
    return imageUrl;
  };

  // Format date for input - keep it in local time
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Debug: Log what's received
  console.log("🔍 EventForm - Categories received:", categories);
  console.log("🔍 EventForm - Categories length:", categories?.length);

  // Ensure categories is an array
  const categoriesArray = Array.isArray(categories) ? categories : [];
  
  // Filter active categories or use all if no status filter
  const activeCategories = categoriesArray.filter(cat => cat.status === "active");
  
  // If no active categories, use all categories
  const availableCategories = activeCategories.length > 0 ? activeCategories : categoriesArray;

  console.log("🔍 EventForm - Available categories:", availableCategories);

  const [formData, setFormData] = useState({
    title: event?.title || "",
    categorySlug: event?.categorySlug || (availableCategories[0]?.slug || ""),
    date: formatDateForInput(event?.date),
    venue: event?.venue || "",
    mapUrl: event?.mapUrl || "",
    desc: event?.desc || "",
    capacity: event?.capacity || 100,
    price: event?.price || 0,
    status: event?.status || "upcoming",
  });
  
  const [imagePreview, setImagePreview] = useState(getFullImageUrl(event?.imageUrl) || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const [imageAction, setImageAction] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }

    setIsUploading(true);
    setSelectedFile(file);
    setImageChanged(true);
    setImageAction('new');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert("Failed to read image file");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setSelectedFile(null);
    setImageChanged(true);
    setImageAction('removed');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert("Please enter event title");
      return;
    }
    if (!formData.categorySlug) {
      alert("Please select a category");
      return;
    }
    if (!formData.date) {
      alert("Please select event date & time");
      return;
    }
    if (!formData.capacity || formData.capacity < 1) {
      alert("Please enter max capacity (minimum 1)");
      return;
    }
    if (!formData.status) {
      alert("Please select event status");
      return;
    }

    // IMPORTANT: Convert local datetime to UTC for storage
    const localDate = new Date(formData.date);
    const utcDate = localDate.toISOString();

    console.log("Submitting event with data:", {
      title: formData.title,
      categorySlug: formData.categorySlug,
      localDate: formData.date,
      utcDate: utcDate,
      capacity: formData.capacity,
      status: formData.status,
      hasImage: !!selectedFile,
      imageAction: imageAction
    });

    // Create FormData for file upload
    const submitData = new FormData();
    
    submitData.append('title', formData.title.trim());
    submitData.append('categorySlug', formData.categorySlug);
    submitData.append('date', utcDate);
    submitData.append('venue', formData.venue || "");
    submitData.append('mapUrl', formData.mapUrl || "");
    submitData.append('desc', formData.desc || "");
    submitData.append('capacity', parseInt(formData.capacity) || 0);
    submitData.append('price', parseFloat(formData.price) || 0);
    submitData.append('status', formData.status);
    
    if (event) {
      if (imageAction === 'new' && selectedFile) {
        submitData.append('image', selectedFile);
      } else if (imageAction === 'removed') {
        submitData.append('imageUrl', '');
      }
    } else {
      if (selectedFile) {
        submitData.append('image', selectedFile);
      }
    }

    console.log("FormData entries:");
    for (let pair of submitData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
    }

    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {event ? "Edit Event" : "Create New Event"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Event Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="e.g., South India Business Awards 2025"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            
            <p className="text-xs text-gray-400 mb-2">
              Categories available: {availableCategories.length}
            </p>
            
            <select
              value={formData.categorySlug}
              onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              required
            >
              <option value="">-- Select a category --</option>
              {availableCategories.map((category) => (
                <option key={category._id || category.slug} value={category.slug}>
                  {category.name} {category.status === "active" ? "✓" : ""}
                </option>
              ))}
            </select>
            
            {availableCategories.length === 0 && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ No categories found. Please:
                </p>
                <ul className="text-xs text-yellow-700 mt-1 list-disc list-inside">
                  <li>Go to the "Categories" tab</li>
                  <li>Add a new category</li>
                  <li>Make sure it's marked as "active"</li>
                  <li>Then come back to create an event</li>
                </ul>
              </div>
            )}
          </div>

          {/* Event Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              required
            >
              <option value="upcoming">📅 Upcoming</option>
              <option value="past">📆 Past</option>
              <option value="ongoing">🔄 Ongoing</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select "Upcoming" for future events or "Past" for events that have already happened
            </p>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter date and time in your local timezone (IST)
            </p>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Venue Name
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="e.g., Chennai Trade Centre"
            />
          </div>

          {/* Google Maps URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Google Maps Embed URL
            </label>
            <input
              type="text"
              value={formData.mapUrl}
              onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="https://maps.google.com/..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description / Highlights
            </label>
            <textarea
              rows="3"
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="Describe your event, highlights, agenda..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Max Capacity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total Seats <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                min="1"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price per Ticket (₹)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                min="0"
              />
            </div>
          </div>

          {/* Cover Image Upload */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Cover Image
            </label>
            
            {imagePreview && (
              <div className="mb-4 relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Cover preview" 
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    console.error('❌ Failed to load preview image:', imagePreview);
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Upload Image
              </label>
              <div className="flex items-center gap-3">
                <label className={`cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}>
                  {isUploading ? "Uploading..." : "Choose Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
                <span className="text-xs text-gray-500">JPEG, PNG, GIF up to 2MB</span>
              </div>
              {selectedFile && (
                <p className="text-xs text-blue-600 mt-1">
                  ✓ Selected: {selectedFile.name}
                </p>
              )}
              {event && !imageChanged && imagePreview && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Current image will be preserved
                </p>
              )}
              {imageAction === 'removed' && (
                <p className="text-xs text-red-600 mt-1">
                  ✓ Image will be removed
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              {event ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}