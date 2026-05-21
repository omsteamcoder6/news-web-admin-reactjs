import { useState, useEffect } from "react";
import { X, Upload, Image as ImageIcon, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import awardAPI from "../../lib/awrdapi";
import { useAuthStore } from "../../stores/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export default function AddAwardModal({ 
  isOpen, 
  onClose, 
  onAwardAdded, 
  onAwardUpdated, 
  editingAward
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fee: "",
    status: "active",
    displayOrder: "",
    coverImage: null,
    seo: {
      title: "",
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      ogTitle: "",
      ogDescription: "",
      keywords: ""
    }
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSEO, setShowSEO] = useState(false);

  useEffect(() => {
    if (editingAward) {
      setFormData({
        name: editingAward.name || "",
        description: editingAward.description || "",
        fee: editingAward.fee || "",
        status: editingAward.status || "active",
        displayOrder: editingAward.displayOrder || "",
        coverImage: editingAward.coverImage || null,
        seo: {
          title: editingAward.seo?.title || "",
          metaTitle: editingAward.seo?.metaTitle || "",
          metaDescription: editingAward.seo?.metaDescription || "",
          canonicalUrl: editingAward.seo?.canonicalUrl || "",
          ogTitle: editingAward.seo?.ogTitle || "",
          ogDescription: editingAward.seo?.ogDescription || "",
          keywords: editingAward.seo?.keywords?.join(", ") || ""
        }
      });
      setCoverImagePreview(editingAward.coverImage || null);
    } else {
      setFormData({
        name: "",
        description: "",
        fee: "",
        status: "active",
        displayOrder: "",
        coverImage: null,
        seo: {
          title: "",
          metaTitle: "",
          metaDescription: "",
          canonicalUrl: "",
          ogTitle: "",
          ogDescription: "",
          keywords: ""
        }
      });
      setCoverImagePreview(null);
    }
    setErrors({});
    setShowSEO(false);
  }, [editingAward, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested seo fields
    if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        seo: { ...prev.seo, [seoField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const uploadCoverImage = async (file) => {
    setUploadingImage(true);
    try {
      const token = useAuthStore.getState().token;
      
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/awards/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      const data = await response.json();

      if (data.success && data.filePath) {
        const imagePath = data.filePath;
        setCoverImagePreview(imagePath);
        setFormData(prev => ({
          ...prev,
          coverImage: imagePath
        }));
        return imagePath;
      } else {
        console.error('Upload failed:', data.message);
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await uploadCoverImage(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImagePreview(null);
    setFormData(prev => ({
      ...prev,
      coverImage: null
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Award name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.fee || formData.fee <= 0) newErrors.fee = "Valid fee amount is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    
    try {
      // Process keywords from comma-separated string to array
      const keywordsArray = formData.seo.keywords
        ? formData.seo.keywords.split(',').map(k => k.trim()).filter(k => k)
        : [];
      
      const awardData = {
        name: formData.name,
        description: formData.description,
        fee: parseFloat(formData.fee),
        status: formData.status,
        displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : 0,
        coverImage: formData.coverImage,
        seo: {
          title: formData.seo.title || null,
          metaTitle: formData.seo.metaTitle || null,
          metaDescription: formData.seo.metaDescription || null,
          canonicalUrl: formData.seo.canonicalUrl || null,
          ogTitle: formData.seo.ogTitle || null,
          ogDescription: formData.seo.ogDescription || null,
          keywords: keywordsArray
        }
      };

      if (editingAward) {
        await awardAPI.updateAward(editingAward._id, awardData);
        onAwardUpdated();
      } else {
        await awardAPI.createAward(awardData);
        onAwardAdded();
      }
    } catch (error) {
      console.error("Error saving award:", error);
      alert(error.message || "Failed to save award");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isEditing = !!editingAward;
  const modalTitle = isEditing ? "Edit Award Category" : "Add New Award Category";
  const submitButtonText = isEditing ? (submitting ? "Updating..." : "Update Award") : (submitting ? "Creating..." : "Create Award");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">{modalTitle}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {isEditing && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600"><span className="font-medium">Award ID:</span> #{editingAward._id}</p>
            </div>
          )}

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {coverImagePreview ? (
                <div className="relative inline-block">
                  <img 
                    src={`${SERVER_BASE_URL}${coverImagePreview}`}
                    alt="Cover preview" 
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeCoverImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Upload a cover image for this award</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    id="coverImageUpload" 
                    disabled={uploadingImage} 
                  />
                  <label 
                    htmlFor="coverImageUpload" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition"
                  >
                    {uploadingImage ? <><Upload className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Select Image</>}
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Award Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Award Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="e.g., Best Startup Award" 
              className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} 
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Describe what this award recognizes..." 
              rows="3" 
              className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`} 
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Fee and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomination Fee (₹) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                name="fee" 
                value={formData.fee} 
                onChange={handleChange} 
                placeholder="499.00" 
                step="0.01" 
                className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.fee ? 'border-red-500' : 'border-gray-300'}`} 
              />
              {errors.fee && <p className="text-red-500 text-xs mt-1">{errors.fee}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="active">Active - Show on Frontend</option>
                <option value="inactive">Inactive - Hide from Frontend</option>
              </select>
            </div>
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order (Optional)</label>
            <input 
              type="number" 
              name="displayOrder" 
              value={formData.displayOrder} 
              onChange={handleChange} 
              placeholder="1, 2, 3..." 
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" 
            />
            <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
          </div>

          {/* SEO Settings Section */}
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSEO(!showSEO)}
              className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 transition"
            >
              <span className="font-medium text-gray-700">🔍 SEO Settings (Optional)</span>
              {showSEO ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            
            {showSEO && (
              <div className="p-4 space-y-3 border-t">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">SEO Title</label>
                  <input 
                    type="text" 
                    name="seo.title" 
                    value={formData.seo.title} 
                    onChange={handleChange} 
                    placeholder="SEO optimized title" 
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" 
                  />
                  <p className="text-xs text-gray-400 mt-1">If empty, award name will be used</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Meta Title</label>
                  <input 
                    type="text" 
                    name="seo.metaTitle" 
                    value={formData.seo.metaTitle} 
                    onChange={handleChange} 
                    placeholder="Meta title for search engines" 
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Meta Description</label>
                  <textarea 
                    name="seo.metaDescription" 
                    value={formData.seo.metaDescription} 
                    onChange={handleChange} 
                    placeholder="Brief description for search results (150-160 characters)" 
                    rows="2" 
                    maxLength="160"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" 
                  />
                  <p className="text-xs text-gray-400 mt-1">{formData.seo.metaDescription.length}/160 characters</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Canonical URL</label>
                  <input 
                    type="url" 
                    name="seo.canonicalUrl" 
                    value={formData.seo.canonicalUrl} 
                    onChange={handleChange} 
                    placeholder="https://example.com/award/name" 
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">OG Title (Social Media)</label>
                  <input 
                    type="text" 
                    name="seo.ogTitle" 
                    value={formData.seo.ogTitle} 
                    onChange={handleChange} 
                    placeholder="Title for social media sharing" 
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">OG Description (Social Media)</label>
                  <textarea 
                    name="seo.ogDescription" 
                    value={formData.seo.ogDescription} 
                    onChange={handleChange} 
                    placeholder="Description for social media sharing" 
                    rows="2" 
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Keywords</label>
                  <input 
                    type="text" 
                    name="seo.keywords" 
                    value={formData.seo.keywords} 
                    onChange={handleChange} 
                    placeholder="award, recognition, nomination (comma separated)" 
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" 
                  />
                  <p className="text-xs text-gray-400 mt-1">Separate keywords with commas</p>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed">{submitButtonText}</button>
          </div>
        </form>
      </div>
    </div>
  );
}