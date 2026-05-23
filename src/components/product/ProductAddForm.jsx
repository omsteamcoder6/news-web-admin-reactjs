import { useState } from "react"

export default function ProductAddForm({ categories, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    categoryId: "",
    stock: "",
    imageUrl: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    status: "draft"
  })

  const [errors, setErrors] = useState({})

  // Auto-generate slug from product name
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
      
      if (name === "name") {
        newData.slug = generateSlug(value)
      }
      
      return newData
    })
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = "Product name is required"
    if (!formData.slug.trim()) newErrors.slug = "Slug is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.price || formData.price <= 0) newErrors.price = "Valid price is required"
    if (!formData.categoryId) newErrors.categoryId = "Category is required"
    if (!formData.seoTitle.trim()) newErrors.seoTitle = "SEO title is required"
    if (!formData.seoDescription.trim()) newErrors.seoDescription = "SEO description is required"
    
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validateForm()
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    onSubmit(formData)
    // Reset form
    setFormData({
      name: "",
      slug: "",
      description: "",
      price: "",
      categoryId: "",
      stock: "",
      imageUrl: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      status: "draft"
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-[90%] lg:max-w-[90%] mx-auto">
      {/* Basic Information - Compact */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Enter product name"
            />
            {errors.name && <p className="mt-0.5 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 ${
                errors.slug ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="auto-generated"
            />
            {errors.slug && <p className="mt-0.5 text-xs text-red-600">{errors.slug}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.categoryId ? "border-red-500" : "border-slate-300"
              }`}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-0.5 text-xs text-red-600">{errors.categoryId}</p>}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Price *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.price ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="0.00"
              step="0.01"
            />
            {errors.price && <p className="mt-0.5 text-xs text-red-600">{errors.price}</p>}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Image URL
            </label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Description - Full width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Product description"
            />
            {errors.description && <p className="mt-0.5 text-xs text-red-600">{errors.description}</p>}
          </div>
        </div>
      </div>

      {/* SEO Information - Compact */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">SEO Information</h2>
        
        <div className="space-y-4">
          {/* SEO Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Meta Title *
            </label>
            <input
              type="text"
              name="seoTitle"
              value={formData.seoTitle}
              onChange={handleChange}
              maxLength="60"
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.seoTitle ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="SEO title (60 chars max)"
            />
            <div className="flex justify-between mt-0.5">
              <p className="text-xs text-slate-500">50-60 characters recommended</p>
              <p className="text-xs text-slate-500">{formData.seoTitle.length}/60</p>
            </div>
            {errors.seoTitle && <p className="mt-0.5 text-xs text-red-600">{errors.seoTitle}</p>}
          </div>

          {/* SEO Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Meta Description *
            </label>
            <textarea
              name="seoDescription"
              value={formData.seoDescription}
              onChange={handleChange}
              maxLength="160"
              rows="2"
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.seoDescription ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="SEO description (160 chars max)"
            />
            <div className="flex justify-between mt-0.5">
              <p className="text-xs text-slate-500">150-160 characters recommended</p>
              <p className="text-xs text-slate-500">{formData.seoDescription.length}/160</p>
            </div>
            {errors.seoDescription && <p className="mt-0.5 text-xs text-red-600">{errors.seoDescription}</p>}
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
              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="keyword1, keyword2, keyword3"
            />
            <p className="mt-0.5 text-xs text-slate-500">Separate keywords with commas</p>
          </div>
        </div>
      </div>

      {/* Status & Submit - Compact */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Product
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}