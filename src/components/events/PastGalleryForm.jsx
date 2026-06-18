// PastGalleryForm.jsx
import { useState, useRef } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

// Simple slug generator
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function PastGalleryForm({ gallery, events, onSave, onClose, token }) {
  const [formData, setFormData] = useState({
    eventId: gallery?.eventId?._id || gallery?.eventId || "",
    title: gallery?.title || "",
    slug: gallery?.slug || "",
    caption: gallery?.caption || "",
    coverImage: gallery?.coverImage || "",
    images: gallery?.images || [],
    status: "past",
    seo: {
      metaTitle: gallery?.seo?.metaTitle || "",
      metaDescription: gallery?.seo?.metaDescription || "",
      metaKeywords: gallery?.seo?.metaKeywords || "",
      ogImage: gallery?.seo?.ogImage || ""
    }
  });
  
  const [coverPreview, setCoverPreview] = useState(gallery?.coverImage || "");
  const [imagePreviews, setImagePreviews] = useState(gallery?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const [showSEO, setShowSEO] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // File refs for storing actual files
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  // Helper to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    if (imagePath.startsWith("/uploads/")) {
      return `${IMAGE_BASE_URL}${imagePath}`;
    }
    return imagePath;
  };

  // Upload image to server using FormData
  const uploadImageToServer = async (file) => {
    if (!token) {
      throw new Error("Please log in to upload images");
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('uploadType', 'pastgallery');

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      console.log('Upload response:', data); // Debug log
      
      if (data.success) {
        // Try all possible response structures
        const imagePath = data.data?.path || data.data?.url || data.imageUrl || data.url || data.path;
        
        if (!imagePath) {
          console.error('No image path found in response:', data);
          throw new Error('Image path not found in server response');
        }
        
        return imagePath;
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  // Upload multiple images
  const uploadMultipleImages = async (files) => {
    const uploadedPaths = [];
    for (let i = 0; i < files.length; i++) {
      try {
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        const path = await uploadImageToServer(files[i]);
        uploadedPaths.push(path);
      } catch (error) {
        console.error(`Failed to upload image ${i + 1}:`, error);
        alert(`Failed to upload image ${i + 1}. Please try again.`);
      }
    }
    setUploadProgress(0);
    return uploadedPaths;
  };

  // Handle single image upload (cover or gallery)
  const handleImageUpload = async (file, type) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadedPath = await uploadImageToServer(file);
      
      if (type === "cover") {
        setFormData({ ...formData, coverImage: uploadedPath });
        setCoverPreview(uploadedPath);
        setCoverFile(file);
      } else if (type === "gallery") {
        const newImages = [...formData.images, uploadedPath];
        setFormData({ ...formData, images: newImages });
        setImagePreviews(newImages);
        setGalleryFiles([...galleryFiles, file]);
      }
    } catch (error) {
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle multiple image upload
  const handleMultipleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} size should be less than 5MB`);
        return;
      }
    }

    setIsUploading(true);
    try {
      const uploadedPaths = await uploadMultipleImages(files);
      const newImages = [...formData.images, ...uploadedPaths];
      setFormData({ ...formData, images: newImages });
      setImagePreviews(newImages);
      setGalleryFiles([...galleryFiles, ...files]);
    } catch (error) {
      alert("Failed to upload some images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image removal
  const handleRemoveImage = (index, type) => {
    if (type === "cover") {
      setFormData({ ...formData, coverImage: "" });
      setCoverPreview("");
      setCoverFile(null);
    } else if (type === "gallery") {
      const newImages = formData.images.filter((_, i) => i !== index);
      const newFiles = galleryFiles.filter((_, i) => i !== index);
      setFormData({ ...formData, images: newImages });
      setImagePreviews(newImages);
      setGalleryFiles(newFiles);
    }
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert("Please enter gallery title");
      return;
    }
    if (!formData.coverImage) {
      alert("Please add a cover image");
      return;
    }
    
    let slug = formData.slug;
    if (!slug) {
      slug = generateSlug(formData.title);
    }
    
    onSave({ ...formData, slug, status: "past" });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {gallery ? "Edit Past Gallery" : "Add Past Gallery"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Gallery Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Gallery Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                const title = e.target.value;
                setFormData({ 
                  ...formData, 
                  title,
                  slug: gallery ? formData.slug : generateSlug(title)
                });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="e.g., Award Ceremony Highlights 2025"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Slug <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2">(URL-friendly identifier)</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none font-mono text-sm"
              placeholder="award-ceremony-highlights-2025"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: {generateSlug(formData.title || "past-gallery-title")}
            </p>
          </div>

          {/* Event Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Related Past Event
              <span className="text-xs text-gray-500 ml-2">(Optional)</span>
            </label>
            <select
              value={formData.eventId}
              onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            >
              <option value="">-- No specific event --</option>
              {events
                .filter(ev => ev.status === "past")
                .map(event => (
                  <option key={event._id || event.id} value={event._id || event.id}>
                    {event.title} - {new Date(event.date).toLocaleDateString()}
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Only past events are shown. You can also leave this unselected.
            </p>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Gallery Caption
            </label>
            <textarea
              rows="2"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="Brief description of this past event photo gallery..."
            />
          </div>

          {/* Cover Image */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Cover Image <span className="text-red-500">*</span>
            </label>
            
            {coverPreview && (
              <div className="mb-4 relative inline-block">
                <img 
                  src={getFullImageUrl(coverPreview)} 
                  alt="Cover preview" 
                  className="w-40 h-40 object-cover rounded-lg border border-gray-300"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/160x160?text=Image+Not+Found";
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(0, "cover")}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Upload cover image
              </label>
              <div className="flex items-center gap-3">
                <label className={`cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}>
                  {isUploading ? "Uploading..." : "Choose Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0], "cover")}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
                <span className="text-xs text-gray-500">JPEG, PNG, WEBP up to 5MB</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Image will be saved to /uploads/pastgallery/
              </p>
            </div>
          </div>

          {/* Gallery Images */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Gallery Images
              <span className="text-xs text-gray-500 ml-2">(Multiple images supported)</span>
            </label>
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Uploading images: {uploadProgress}%</p>
              </div>
            )}

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mb-4">
                {imagePreviews.map((img, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={getFullImageUrl(img)} 
                      alt={`Gallery ${index + 1}`} 
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/96x96?text=Image+Not+Found";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index, "gallery")}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Upload multiple images
              </label>
              <div className="flex items-center gap-3">
                <label className={`cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}>
                  {isUploading ? "Uploading..." : "Add Images"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleMultipleImageUpload(e.target.files)}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
                <span className="text-xs text-gray-500">You can select multiple images at once</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {formData.images.length} image(s) added
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Images will be saved to /uploads/pastgallery/
              </p>
            </div>
          </div>

          {/* Status Badge - Read Only */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Status:</span>
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-200 text-gray-700">
                🏛️ Past Gallery
              </span>
              <span className="text-xs text-gray-500">(All galleries here are marked as past)</span>
            </div>
          </div>

          {/* SEO Section */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSEO(!showSEO)}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition flex justify-between items-center"
            >
              <span className="font-semibold text-gray-700">
                <i className="fas fa-search mr-2"></i>
                SEO Settings (Optional)
              </span>
              <i className={`fas fa-chevron-${showSEO ? "up" : "down"} text-gray-500`}></i>
            </button>
            
            {showSEO && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.seo.metaTitle}
                    onChange={(e) => setFormData({
                      ...formData,
                      seo: { ...formData.seo, metaTitle: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    placeholder="SEO optimized title (50-60 characters)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.seo.metaTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    rows="2"
                    value={formData.seo.metaDescription}
                    onChange={(e) => setFormData({
                      ...formData,
                      seo: { ...formData.seo, metaDescription: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    placeholder="Brief description for search engines (150-160 characters)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.seo.metaDescription.length}/160 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.seo.metaKeywords}
                    onChange={(e) => setFormData({
                      ...formData,
                      seo: { ...formData.seo, metaKeywords: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    placeholder="past event, gallery, photos, awards (comma separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Open Graph Image URL (for social sharing)
                  </label>
                  <input
                    type="text"
                    value={formData.seo.ogImage}
                    onChange={(e) => setFormData({
                      ...formData,
                      seo: { ...formData.seo, ogImage: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    placeholder="https://example.com/social-share-image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If not set, cover image will be used for social sharing
                  </p>
                </div>
              </div>
            )}
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
              disabled={isUploading}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Uploading..." : (gallery ? "Update Past Gallery" : "Create Past Gallery")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}