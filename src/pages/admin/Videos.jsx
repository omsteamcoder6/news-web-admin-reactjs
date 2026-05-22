import { useState, useEffect } from "react"
import { MainLayout } from "../../layout/MainLayout"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuthStore } from "../../stores/authStore"

// Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL ;

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim()
}

export default function Videos() {
  const navigate = useNavigate()
  const { token, isAuthenticated } = useAuthStore()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState(null)
  const [formData, setFormData] = useState({
    youtubeLink: "",
    title: "",
    channel: "",
    description: "",
    tags: "",
  })

  // Create axios instance with token from store
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  })

  // Add token to requests using the current token from store
  api.interceptors.request.use(
    (config) => {
      const currentToken = useAuthStore.getState().getToken()
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Fetch videos from API on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    fetchVideos()
  }, [isAuthenticated, navigate])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const response = await api.get("/videos")
      setVideos(response.data.data)
    } catch (error) {
      console.error("Error fetching videos:", error)
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.")
        useAuthStore.getState().logout()
        navigate("/login")
      } else {
        alert(error.response?.data?.message || "Failed to load videos")
      }
    } finally {
      setLoading(false)
    }
  }

  // Open modal for creating new video
  const handleCreate = () => {
    setEditingVideo(null)
    setFormData({
      youtubeLink: "",
      title: "",
      channel: "",
      description: "",
      tags: "",
    })
    setIsModalOpen(true)
  }

  // Open modal for editing existing video
  const handleEdit = (video) => {
    setEditingVideo(video)
    setFormData({
      youtubeLink: video.youtubeLink,
      title: video.title,
      channel: video.channel,
      description: video.description || "",
      tags: video.tags ? video.tags.join(", ") : "",
    })
    setIsModalOpen(true)
  }

  // Save (create or update)
  const handleSave = async () => {
    // Validate required fields
    if (!formData.youtubeLink || !formData.title || !formData.channel) {
      alert("Please fill in all required fields (YouTube Link, Title, Channel Name)")
      return
    }

    try {
      const videoData = {
        title: formData.title,
        youtubeLink: formData.youtubeLink,
        channel: formData.channel,
        description: formData.description,
        tags: formData.tags,
      }

      if (editingVideo) {
        // Update existing video
        await api.put(`/videos/${editingVideo._id}`, videoData)
        alert("Video updated successfully")
      } else {
        // Create new video
        await api.post("/videos", videoData)
        alert("Video created successfully")
      }
      setIsModalOpen(false)
      fetchVideos() // Refresh the list
    } catch (error) {
      console.error("Error saving video:", error)
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.")
        useAuthStore.getState().logout()
        navigate("/login")
      } else {
        alert(error.response?.data?.message || "Failed to save video")
      }
    }
  }

  // Delete video
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await api.delete(`/videos/${id}`)
        alert("Video deleted successfully")
        fetchVideos() // Refresh the list
      } catch (error) {
        console.error("Error deleting video:", error)
        if (error.response?.status === 401) {
          alert("Session expired. Please login again.")
          useAuthStore.getState().logout()
          navigate("/login")
        } else {
          alert(error.response?.data?.message || "Failed to delete video")
        }
      }
    }
  }

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Navigate to video detail page
  const handleViewVideo = (slug) => {
    navigate(`/videos/${slug}`)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading videos...</div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Video Management</h1>
            <p className="text-slate-600 mt-2">Add, edit, or remove YouTube videos from your site</p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Video
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Total Videos</p>
            <p className="text-2xl font-bold text-slate-900">{videos.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Published Videos</p>
            <p className="text-2xl font-bold text-slate-900">
              {videos.filter((v) => v.isPublished).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-md font-medium text-slate-900">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Videos Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {videos.map((video, index) => (
                <tr key={video._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{index + 1}</div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewVideo(video.slug)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                    >
                      {video.title}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{video.channel}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{video.views || 0}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        video.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {video.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(video)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(video._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {videos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No videos yet. Click "Add New Video" to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingVideo ? "Edit Video" : "Add New Video"}
              </h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="youtubeLink"
                  value={formData.youtubeLink}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste any YouTube video URL (e.g., https://youtube.com/watch?v=...)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Video title or description"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Slug will be automatically generated:{" "}
                  <span className="font-mono">{generateSlug(formData.title) || "..."}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Channel Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="channel"
                  value={formData.channel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Channel name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Video description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tag1, tag2, tag3 (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingVideo ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}