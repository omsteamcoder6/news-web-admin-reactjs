import { useState } from "react";
import { generateSlug } from "../../utils/storage";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function GalleryForm({ gallery, onSave, onClose }) {
  const [formData, setFormData] = useState({
    eventId: gallery?.eventId?._id || gallery?.eventId || "",
    title: gallery?.title || "",
    slug: gallery?.slug || "",
    caption: gallery?.caption || "",
    coverImage: gallery?.coverImage || "",
    images: gallery?.images || [],
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

  // Helper function to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return `${IMAGE_BASE_URL}${imagePath}`;
  };

  // Upload image to server
  const uploadImage = async (file) => {
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: uploadFormData,
      });

      const data = await response.json();
      if (data.success) {
        return data.imageUrl; // Returns the stored image path
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  // Upload multiple images
  const uploadMultipleImages = async (files) => {
    const uploadedUrls = [];
    for (let i = 0; i < files.length; i++) {
      try {
        setUploadProgress(Math.round((i / files.length) * 100));
        const url = await uploadImage(files[i]);
        uploadedUrls.push(url);
      } catch (error) {
        console.error(`Failed to upload image ${i + 1}:`, error);
        alert(`Failed to upload image ${i + 1}. Please try again.`);
      }
    }
    setUploadProgress(0);
    return uploadedUrls;
  };

  const handleImageUpload = async (file, type) => {
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
    
    try {
      const uploadedUrl = await uploadImage(file);
      
      if (type === "cover") {
        setFormData({ ...formData, coverImage: uploadedUrl });
        setCoverPreview(uploadedUrl);
      } else if (type === "gallery") {
        const newImages = [...formData.images, uploadedUrl];
        setFormData({ ...formData, images: newImages });
        setImagePreviews(newImages);
      }
    } catch (error) {
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleMultipleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    // Validate all files
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file`);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name} size should be less than 2MB`);
        return;
      }
    }

    setIsUploading(true);
    try {
      const uploadedUrls = await uploadMultipleImages(files);
      const newImages = [...formData.images, ...uploadedUrls];
      setFormData({ ...formData, images: newImages });
      setImagePreviews(newImages);
    } catch (error) {
      alert("Failed to upload some images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index, type) => {
    if (type === "cover") {
      setFormData({ ...formData, coverImage: "" });
      setCoverPreview("");
    } else if (type === "gallery") {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData({ ...formData, images: newImages });
      setImagePreviews(newImages);
    }
  };

  const handleImageUrlChange = (url, type) => {
    if (type === "cover") {
      setFormData({ ...formData, coverImage: url });
      setCoverPreview(url);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // REMOVED: Event validation - now optional
    // if (!formData.eventId) {
    //   alert("Event information is missing");
    //   return;
    // }
    
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
    
    onSave({ ...formData, slug });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {gallery ? "Edit Gallery" : "Create New Gallery"}
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
              placeholder="e.g., Award Ceremony Highlights"
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
              placeholder="award-ceremony-highlights"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: {generateSlug(formData.title || "gallery-title")}
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
              placeholder="Brief description of this photo gallery..."
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

            <div className="space-y-3">
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
                  <span className="text-xs text-gray-500">JPEG, PNG up to 2MB</span>
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
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => handleImageUrlChange(e.target.value, "cover")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="https://example.com/cover-image.jpg"
                />
              </div>
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
            </div>
          </div>

          {/* SEO Section - Expandable */}
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
                    placeholder="event, gallery, photos, awards (comma separated)"
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
              {isUploading ? "Uploading..." : (gallery ? "Update Gallery" : "Create Gallery")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}