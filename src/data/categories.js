export const categories = [
  { id: 1, name: 'Events', slug: 'events', description: 'Special events and celebrations' },
  { id: 2, name: 'Arts', slug: 'arts', description: 'Art exhibitions and performances' },
  { id: 3, name: 'Literature', slug: 'literature', description: 'Books, poetry, and literary events' },
  { id: 4, name: 'Culture', slug: 'culture', description: 'Cultural festivals and traditions' },
  { id: 5, name: 'Workshop', slug: 'workshop', description: 'Educational workshops and seminars' },
  { id: 6, name: 'Community', slug: 'community', description: 'Community gatherings and activities' }
]

// Function to add a new category
export const addCategory = (categoryName, description = '') => {
  const newCategory = {
    id: categories.length + 1,
    name: categoryName,
    slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
    description: description
  }
  categories.push(newCategory)
  return newCategory
}

// Function to get category by name
export const getCategoryByName = (name) => {
  return categories.find(cat => cat.name === name)
}

// Function to get all categories
export const getAllCategories = () => {
  return [...categories]
}