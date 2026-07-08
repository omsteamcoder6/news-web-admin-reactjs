// Gallery.jsx
import { MainLayout } from "../../layout/MainLayout"
import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import CreateGalleryModal from "../../components/gallery/CreateGalleryModal"
import GalleryList from "../../components/gallery/GalleryList"

export default function Gallery() {
  const { token, isAuthenticated } = useAuthStore()
  const API_BASE_URL = import.meta.env.VITE_API_URL
  
  const [refreshKey, setRefreshKey] = useState(0)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleGallerySaved = () => {
    setRefreshKey(prev => prev + 1)
    setIsModalOpen(false)
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Homepage Management</h1>
            <p className="text-slate-600 mt-2">Customize your homepage layout and content</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Add Gallery Image
          </button>
        </div>

        <GalleryList 
          key={refreshKey}
          filterCategory={filterCategory}
          filterDate={filterDate}
          onFilterChange={{ setFilterCategory, setFilterDate }}
          token={token}
          API_BASE_URL={API_BASE_URL}
        />

        <CreateGalleryModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onGallerySaved={handleGallerySaved}
          token={token}
          API_BASE_URL={API_BASE_URL}
        />
      </div>
    </MainLayout>
  )
}