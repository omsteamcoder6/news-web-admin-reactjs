import { useState } from "react";

export default function EventForm({ event, categories, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    categorySlug: event?.categorySlug || (categories[0]?.slug || ""),
    date: event?.date || "",
    venue: event?.venue || "",
    mapUrl: event?.mapUrl || "",
    desc: event?.desc || "",
    capacity: event?.capacity || 100,
    price: event?.price || 0,
    imageUrl: event?.imageUrl || ""
  });
  
  const [imagePreview, setImagePreview] = useState(event?.imageUrl || "");
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPEG, PNG, GIF, etc.)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData({ ...formData, imageUrl: base64String });
      setImagePreview(base64String);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert("Failed to read image file");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrlChange = (url) => {
    setFormData({ ...formData, imageUrl: url });
    setImagePreview(url);
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, imageUrl: "" });
    setImagePreview("");
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
    onSave(formData);
  };

  const activeCategories = categories.filter(cat => cat.status === "active");

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
            <select
              value={formData.categorySlug}
              onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              required
            >
              <option value="">Select a category</option>
              {activeCategories.map(category => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            {activeCategories.length === 0 && (
              <p className="text-sm text-orange-600 mt-1">
                ⚠️ No categories found. Please add categories in the Categories tab first.
              </p>
            )}
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
            {/* Max Capacity - Total Seats */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total Seats (Max Capacity) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                min="1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Total number of tickets available for this event</p>
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
              <p className="text-xs text-gray-500 mt-1">Set 0 for Free Entry</p>
            </div>
          </div>

          {/* Cover Image Upload Section */}
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

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Upload from computer
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
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-gray-50 text-gray-500">OR</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Image URL (from web)
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="https://example.com/event-image.jpg"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Paste a direct image URL from Imgur, Cloudinary, or any image hosting service
                </p>
              </div>
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