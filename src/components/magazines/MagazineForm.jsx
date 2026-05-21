// MagazineForm.jsx
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { X, Loader2, Crown, Unlock, Upload, FileText } from "lucide-react";
import { toast } from "react-hot-toast";

// Get backend URL from environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function resolvePreviewUrl(url) {
  if (!url) return "";
  if (url.startsWith("blob:")) return url;
  
  // If it's already a full URL with our backend, use it directly
  if (url.startsWith(BACKEND_URL)) {
    return url;
  }
  
  // Clean the URL - remove any backend URL if present
  let cleanUrl = url;
  if (cleanUrl.includes('localhost:3001')) {
    cleanUrl = cleanUrl.replace(/^https?:\/\/localhost:3001/, '');
  }
  
  // Ensure it starts with /
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl;
  }
  
  // FIXED: Handle both path formats
  let fullUrl;
  if (cleanUrl.startsWith('/uploads/')) {
    fullUrl = `${BACKEND_URL}${cleanUrl}`;
  } else if (cleanUrl.startsWith('/magazines/')) {
    // Old format - add /uploads prefix
    fullUrl = `${BACKEND_URL}/uploads${cleanUrl}`;
  } else {
    fullUrl = `${BACKEND_URL}${cleanUrl}`;
  }
  
  return fullUrl;
}

const getTodayDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const getCurrentDateTime = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

function buildFormState(data) {
  if (data) {
    return {
      title: data.title || "",
      slug: data.slug || "",
      description: data.description || "",
      issueDate: data.issueDate
        ? new Date(data.issueDate).toISOString().split("T")[0]
        : getTodayDate(),
      issueDateTime: data.issueDateTime
        ? new Date(data.issueDateTime).toISOString().slice(0, 16)
        : getCurrentDateTime(),
      pages: data.pages?.toString() || "",
      accessType: data.accessType || "free",
      coverImageFile: null,
      coverImagePreview: resolvePreviewUrl(data.coverImageUrl),
      pdfFile: null,
      pdfFileName: data.pdfFileName || "",
      // SEO fields
      metaTitle: data.metaTitle || "",
      metaDescription: data.metaDescription || "",
      metaKeywords: Array.isArray(data.metaKeywords) ? data.metaKeywords.join(", ") : (data.metaKeywords || ""),
      canonicalUrl: data.canonicalUrl || "",
      ogTitle: data.ogTitle || "",
      ogDescription: data.ogDescription || "",
      ogImage: data.ogImage || "",
      twitterTitle: data.twitterTitle || "",
      twitterDescription: data.twitterDescription || "",
      twitterImage: data.twitterImage || "",
      robots: data.robots || "index, follow",
      schemaType: data.schemaType || "Article",
    };
  }
  return {
    title: "",
    slug: "",
    description: "",
    issueDate: getTodayDate(),
    issueDateTime: getCurrentDateTime(),
    pages: "",
    accessType: "free",
    coverImageFile: null,
    coverImagePreview: "",
    pdfFile: null,
    pdfFileName: "",
    // SEO fields
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    robots: "index, follow",
    schemaType: "Article",
  };
}

export function MagazineForm({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState(() => buildFormState(initialData));
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setFormData(buildFormState(initialData));
      setPdfError("");
      setUploadProgress(0);
      setIsProcessingPdf(false);
    }
  }, [isOpen, initialData]);

  const generateSlug = (title) =>
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();

  const countPdfPages = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const PDFLib = await import("pdf-lib");
          const pdfDoc = await PDFLib.PDFDocument.load(e.target.result);
          resolve(pdfDoc.getPageCount());
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "title" && (!prev.slug || prev.slug === generateSlug(prev.title))) {
        next.slug = generateSlug(value);
      }
      return next;
    });
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (formData.coverImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(formData.coverImagePreview);
    }
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, coverImageFile: file, coverImagePreview: previewUrl, ogImage: previewUrl, twitterImage: previewUrl }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setPdfError("Please upload a valid PDF file");
      toast.error("Please upload a valid PDF file");
      return;
    }

    setIsProcessingPdf(true);
    setPdfError("");
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 100);

    try {
      const pageCount = await countPdfPages(file);
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 500);
      setFormData((prev) => ({ ...prev, pdfFile: file, pdfFileName: file.name, pages: pageCount.toString() }));
      toast.success(`PDF loaded: ${pageCount} pages detected`);
    } catch (err) {
      clearInterval(interval);
      setPdfError("Could not auto-detect pages. Please enter manually.");
      setFormData((prev) => ({ ...prev, pdfFile: file, pdfFileName: file.name, pages: "" }));
      toast.error("Failed to detect page count. Please enter manually.");
    } finally {
      setIsProcessingPdf(false);
      setUploadProgress(0);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) { toast.error("Please enter magazine title"); return false; }
    if (!formData.slug.trim()) { toast.error("Please enter a slug"); return false; }
    if (!formData.description.trim()) { toast.error("Please enter description"); return false; }
    if (!formData.issueDate) { toast.error("Please select issue date"); return false; }
    if (!formData.pages) { toast.error("Please enter number of pages"); return false; }
    if (!initialData && !formData.coverImageFile) { toast.error("Please upload a cover image"); return false; }
    if (!initialData && !formData.pdfFile) { toast.error("Please upload the magazine PDF"); return false; }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Parse metaKeywords from comma-separated string to array
    let keywordsArray = [];
    if (formData.metaKeywords) {
      keywordsArray = formData.metaKeywords.split(",").map(k => k.trim()).filter(k => k);
    }

    const submitData = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      issueDate: formData.issueDate,
      issueDateTime: formData.issueDateTime || getCurrentDateTime(),
      pages: parseInt(formData.pages),
      accessType: formData.accessType,
      coverImageFile: formData.coverImageFile,
      pdfFile: formData.pdfFile,
      // SEO fields
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      metaKeywords: keywordsArray,
      canonicalUrl: formData.canonicalUrl,
      ogTitle: formData.ogTitle,
      ogDescription: formData.ogDescription,
      ogImage: formData.ogImage,
      twitterTitle: formData.twitterTitle,
      twitterDescription: formData.twitterDescription,
      twitterImage: formData.twitterImage,
      robots: formData.robots,
      schemaType: formData.schemaType,
    };

    onSubmit(submitData);
    onClose();
  };

  useEffect(() => {
    return () => {
      if (formData.coverImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(formData.coverImagePreview);
      }
    };
  }, [formData.coverImagePreview]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl mx-4 my-8">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              {initialData ? "Edit Magazine" : "Upload New Magazine"}
            </h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cover Image {initialData ? "(leave empty to keep current)" : "*"}
              </label>
              <div className="flex items-start gap-4">
                {formData.coverImagePreview ? (
                  <div className="w-24 h-32 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 relative">
                    <img
                      src={formData.coverImagePreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Preview failed to load');
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-24 h-32 rounded-lg border-2 border-dashed border-slate-300 flex-shrink-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-xs">No image</span>
                  </div>
                )}

                <div className="flex-1">
                  <input
                    type="file"
                    name="coverImage"
                    onChange={handleCoverImageChange}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Recommended: JPG or PNG, minimum 300×400 px
                  </p>
                </div>
              </div>
            </div>

            {/* Magazine Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Magazine Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter magazine title"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Slug *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                  placeholder="url-friendly-slug"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData((prev) => ({ ...prev, slug: generateSlug(prev.title) }))}
                  className="px-3"
                >
                  Generate
                </Button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="Enter magazine description, highlights, or summary..."
              />
            </div>

            {/* Access Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Access Type *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, accessType: "free" }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.accessType === "free"
                      ? "border-green-500 bg-green-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Unlock className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-slate-900">Free</span>
                  </div>
                  <p className="text-xs text-slate-600">Anyone can download</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, accessType: "premium" }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.accessType === "premium"
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Crown className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-slate-900">Premium</span>
                  </div>
                  <p className="text-xs text-slate-600">Only premium subscribers</p>
                </button>
              </div>
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date *</label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* PDF File */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Magazine File (PDF) {initialData ? "(leave empty to keep current)" : "*"}
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="pdfFile"
                  onChange={handleFileChange}
                  accept=".pdf"
                  disabled={isProcessingPdf}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 disabled:opacity-50"
                />
                {isProcessingPdf && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                  </div>
                )}
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Processing PDF… {uploadProgress}%</p>
                </div>
              )}

              {formData.pdfFileName && !isProcessingPdf && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <FileText className="w-4 h-4" />
                  <span>{formData.pdfFileName}</span>
                </div>
              )}

              {pdfError && <p className="text-xs text-red-500 mt-1">{pdfError}</p>}
            </div>

            {/* Pages */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Number of Pages
              </label>
              <input
                type="number"
                name="pages"
                value={formData.pages}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Auto-detected from PDF"
              />
            </div>

            {/* ============================================ */}
            {/* SEO SECTION - ADDED */}
            {/* ============================================ */}
            <div className="border-t border-slate-200 pt-4 mt-2">
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-orange-500">🔍</span> SEO Settings
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Optimize this magazine for search engines and social media
              </p>

              {/* Meta Title */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Meta Title <span className="text-xs text-slate-400">(recommended: 50-60 chars)</span>
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  maxLength="70"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="SEO optimized title for search engines"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {formData.metaTitle?.length || 0}/70 characters
                </p>
              </div>

              {/* Meta Description */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Meta Description <span className="text-xs text-slate-400">(recommended: 150-160 chars)</span>
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  maxLength="160"
                  rows="2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Brief description that appears in search results"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {formData.metaDescription?.length || 0}/160 characters
                </p>
              </div>

              {/* Meta Keywords */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Meta Keywords <span className="text-xs text-slate-400">(comma separated)</span>
                </label>
                <input
                  type="text"
                  name="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="magazine, digital, publishing, design"
                />
              </div>

              {/* Canonical URL */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Canonical URL
                </label>
                <input
                  type="text"
                  name="canonicalUrl"
                  value={formData.canonicalUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="https://yourdomain.com/magazine/slug"
                />
              </div>

              {/* Robots */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Robots Indexing
                </label>
                <select
                  name="robots"
                  value={formData.robots}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="index, follow">Index, Follow (Default)</option>
                  <option value="noindex, follow">No Index, Follow</option>
                  <option value="index, nofollow">Index, No Follow</option>
                  <option value="noindex, nofollow">No Index, No Follow</option>
                </select>
              </div>

              {/* Schema Type */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Schema Type (Structured Data)
                </label>
                <select
                  name="schemaType"
                  value={formData.schemaType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Article">Article (Default)</option>
                  <option value="Magazine">Magazine</option>
                  <option value="Periodical">Periodical</option>
                </select>
              </div>

              {/* Open Graph (Social Media) */}
              <div className="bg-slate-50 p-3 rounded-lg mt-3">
                <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1">
                  <span>📱</span> Social Media Preview (Open Graph)
                </h4>
                
                <div className="mb-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">OG Title</label>
                  <input
                    type="text"
                    name="ogTitle"
                    value={formData.ogTitle}
                    onChange={handleChange}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                    placeholder="Title for Facebook/LinkedIn shares"
                  />
                </div>
                
                <div className="mb-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">OG Description</label>
                  <textarea
                    name="ogDescription"
                    value={formData.ogDescription}
                    onChange={handleChange}
                    rows="1"
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded resize-none"
                    placeholder="Description for social media shares"
                  />
                </div>
              </div>

              {/* Twitter Card */}
              <div className="bg-slate-50 p-3 rounded-lg mt-2">
                <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1">
                  <span>🐦</span> Twitter Card
                </h4>
                
                <div className="mb-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Twitter Title</label>
                  <input
                    type="text"
                    name="twitterTitle"
                    value={formData.twitterTitle}
                    onChange={handleChange}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                    placeholder="Title for Twitter shares"
                  />
                </div>
                
                <div className="mb-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Twitter Description</label>
                  <textarea
                    name="twitterDescription"
                    value={formData.twitterDescription}
                    onChange={handleChange}
                    rows="1"
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded resize-none"
                    placeholder="Description for Twitter shares"
                  />
                </div>
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                disabled={isProcessingPdf}
              >
                {initialData ? "Update Magazine" : "Upload Magazine"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}