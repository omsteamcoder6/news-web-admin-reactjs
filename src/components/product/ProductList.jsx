import { useState, useEffect } from "react"

export default function ProductList({ products, onDeleteProduct, onUpdateProduct, categories }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [editingProduct, setEditingProduct] = useState(null)
  
  // --- Calendar Integration States ---
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const [editFormData, setEditFormData] = useState({
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

  // Set default selected date to TODAY
  useEffect(() => {
    const today = new Date()
    setSelectedDate(today.getDate())
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
  }, [])

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === parseInt(categoryId))
    return category ? category.name : "Uncategorized"
  }

  const handleEditClick = (product) => {
    setEditingProduct(product)
    setEditFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price,
      categoryId: product.categoryId,
      stock: product.stock || "",
      imageUrl: product.imageUrl || "",
      seoTitle: product.seoTitle || "",
      seoDescription: product.seoDescription || "",
      seoKeywords: product.seoKeywords || "",
      status: product.status
    })
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    onUpdateProduct({
      ...editingProduct,
      ...editFormData,
      price: parseFloat(editFormData.price),
      stock: editFormData.stock ? parseInt(editFormData.stock) : 0
    })
    setEditingProduct(null)
  }

  // --- Filter Logic with Current Date Wise ---
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || product.status === filterStatus
    
    let matchesDate = true
    if (selectedDate !== null) {
      const productDateStr = product.createdAt || product.date
      if (productDateStr) {
        const productDate = new Date(productDateStr)
        matchesDate = 
          productDate.getDate() === selectedDate &&
          productDate.getMonth() === currentMonth &&
          productDate.getFullYear() === currentYear
      } else {
        matchesDate = false
      }
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  // --- Get days in month ---
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  // --- Calendar Grid Generator (Dynamic Month/Year) ---
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
    const today = new Date()
    const isCurrentMonthToday = (today.getMonth() === currentMonth && today.getFullYear() === currentYear)
    
    const daysGrid = []
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      daysGrid.push(<div key={`empty-${i}`} className="h-9 w-9"></div>)
    }
    
    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate === day
      const isToday = isCurrentMonthToday && today.getDate() === day
      
      daysGrid.push(
        <button
          key={day}
          type="button"
          onClick={() => {
            setSelectedDate(day)
            setShowCalendar(false)
          }}
          className={`h-9 w-9 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 relative
            ${isSelected 
              ? "bg-emerald-600 text-white shadow-md scale-110" 
              : isToday
              ? "border-2 border-emerald-500 text-emerald-700 font-bold"
              : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
        >
          {day}
          {isToday && !isSelected && (
            <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full"></span>
          )}
        </button>
      )
    }
    return daysGrid
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDate(null)
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDate(null)
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
    setSelectedDate(today.getDate())
    setShowCalendar(false)
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No products yet</h3>
        <p className="text-slate-600 mb-4">Get started by adding your first product</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search, Filter, and Calendar Action Bar */}
      <div className="flex gap-4 items-center relative flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        
        {/* Toggle Calendar Button */}
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className={`px-4 py-2 rounded-lg border font-medium flex items-center gap-2 transition-all duration-200 z-20 ${
            showCalendar 
              ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm" 
              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          📅 {selectedDate ? `${monthNames[currentMonth]} ${selectedDate}, ${currentYear}` : "Calendar Filter"}
          {selectedDate && (
            <span 
              onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedDate(null); 
              }} 
              className="ml-1 text-xs bg-emerald-200 text-emerald-800 rounded-full w-4 h-4 inline-flex items-center justify-center hover:bg-emerald-300 transition-colors"
            >
              ✕
            </span>
          )}
        </button>

        {/* Click Outside Backdrop Layer */}
        {showCalendar && (
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowCalendar(false)} 
          />
        )}

        {/* Floating Popup Calendar Overlay */}
        <div 
          className={`absolute right-0 top-full mt-2 z-20 transition-all duration-300 ease-out origin-top-right transform ${
            showCalendar 
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }`}
        >
          <div className="w-80 p-5 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-600/20 shadow-xl bg-gradient-to-br from-emerald-50/40 to-teal-50/20">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={goToPreviousMonth}
                className="text-emerald-700 hover:text-emerald-900 text-xl font-bold px-2"
              >
                ◀
              </button>
              <h3 className="text-center font-serif text-xl text-emerald-800 tracking-wide">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button 
                onClick={goToNextMonth}
                className="text-emerald-700 hover:text-emerald-900 text-xl font-bold px-2"
              >
                ▶
              </button>
            </div>
            
            {/* Today button */}
            <div className="flex justify-center mb-3">
              <button
                onClick={goToToday}
                className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full hover:bg-emerald-200 transition-colors"
              >
                Today
              </button>
            </div>
            
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            
            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1 justify-items-center">
              {renderCalendarDays()}
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-slate-900">{product.name}</div>
                      <div className="text-sm text-slate-500">/{product.slug}</div>
                      {(product.createdAt || product.date) && (
                        <div className="text-xs text-emerald-600 mt-0.5">
                          📅 {new Date(product.createdAt || product.date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {getCategoryName(product.categoryId)}
                   </td>
                  <td className="px-6 py-4 text-slate-900 font-medium">
                    ${parseFloat(product.price).toFixed(2)}
                   </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock > 10 
                        ? "bg-green-100 text-green-800"
                        : product.stock > 0
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>
                   </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      product.status === "published"
                        ? "bg-green-100 text-green-800"
                        : product.status === "draft"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {product.status}
                    </span>
                   </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                   </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No products found for {selectedDate ? `${monthNames[currentMonth]} ${selectedDate}, ${currentYear}` : "selected date"}.
                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="ml-2 text-emerald-600 underline"
                    >
                      Clear filter
                    </button>
                  )}
                 </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="text-sm text-slate-600">
        Showing {filteredProducts.length} of {products.length} products
        {selectedDate && (
          <span className="ml-2 text-emerald-600">
            (Filtered by: {monthNames[currentMonth]} {selectedDate}, {currentYear})
          </span>
        )}
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">Edit Product</h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={editFormData.slug}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <select
                    name="categoryId"
                    value={editFormData.categoryId}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={editFormData.price}
                    onChange={handleEditChange}
                    required
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={editFormData.stock}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}