import { useState } from "react"

export default function ProductCategory({ categories, onAddCategory }) {
  const [categoryName, setCategoryName] = useState("")
  const [categorySlug, setCategorySlug] = useState("")
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState({})

  // Generate slug from category name
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim()
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setCategoryName(name)
    setCategorySlug(generateSlug(name))
    
    if (errors.name) setErrors({ ...errors, name: "" })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newErrors = {}
    if (!categoryName.trim()) newErrors.name = "Category name is required"
    if (!categorySlug.trim()) newErrors.slug = "Slug is required"
    
    // Check for duplicate slug
    if (categories.some(cat => cat.slug === categorySlug)) {
      newErrors.slug = "This slug already exists. Please use a different name."
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    onAddCategory({
      name: categoryName,
      slug: categorySlug,
      description: description
    })
    
    // Reset form
    setCategoryName("")
    setCategorySlug("")
    setDescription("")
    setErrors({})
  }

  return (
    <div className="space-y-6">
      {/* Create Category Form */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Create New Category</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={handleNameChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="e.g., Electronics, Clothing, Books"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category Slug *
            </label>
            <input
              type="text"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 ${
                errors.slug ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="auto-generated-from-name"
            />
            <p className="mt-1 text-xs text-slate-500">
              URL-friendly version: /category/{categorySlug || "category-name"}
            </p>
            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of the category"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Category
            </button>
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">All Categories</h2>
        </div>
        
        {categories.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No categories yet. Create your first category above.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {categories.map((category) => (
              <div key={category.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{category.name}</h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ID: {category.id}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-slate-600">
                        <span className="font-medium">Slug:</span> /category/{category.slug}
                      </p>
                      {category.description && (
                        <p className="text-slate-600">
                          <span className="font-medium">Description:</span> {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Category URL Preview */}
        {categories.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600">
              <span className="font-medium">Category URLs:</span> These slugs are used for SEO-friendly URLs
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((category) => (
                <span key={category.id} className="text-xs bg-white px-2 py-1 rounded border border-slate-200">
                  /category/{category.slug}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}