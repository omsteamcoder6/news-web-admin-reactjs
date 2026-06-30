// components/reels/ReelsForm.jsx
import { useState, useEffect, useRef } from "react";
import { getThumbnailUrl } from "./ReelsListView";

// Helper function to get reel ID consistently
function getReelId(reel) {
  return reel?.id || reel?._id;
}

export default function ReelsForm({ 
  reel, 
  onSave, 
  onCancel,
  isEditing 
}) {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const fileInputRef = useRef(null);

  // Load reel data when editing
  useEffect(() => {
    if (reel) {
      setTitle(reel.title || "");
      setVideoUrl(reel.videoUrl || "");
      setDescription(reel.description || "");
      setThumbnailPreview(getThumbnailUrl(reel.thumbnail));
    }
  }, [reel]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!videoUrl.trim()) {
      newErrors.videoUrl = "Video URL is required";
    }
    
    if (!thumbnailFile && !reel?.thumbnail) {
      newErrors.thumbnail = "Thumbnail image is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, thumbnail: "Please select an image file" });
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, thumbnail: "Image must be less than 5MB" });
        return;
      }
      
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setErrors({ ...errors, thumbnail: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('videoUrl', videoUrl.trim());
      formData.append('description', description.trim());
      
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      
      if (isEditing && reel) {
        // Use the helper function to get the reel ID
        const reelId = getReelId(reel);
        if (!reelId) {
          throw new Error('Reel ID is missing');
        }
        await onSave(formData, reelId);
      } else {
        await onSave(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Show error to user
      alert(error.message || 'Failed to save reel');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Clean up preview URL
    if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title Field */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
            errors.title ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="Enter reel title"
          maxLength={200}
          disabled={loading}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          {title.length}/200 characters
        </p>
      </div>

      {/* Video URL Field */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Video URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
            errors.videoUrl ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="https://example.com/video.mp4"
          disabled={loading}
        />
        {errors.videoUrl && (
          <p className="mt-1 text-sm text-red-500">{errors.videoUrl}</p>
        )}
      </div>

      {/* Thumbnail Upload Field */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Thumbnail Image <span className="text-red-500">*</span>
        </label>
        
        {/* Thumbnail Preview */}
        {thumbnailPreview && (
          <div className="mb-3 relative">
            <img
              src={thumbnailPreview}
              alt="Thumbnail preview"
              className="w-full max-h-48 object-cover rounded-lg border border-slate-200"
            />
            <button
              type="button"
              onClick={() => {
                setThumbnailFile(null);
                setThumbnailPreview(getThumbnailUrl(reel?.thumbnail));
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* File Input */}
        <div className={`border-2 border-dashed rounded-lg p-4 text-center transition ${
          errors.thumbnail ? 'border-red-500 bg-red-50' : 'border-slate-300 hover:border-blue-400'
        }`}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="thumbnail-upload"
            disabled={loading}
          />
          <label
            htmlFor="thumbnail-upload"
            className="cursor-pointer block"
          >
            <svg className="w-10 h-10 mx-auto text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-slate-600">
              {thumbnailFile ? thumbnailFile.name : 'Click to upload thumbnail'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              JPG, PNG, GIF (max 5MB)
            </p>
          </label>
        </div>
        {errors.thumbnail && (
          <p className="mt-1 text-sm text-red-500">{errors.thumbnail}</p>
        )}
        {thumbnailFile && (
          <p className="mt-1 text-xs text-green-600">
            ✅ {thumbnailFile.name} ({(thumbnailFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          placeholder="Enter reel description (optional)"
          maxLength={1000}
          disabled={loading}
        />
        <p className="mt-1 text-xs text-slate-500">
          {description.length}/1000 characters
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            isEditing ? 'Update Reel' : 'Create Reel'
          )}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}