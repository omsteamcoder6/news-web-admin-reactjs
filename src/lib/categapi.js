// categapi.js
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
})

const getAuthToken = () => {
    // Zustand persist middleware keeps this populated across page reloads
    const token = useAuthStore.getState().token

    if (token) return token

    // Edge case: Zustand hasn't finished hydrating yet on first render.
    // Read directly from the persisted localStorage key.
    try {
        const raw = localStorage.getItem('auth-storage')
        if (raw) {
            const parsed = JSON.parse(raw)
            return parsed?.state?.token || null
        }
    } catch { /* ignore */ }

    return null
}

// Attach token to every request
apiClient.interceptors.request.use((config) => {
    const token = getAuthToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle 401s globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout()
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

const categoryAPI = {
    getCategories: async (filters = {}) => {
        try {
            const { status, sort = 'position' } = filters
            const params = new URLSearchParams()
            if (status && status !== 'all') params.append('status', status)
            if (sort) params.append('sort', sort)
            const qs = params.toString()
            const response = await apiClient.get(`/categories${qs ? `?${qs}` : ''}`)
            return response.data.categories || response.data.data || response.data
        } catch (error) {
            console.error('Error fetching categories:', error)
            throw error
        }
    },

    getCategoryById: async (id) => {
        if (!id) throw new Error('Category ID is required')
        const response = await apiClient.get(`/categories/${id}`)
        return response.data.category || response.data.data || response.data
    },

    getCategoryBySlug: async (slug) => {
        if (!slug) throw new Error('Slug is required')
        const response = await apiClient.get(`/categories/slug/${slug}`)
        return response.data.category || response.data.data || response.data
    },

    createCategory: async (categoryData) => {
        const { name, slug, icon, status, position } = categoryData
        if (!name || !slug) throw new Error('Name and slug are required')
        if (!getAuthToken()) throw new Error('You must be logged in to create a category.')
        try {
            const response = await apiClient.post('/categories', { name, slug, icon, status, position })
            return response.data.category || response.data.data || response.data
        } catch (error) {
            if (error.response?.status === 401) throw new Error('Your session has expired. Please log in again.')
            throw error
        }
    },

    updateCategory: async (id, categoryData) => {
        if (!id) throw new Error('Category ID is required')
        if (!getAuthToken()) throw new Error('You must be logged in to update a category')
        const { name, slug, icon, status, position } = categoryData
        const response = await apiClient.put(`/categories/${id}`, { name, slug, icon, status, position })
        return response.data.category || response.data.data || response.data
    },

    updateCategoryStatus: async (id, status) => {
        if (!id) throw new Error('Category ID is required')
        if (!['Active', 'Hidden'].includes(status)) throw new Error('Status must be Active or Hidden')
        if (!getAuthToken()) throw new Error('You must be logged in to update category status')
        const response = await apiClient.patch(`/categories/${id}/status`, { status })
        return response.data.category || response.data.data || response.data
    },

    reorderCategories: async (categories) => {
        if (!Array.isArray(categories) || !categories.length) throw new Error('Categories array is required')
        if (!getAuthToken()) throw new Error('You must be logged in to reorder categories')
        const formatted = categories.map((cat, i) => ({
            id: cat.id || cat._id,
            position: cat.position ?? i + 1,
        }))
        const response = await apiClient.put('/categories/reorder', { categories: formatted })
        return response.data
    },

    deleteCategory: async (id) => {
        if (!id) throw new Error('Category ID is required')
        if (!getAuthToken()) throw new Error('You must be logged in to delete a category')
        const response = await apiClient.delete(`/categories/${id}`)
        return response.data
    },

    bulkDeleteCategories: async (ids) => {
        if (!Array.isArray(ids) || !ids.length) throw new Error('Array of category IDs is required')
        if (!getAuthToken()) throw new Error('You must be logged in to delete categories')
        const response = await apiClient.delete('/categories/bulk/delete', { data: { ids } })
        return response.data
    },

    generateSlug: (name) => {
        if (!name) return ''
        return name.toLowerCase().trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '')
    },

    isValidSlug: (slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),
    getStatusOptions: () => ['Active', 'Hidden'],
    getSortOptions: () => [
        { value: 'position', label: 'Position' },
        { value: 'name', label: 'Name' },
        { value: 'createdAt', label: 'Date Created' },
        { value: 'updatedAt', label: 'Date Updated' },
    ],
    getIconOptions: () => [
        { value: '📁', label: '📁 Folder' }, { value: '📰', label: '📰 News' },
        { value: '📚', label: '📚 Books' }, { value: '🎨', label: '🎨 Art' },
        { value: '💻', label: '💻 Technology' }, { value: '🏠', label: '🏠 Home' },
        { value: '🎵', label: '🎵 Music' }, { value: '🎮', label: '🎮 Gaming' },
        { value: '📷', label: '📷 Photography' }, { value: '✈️', label: '✈️ Travel' },
        { value: '🍔', label: '🍔 Food' }, { value: '💪', label: '💪 Fitness' },
        { value: '🎓', label: '🎓 Education' }, { value: '💼', label: '💼 Business' },
        { value: '❤️', label: '❤️ Health' },
    ],
}

export const useCategoryAPI = () => categoryAPI
export default categoryAPI