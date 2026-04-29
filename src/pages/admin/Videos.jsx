import { useState } from "react"
import { MainLayout } from "../../layout/MainLayout"

// Initial data (same as your public side)
const initialVideos = [
  {
    id: 1,
    videoId: 'dQw4w9WgXcQ',
    title: 'Tamil Cultural Festival 2025 Highlights',
    channel: 'Tamil TV',
    views: '1.2M views',
    thumbnail: 'https://images.unsplash.com/photo-1536240474400-bd0a0a1a7c9e?w=800&auto=format',
  },
  {
    id: 2,
    videoId: 'tgbNymZ7vqY',
    title: 'Inside the Tamil Film Industry | Documentary',
    channel: 'Cinema South',
    views: '890K views',
    thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format',
  },
  {
    id: 3,
    videoId: 'M7lc1UVf-VE',
    title: 'Traditional Recipes Passed Down for Generations',
    channel: 'Taste of Tamil Nadu',
    views: '540K views',
    thumbnail: 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=800&auto=format',
  },
  {
    id: 4,
    videoId: '9bZkp7q19f0',
    title: 'Exploring Ancient Temples of Tamil Nadu',
    channel: 'Heritage India',
    views: '2.1M views',
    thumbnail: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format',
  },
]

// Helper function to convert view strings like "1.2M views" to number
const parseViewCount = (viewString) => {
  if (!viewString) return 0
  const numStr = viewString.replace(' views', '').replace(' view', '')
  if (numStr.includes('M')) {
    return parseFloat(numStr) * 1000000
  }
  if (numStr.includes('K')) {
    return parseFloat(numStr) * 1000
  }
  return parseInt(numStr) || 0
}

// Helper function to extract video ID from YouTube URL
const extractVideoId = (url) => {
  if (!url) return null
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&?#]+)/,
    /youtube\.com\/shorts\/([^&?#]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return url // Assume it's already a video ID if no pattern matches
}

// Function to fetch video details from YouTube API
const fetchYouTubeVideoDetails = async (videoId, apiKey) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`
    )
    const data = await response.json()
    
    if (data.items && data.items[0]) {
      const video = data.items[0]
      const snippet = video.snippet
      const statistics = video.statistics
      
      // Format view count
      let views = ''
      const viewCount = parseInt(statistics.viewCount)
      if (viewCount >= 1000000) {
        views = (viewCount / 1000000).toFixed(1) + 'M views'
      } else if (viewCount >= 1000) {
        views = (viewCount / 1000).toFixed(1) + 'K views'
      } else {
        views = viewCount + ' views'
      }
      
      // Get best quality thumbnail
      const thumbnail = snippet.thumbnails.maxres?.url || 
                       snippet.thumbnails.high?.url || 
                       snippet.thumbnails.medium?.url || 
                       snippet.thumbnails.default?.url
      
      return {
        title: snippet.title,
        channel: snippet.channelTitle,
        views: views,
        thumbnail: thumbnail,
        videoId: videoId,
        success: true
      }
    }
    return { success: false, error: 'Video not found' }
  } catch (error) {
    console.error('Error fetching video details:', error)
    return { success: false, error: 'Failed to fetch video details' }
  }
}

export default function Videos() {
  const [videos, setVideos] = useState(initialVideos)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState(null)
  const [isFetching, setIsFetching] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    videoId: '',
    channel: '',
    views: '',
    thumbnail: '',
  })

  // Calculate total views safely
  const totalViews = videos.reduce((sum, v) => {
    return sum + parseViewCount(v.views)
  }, 0)

  // Format total views for display
  const formatTotalViews = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M'
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K'
    }
    return count.toString()
  }

  // Auto-fetch video details from YouTube URL
  const handleAutoFetch = async () => {
    if (!youtubeUrl.trim()) {
      alert('Please enter a YouTube URL or Video ID')
      return
    }
    
    const videoId = extractVideoId(youtubeUrl.trim())
    if (!videoId) {
      alert('Invalid YouTube URL or Video ID')
      return
    }
    
    setIsFetching(true)
    
    // Note: You'll need to add your YouTube API key here
    // Get it from: https://console.cloud.google.com/apis/credentials
    const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY_HERE' // Replace with your actual API key
    
    if (YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
      alert('Please add your YouTube API key first. Get it from Google Cloud Console.')
      setIsFetching(false)
      return
    }
    
    const result = await fetchYouTubeVideoDetails(videoId, YOUTUBE_API_KEY)
    
    if (result.success) {
      setFormData({
        title: result.title,
        videoId: result.videoId,
        channel: result.channel,
        views: result.views,
        thumbnail: result.thumbnail,
      })
      setYoutubeUrl('') // Clear the URL input after successful fetch
    } else {
      alert(`Failed to fetch video details: ${result.error}`)
    }
    
    setIsFetching(false)
  }

  // Open modal for creating new video
  const handleCreate = () => {
    setEditingVideo(null)
    setYoutubeUrl('')
    setFormData({
      title: '',
      videoId: '',
      channel: '',
      views: '',
      thumbnail: '',
    })
    setIsModalOpen(true)
  }

  // Open modal for editing existing video
  const handleEdit = (video) => {
    setEditingVideo(video)
    setYoutubeUrl('')
    setFormData({
      title: video.title,
      videoId: video.videoId,
      channel: video.channel,
      views: video.views,
      thumbnail: video.thumbnail,
    })
    setIsModalOpen(true)
  }

  // Save (create or update)
  const handleSave = () => {
    // Validate required fields
    if (!formData.title || !formData.videoId || !formData.channel) {
      alert('Please fill in all required fields (Title, Video ID, Channel)')
      return
    }
    
    if (editingVideo) {
      // Update existing video
      const updatedVideos = videos.map((video) =>
        video.id === editingVideo.id
          ? { ...video, ...formData }
          : video
      )
      setVideos(updatedVideos)
    } else {
      // Create new video
      const newId = Math.max(...videos.map((v) => v.id), 0) + 1
      const newVideo = {
        id: newId,
        ...formData,
      }
      setVideos([...videos, newVideo])
    }
    setIsModalOpen(false)
  }

  // Delete video
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      setVideos(videos.filter((video) => video.id !== id))
    }
  }

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
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
            <p className="text-sm text-gray-500">Total Views</p>
            <p className="text-2xl font-bold text-slate-900">{formatTotalViews(totalViews)}+</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thumbnail</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video ID</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {videos.map((video) => (
                <tr key={video.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={video.thumbnail} alt={video.title} className="w-16 h-12 object-cover rounded" />
                   </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{video.title}</div>
                   </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{video.channel}</div>
                   </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{video.views}</div>
                   </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{video.videoId}</code>
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(video)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
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
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingVideo ? 'Edit Video' : 'Add New Video'}
              </h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Auto-fetch section - only show for new videos */}
              {!editingVideo && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    🚀 Auto-fetch from YouTube URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="Paste YouTube URL or Video ID here..."
                      className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={handleAutoFetch}
                      disabled={isFetching}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isFetching ? 'Fetching...' : 'Auto Fetch'}
                    </button>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    Supports: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...
                  </p>
                </div>
              )}

              {/* Divider */}
              {!editingVideo && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or fill manually</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Video title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video ID *</label>
                <input
                  type="text"
                  name="videoId"
                  value={formData.videoId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., dQw4w9WgXcQ"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Found in YouTube URL: https://youtube.com/watch?v=<strong className="font-mono">VIDEO_ID</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Channel Name *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Views *</label>
                <input
                  type="text"
                  name="views"
                  value={formData.views}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 1.2M views"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image URL *</label>
                <input
                  type="text"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://images.unsplash.com/..."
                />
                {formData.thumbnail && (
                  <div className="mt-2">
                    <img src={formData.thumbnail} alt="Preview" className="w-32 h-24 object-cover rounded" />
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
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
                {editingVideo ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}