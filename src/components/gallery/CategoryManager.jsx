import { useState } from 'react'
import { categories, addCategory } from '../../data/categories'

export default function CategoryManager() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const [categoryList, setCategoryList] = useState(categories)

  const handleAddCategory = (e) => {
    e.preventDefault()
    if (newCategory.name.trim()) {
      const added = addCategory(newCategory.name, newCategory.description)
      setCategoryList([...categories])
      setNewCategory({ name: '', description: '' })
      setShowAddForm(false)
      alert(`Category "${added.name}" added successfully!`)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Manage Categories</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
        >
          + Add New Category
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddCategory} className="mb-4 p-4 bg-slate-50 rounded">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Category Name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Description (optional)"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded-md">
              Save Category
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 bg-slate-300 text-slate-700 rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {categoryList.map(cat => (
          <span key={cat.id} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
            {cat.name}
          </span>
        ))}
      </div>
    </div>
  )
}