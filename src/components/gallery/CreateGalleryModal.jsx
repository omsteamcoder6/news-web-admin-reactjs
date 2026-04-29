import { useState, useEffect } from 'react'
import { categories, addCategory } from '../../data/categories'
import galleryApi, { createGalleryFormData, getImageUrl } from '../../lib/galleryApi' // Adjust path as needed

export default function CreateGalleryModal({ isOpen, onClose, onGallerySaved, editingItem }) {
  const [formData, setFormData] = useState({
    image: null,
    title: '',
    description: '',
    altText: '',
    category: '',
    photographer: '',
    date: new Date().toISOString().split('T')[0],
    isFeatured: false
  })
  
  const [previewUrl, setPreviewUrl] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDesc, setNewCategoryDesc] = useState('')
  const [categoryList, setCategoryList] = useState([...categories])
  
  const isEditMode = !!editingItem

  console.log('Modal props:', { isOpen, editingItem, isEditMode }); // Debug log

  // Populate form when editing an item
  useEffect(() => {
    console.log('useEffect triggered, editingItem:', editingItem); // Debug log
    
    if (editingItem) {
      // Normalize the item data (handle both _id and id)
      const itemData = {
        _id: editingItem._id || editingItem.id,
        title: editingItem.title || '',
        description: editingItem.description || '',
        altText: editingItem.altText || '',
        category: editingItem.category || '',
        photographer: editingItem.photographer || '',
        date: editingItem.date || new Date().toISOString().split('T')[0],
        isFeatured: editingItem.isFeatured || false,
        imageUrl: editingItem.imageUrl || editingItem.image || ''
      }
      
      console.log('Populating form with:', itemData); // Debug log
      
      setFormData({
        image: null,
        title: itemData.title,
        description: itemData.description,
        altText: itemData.altText,
        category: itemData.category,
        photographer: itemData.photographer,
        date: itemData.date ? new Date(itemData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        isFeatured: itemData.isFeatured
      })
      
      // Set preview from existing image URL
      if (itemData.imageUrl) {
        const fullImageUrl = getImageUrl(itemData.imageUrl);
        console.log('Setting preview URL:', fullImageUrl); // Debug log
        setPreviewUrl(fullImageUrl)
      }
    } else {
      console.log('Resetting form for create mode'); // Debug log
      // Reset form for create mode
      setFormData({
        image: null,
        title: '',
        description: '',
        altText: '',
        category: '',
        photographer: '',
        date: new Date().toISOString().split('T')[0],
        isFeatured: false
      })
      setPreviewUrl('')
      setErrors({})
    }
  }, [editingItem])

  if (!isOpen) return null

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      const newCat = addCategory(newCategoryName.trim(), newCategoryDesc)
      setCategoryList([...categories])
      setFormData({ ...formData, category: newCat.name })
      setNewCategoryName('')
      setNewCategoryDesc('')
      setShowNewCategory(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Only validate image for create mode, or if a new image is uploaded in edit mode
    if (!isEditMode && !formData.image) {
      newErrors.image = 'Please upload an image'
    } else if (formData.image && formData.image.size > 5 * 1024 * 1024) {
      newErrors.image = 'File size must be less than 5MB'
    } else if (formData.image && !['image/jpeg', 'image/png', 'image/webp'].includes(formData.image.type)) {
      newErrors.image = 'Only JPG, PNG, or WebP images are allowed'
    }
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (!formData.altText.trim()) {
      newErrors.altText = 'Alt text is required'
    } else if (formData.altText.length < 3) {
      newErrors.altText = 'Alt text must be at least 3 characters'
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select a date'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, image: file })
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('Form submitted, isEditMode:', isEditMode); // Debug log
    
    if (!validateForm()) {
      console.log('Validation failed:', errors); // Debug log
      return
    }
    
    setIsSubmitting(true)
    
    try {
      let response
      
      if (isEditMode) {
        // UPDATE MODE
        const itemId = editingItem._id || editingItem.id;
        console.log('Updating item with ID:', itemId); // Debug log
        
        const formDataToSend = createGalleryFormData({
          title: formData.title,
          description: formData.description,
          image: formData.image, // Will be null if no new image selected
          altText: formData.altText,
          category: formData.category,
          photographer: formData.photographer,
          date: formData.date,
          isFeatured: formData.isFeatured
        })
        
        response = await galleryApi.updateGalleryItem(itemId, formDataToSend)
        console.log('Update response:', response); // Debug log
      } else {
        // CREATE MODE
        console.log('Creating new item'); // Debug log
        
        const formDataToSend = createGalleryFormData({
          title: formData.title,
          description: formData.description,
          image: formData.image,
          altText: formData.altText,
          category: formData.category,
          photographer: formData.photographer,
          date: formData.date,
          isFeatured: formData.isFeatured
        })
        
        response = await galleryApi.createGalleryItem(formDataToSend)
        console.log('Create response:', response); // Debug log
      }
      
      if (response.success) {
        console.log('Success! Closing modal and refreshing'); // Debug log
        // Reset form
        setFormData({
          image: null,
          title: '',
          description: '',
          altText: '',
          category: '',
          photographer: '',
          date: new Date().toISOString().split('T')[0],
          isFeatured: false
        })
        setPreviewUrl('')
        
        // Notify parent to refresh
        if (onGallerySaved) {
          onGallerySaved()
        }
      } else {
        // Handle error
        console.error('API error:', response); // Debug log
        if (response.unauthorized) {
          alert('Please login to add/edit gallery items')
        } else {
          alert(response.message || `Failed to ${isEditMode ? 'update' : 'create'} gallery item`)
        }
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} gallery item:`, error)
      alert('An error occurred while saving. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveImage = () => {
    if (previewUrl && !previewUrl.startsWith('http')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl('')
    setFormData({ ...formData, image: null })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto hide-scrollbar">
      {/* Minimal Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
          {/* Minimal Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-6 py-5 flex justify-between items-center">
            <h2 className="text-xl font-medium text-slate-900">
              {isEditMode ? 'Edit gallery post' : 'New gallery post'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-all duration-200 rounded-full p-1 hover:bg-slate-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Image {!isEditMode && '*'}
              </label>
              <div className="relative">
                {previewUrl ? (
                  <div className="relative group">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-slate-700 p-1.5 rounded-full shadow-sm hover:bg-white transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {isEditMode && !formData.image && (
                      <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        Current image (upload new to replace)
                      </span>
                    )}
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-slate-500">Click to upload</span>
                    <span className="text-xs text-slate-400 mt-1">JPG, PNG, WebP · Max 5MB</span>
                  </label>
                )}
              </div>
              {errors.image && <p className="text-red-500 text-xs mt-1.5">{errors.image}</p>}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter image title"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all duration-200 text-sm"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description (optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter image description"
                rows="3"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all duration-200 text-sm"
              />
            </div>

            {/* Alt Text */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Alt text *
              </label>
              <input
                type="text"
                name="altText"
                value={formData.altText}
                onChange={handleInputChange}
                placeholder="Describe the image"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all duration-200 text-sm"
              />
              {errors.altText && <p className="text-red-500 text-xs mt-1.5">{errors.altText}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Category *
              </label>
              {!showNewCategory ? (
                <div className="flex gap-2">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm bg-white"
                  >
                    <option value="">Select category</option>
                    {categoryList.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(true)}
                    className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200"
                  >
                    + New
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all duration-200"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCategory(false)
                        setNewCategoryName('')
                        setNewCategoryDesc('')
                      }}
                      className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {errors.category && <p className="text-red-500 text-xs mt-1.5">{errors.category}</p>}
            </div>

            {/* Photographer */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Photographer
              </label>
              <input
                type="text"
                name="photographer"
                value={formData.photographer}
                onChange={handleInputChange}
                placeholder="Photographer name (optional)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm"
              />
              {errors.date && <p className="text-red-500 text-xs mt-1.5">{errors.date}</p>}
            </div>

            {/* Featured Checkbox */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-1 focus:ring-slate-400"
                />
                <span className="ml-2 text-sm text-slate-700">Feature this image</span>
              </label>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white pt-4 mt-2 flex justify-end gap-2 border-t border-slate-100 -mx-6 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update' : 'Save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}