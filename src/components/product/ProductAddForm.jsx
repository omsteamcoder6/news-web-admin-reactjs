import { useState, useRef } from "react"

export default function ProductAddForm({ categories, onSubmit }) {
  const [formData, setFormData] = useState({
    // Basic Information
    id: "",
    title: "",
    slug: "",
    author: "",
    description: "",
    // Pricing & Stock
    price: "",
    stock: "",
    // Book Specific
    publishDate: "",
    publisher: "",
    pages: "",
    language: "",
    isbn: "",
    genre: "",
    rating: "",
    categoryId: "",
    // Media & SEO
    imageFile: null,
    imagePreview: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  // Auto-generate slug and ID from title
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData((prev) => {
      const newData = { ...prev, [name]: value }
      
      // Auto-generate slug and ID when title changes
      if (name === "title") {
        const slug = generateSlug(value)
        newData.slug = slug
        newData.id = slug
      }
      
      return newData
    })
    
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, imageFile: "Please upload a valid image file (JPEG, PNG, WEBP, GIF)" }))
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, imageFile: "Image size should be less than 5MB" }))
        return
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: previewUrl
      }))
      
      // Clear image error if exists
      if (errors.imageFile) {
        setErrors(prev => ({ ...prev, imageFile: "" }))
      }
    }
  }

  const removeImage = () => {
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview)
    }
    setFormData(prev => ({
      ...prev,
      imageFile: null,
      imagePreview: ""
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Required fields validation
    if (!formData.title.trim()) newErrors.title = "Book title is required"
    if (!formData.author.trim()) newErrors.author = "Author name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.price || formData.price <= 0) newErrors.price = "Valid price is required"
    if (!formData.stock || formData.stock < 0) newErrors.stock = "Valid stock quantity is required"
    if (!formData.isbn.trim()) newErrors.isbn = "ISBN is required"
    if (!formData.genre.trim()) newErrors.genre = "Genre is required"
    if (!formData.publishDate) newErrors.publishDate = "Publish date is required"
    if (!formData.publisher.trim()) newErrors.publisher = "Publisher is required"
    if (!formData.language.trim()) newErrors.language = "Language is required"
    if (!formData.categoryId) newErrors.categoryId = "Category is required"
    
    // Optional SEO validation
    if (formData.seoTitle && formData.seoTitle.length > 60) {
      newErrors.seoTitle = "Meta title should not exceed 60 characters"
    }
    if (formData.seoDescription && formData.seoDescription.length > 160) {
      newErrors.seoDescription = "Meta description should not exceed 160 characters"
    }
    
    // ISBN format validation (basic)
    const isbnPattern = /^(97(8|9))?\d{9}(\d|X)$/
    if (formData.isbn && !isbnPattern.test(formData.isbn.replace(/[-\s]/g, ''))) {
      newErrors.isbn = "Please enter a valid ISBN (10 or 13 digits)"
    }
    
    // Rating validation
    if (formData.rating && (formData.rating < 0 || formData.rating > 5)) {
      newErrors.rating = "Rating must be between 0 and 5"
    }
    
    // Pages validation
    if (formData.pages && formData.pages <= 0) {
      newErrors.pages = "Pages must be greater than 0"
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      // Scroll to first error
      const firstError = document.querySelector('.border-red-500')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Convert image file to base64 or URL
      let imageUrl = ""
      if (formData.imageFile) {
        // Convert to base64
        imageUrl = await convertImageToBase64(formData.imageFile)
      }
      
      // Format price to cents/paise (multiply by 100) - using Indian Rupee
      const formattedData = {
        ...formData,
        price: Math.round(parseFloat(formData.price) * 100),
        currency: "INR",
        rating: formData.rating ? parseFloat(formData.rating) : null,
        pages: formData.pages ? parseInt(formData.pages) : null,
        stock: parseInt(formData.stock),
        imageUrl: imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Remove temporary fields
      delete formattedData.imageFile
      delete formattedData.imagePreview
      
      await onSubmit(formattedData)
      
      // Reset form on success
      setFormData({
        id: "",
        title: "",
        slug: "",
        author: "",
        description: "",
        price: "",
        stock: "",
        publishDate: "",
        publisher: "",
        pages: "",
        language: "",
        isbn: "",
        genre: "",
        rating: "",
        categoryId: "",
        imageFile: null,
        imagePreview: "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
      })
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const getCurrentYear = () => {
    return new Date().getFullYear()
  }

  const languages = [
    "English", "Hindi", "Tamil", "Telugu", "Malayalam", "Kannada",
    "Bengali", "Marathi", "Gujarati", "Punjabi", "Urdu", "Sanskrit",
    "Spanish", "French", "German", "Chinese", "Japanese", "Russian",
    "Arabic", "Portuguese", "Italian", "Korean", "Dutch", "Other"
  ]

  const genres = [
    "Fiction", "Non-Fiction", "Mystery", "Thriller", "Science Fiction",
    "Fantasy", "Romance", "Historical Fiction", "Biography", "Memoir",
    "Self-Help", "Business", "Technology", "Children's", "Young Adult",
    "Poetry", "Drama", "Horror", "Adventure", "Cookbook", "Art", "Travel",
    "Religion", "Philosophy", "Psychology", "Health", "Sports", "Other"
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-full mx-auto">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Book Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Book Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.title ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Enter book title"
              disabled={isSubmitting}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.categoryId ? "border-red-500" : "border-slate-300"
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId}</p>}
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.author ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Author name"
              disabled={isSubmitting}
            />
            {errors.author && <p className="mt-1 text-xs text-red-600">{errors.author}</p>}
          </div>

          {/* ISBN */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ISBN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.isbn ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="978-0-123456-47-2"
              disabled={isSubmitting}
            />
            {errors.isbn && <p className="mt-1 text-xs text-red-600">{errors.isbn}</p>}
            <p className="mt-1 text-xs text-slate-500">ISBN-10 or ISBN-13 format</p>
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Genre <span className="text-red-500">*</span>
            </label>
            <select
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.genre ? "border-red-500" : "border-slate-300"
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select genre</option>
              {genres.map((genre) => (
                <option key={genre} value={genre.toLowerCase()}>
                  {genre}
                </option>
              ))}
            </select>
            {errors.genre && <p className="mt-1 text-xs text-red-600">{errors.genre}</p>}
          </div>

          {/* Price with Indian Rupee Symbol */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg font-medium">₹</span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.price ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={isSubmitting}
              />
            </div>
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.stock ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="0"
              min="0"
              disabled={isSubmitting}
            />
            {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
          </div>
        </div>
      </div>

      {/* Book Details */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Book Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Publisher */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Publisher <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.publisher ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Publisher name"
              disabled={isSubmitting}
            />
            {errors.publisher && <p className="mt-1 text-xs text-red-600">{errors.publisher}</p>}
          </div>

          {/* Publish Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Publish Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="publishDate"
              value={formData.publishDate}
              onChange={handleChange}
              max={getCurrentYear() + "-12-31"}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.publishDate ? "border-red-500" : "border-slate-300"
              }`}
              disabled={isSubmitting}
            />
            {errors.publishDate && <p className="mt-1 text-xs text-red-600">{errors.publishDate}</p>}
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
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.pages ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Number of pages"
              min="1"
              disabled={isSubmitting}
            />
            {errors.pages && <p className="mt-1 text-xs text-red-600">{errors.pages}</p>}
          </div>

          {/* Language with Indian Languages */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Language <span className="text-red-500">*</span>
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.language ? "border-red-500" : "border-slate-300"
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select language</option>
              <optgroup label="Indian Languages">
                <option value="hindi">Hindi</option>
                <option value="tamil">Tamil</option>
                <option value="telugu">Telugu</option>
                <option value="malayalam">Malayalam</option>
                <option value="kannada">Kannada</option>
                <option value="bengali">Bengali</option>
                <option value="marathi">Marathi</option>
                <option value="gujarati">Gujarati</option>
                <option value="punjabi">Punjabi</option>
                <option value="urdu">Urdu</option>
                <option value="sanskrit">Sanskrit</option>
              </optgroup>
              <optgroup label="International Languages">
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="chinese">Chinese</option>
                <option value="japanese">Japanese</option>
                <option value="russian">Russian</option>
                <option value="arabic">Arabic</option>
                <option value="portuguese">Portuguese</option>
                <option value="italian">Italian</option>
                <option value="korean">Korean</option>
                <option value="dutch">Dutch</option>
              </optgroup>
              <option value="other">Other</option>
            </select>
            {errors.language && <p className="mt-1 text-xs text-red-600">{errors.language}</p>}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rating (0-5)
            </label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.rating ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="4.5"
              step="0.1"
              min="0"
              max="5"
              disabled={isSubmitting}
            />
            {errors.rating && <p className="mt-1 text-xs text-red-600">{errors.rating}</p>}
          </div>

          {/* Image Uploader with Preview */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Book Cover Image
            </label>
            
            {/* Image Preview Area */}
            {formData.imagePreview && (
              <div className="mb-3 relative inline-block">
                <div className="relative group">
                  <img 
                    src={formData.imagePreview} 
                    alt="Book cover preview" 
                    className="w-32 h-40 object-cover rounded-lg border border-slate-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* File Upload Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors border border-slate-300"
              >
                Choose Image
              </button>
              <span className="text-xs text-slate-500">
                JPEG, PNG, WEBP, GIF (Max 5MB)
              </span>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              className="hidden"
              disabled={isSubmitting}
            />
            
            {errors.imageFile && (
              <p className="mt-1 text-xs text-red-600">{errors.imageFile}</p>
            )}
          </div>

          {/* Description - Full width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Book description, synopsis, or summary"
              disabled={isSubmitting}
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
            <p className="mt-1 text-xs text-slate-500">
              {formData.description.length} characters
            </p>
          </div>
        </div>
      </div>

      {/* SEO Information */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">SEO Information</h2>
        
        <div className="space-y-5">
          {/* SEO Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Meta Title
            </label>
            <input
              type="text"
              name="seoTitle"
              value={formData.seoTitle}
              onChange={handleChange}
              maxLength="60"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.seoTitle ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="SEO title (60 chars max)"
              disabled={isSubmitting}
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-slate-500">50-60 characters recommended</p>
              <p className={`text-xs ${formData.seoTitle?.length > 60 ? 'text-red-500' : 'text-slate-500'}`}>
                {formData.seoTitle?.length || 0}/60
              </p>
            </div>
            {errors.seoTitle && <p className="mt-1 text-xs text-red-600">{errors.seoTitle}</p>}
          </div>

          {/* SEO Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Meta Description
            </label>
            <textarea
              name="seoDescription"
              value={formData.seoDescription}
              onChange={handleChange}
              maxLength="160"
              rows="2"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.seoDescription ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="SEO description (160 chars max)"
              disabled={isSubmitting}
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-slate-500">150-160 characters recommended</p>
              <p className={`text-xs ${formData.seoDescription?.length > 160 ? 'text-red-500' : 'text-slate-500'}`}>
                {formData.seoDescription?.length || 0}/160
              </p>
            </div>
            {errors.seoDescription && <p className="mt-1 text-xs text-red-600">{errors.seoDescription}</p>}
          </div>

          {/* SEO Keywords */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Meta Keywords
            </label>
            <input
              type="text"
              name="seoKeywords"
              value={formData.seoKeywords}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="keyword1, keyword2, keyword3"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-slate-500">Separate keywords with commas</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-5 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              "Add Product"
            )}
          </button>
        </div>
      </div>
    </form>
  )
}